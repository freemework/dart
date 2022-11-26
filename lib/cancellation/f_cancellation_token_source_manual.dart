// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "../exception/f_exception.dart" show FException;
import "../exception/f_exception_aggregate.dart" show FExceptionAggregate;

import "f_cancellation_exception.dart" show FCancellationException;
import "f_cancellation_token.dart"
    show FCancellationToken, FCancellationTokenCallback;
import "f_cancellation_token_source.dart" show FCancellationTokenSource;

class FCancellationTokenSourceManual implements FCancellationTokenSource {
  final List<FCancellationTokenCallback> _cancelListeners;
  bool _isCancellationRequested = false;

  FCancellationTokenSourceManual() : _cancelListeners = [];

  @override
  FCancellationToken get token => _Token(this);

  @override
  bool get isCancellationRequested => _isCancellationRequested;

  @override
  void cancel() {
    if (_isCancellationRequested) {
      // Prevent to call listeners twice
      return;
    }
    _isCancellationRequested = true;

    if (_cancelListeners.isNotEmpty) {
      FCancellationException cancellationException;
      try {
        throw FCancellationException();
      } catch (e) {
        // Got stack trace in this way
        cancellationException = e as FCancellationException;
      }

      final errors = <FException>[];

      // Release callback. We do not need its anymore
      final cancelListeners =
          List<FCancellationTokenCallback>.from(_cancelListeners);
      for (final cancelListener in cancelListeners) {
        try {
          cancelListener(cancellationException);
        } catch (e) {
          errors.add(FException.wrapIfNeeded(e));
        }
      }

      FExceptionAggregate.throwIfNeeded(errors);
    }
  }

  void _addCancelListener(FCancellationTokenCallback cb) {
    _cancelListeners.add(cb);
  }

  void _removeCancelListener(FCancellationTokenCallback cb) {
    _cancelListeners.remove(cb);
  }

  void _throwIfCancellationRequested() {
    if (_isCancellationRequested) {
      throw FCancellationException();
    }
  }
}

class _Token implements FCancellationToken {
  final FCancellationTokenSourceManual _owner;

  _Token(this._owner);

  @override
  bool get isCancellationRequested => _owner.isCancellationRequested;

  @override
  void addCancelListener(FCancellationTokenCallback cb) {
    _owner._addCancelListener(cb);
  }

  @override
  void removeCancelListener(FCancellationTokenCallback cb) {
    _owner._removeCancelListener(cb);
  }

  @override
  void throwIfCancellationRequested() {
    _owner._throwIfCancellationRequested();
  }
}
// import { FException, FExceptionAggregate, FCancellationException } from "../exception";

// import { FCancellationToken } from "./f_cancellation_token";
// import { FCancellationTokenSource } from "./FCancellationTokenSource";

// export class FCancellationTokenSourceManual implements FCancellationTokenSource {
// 	private readonly _token: FCancellationToken;
// 	private readonly _cancelListeners: Array<Function> = [];
// 	private _isCancellationRequested: boolean;

// 	public constructor() {
// 		this._isCancellationRequested = false;
// 		const self = this;
// 		this._token = {
// 			get isCancellationRequested() { return self.isCancellationRequested; },
// 			addCancelListener(cb) { self.addCancelListener(cb); },
// 			removeCancelListener(cb) { self.removeCancelListener(cb); },
// 			throwIfCancellationRequested() { self.throwIfCancellationRequested(); }
// 		};
// 	}

// 	public get token(): FCancellationToken { return this._token; }
// 	public get isCancellationRequested(): boolean { return this._isCancellationRequested; }

// 	public cancel(): void {
// 		if (this._isCancellationRequested) {
// 			// Prevent to call listeners twice
// 			return;
// 		}
// 		this._isCancellationRequested = true;
// 		const errors: Array<FException> = [];
// 		if (this._cancelListeners.length > 0) {
// 			// Release callback. We do not need its anymore
// 			const cancelListeners = this._cancelListeners.splice(0);
// 			cancelListeners.forEach(cancelListener => {
// 				try {
// 					cancelListener();
// 				} catch (e) {
// 					errors.push(FException.wrapIfNeeded(e));
// 				}
// 			});
// 		}
// 		if (errors.length > 0) {
// 			throw new FExceptionAggregate(errors);
// 		}
// 	}

// 	private addCancelListener(cb: Function): void {
// 		this._cancelListeners.push(cb);
// 	}

// 	private removeCancelListener(cb: Function): void {
// 		const cbIndex = this._cancelListeners.indexOf(cb);
// 		if (cbIndex !== -1) {
// 			this._cancelListeners.splice(cbIndex, 1);
// 		}
// 	}

// 	private throwIfCancellationRequested(): void {
// 		if (this.isCancellationRequested) {
// 			throw new FCancellationException();
// 		}
// 	}
// }
