// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "../exception/f_exception.dart" show FException;
import "../exception/f_exception_aggregate.dart" show FExceptionAggregate;

import "f_cancellation_token.dart"
    show FCancellationToken, FCancellationTokenCallback;

///
/// Wrap several tokens as FCancellationToken
///
class FCancellationTokenAggregated implements FCancellationToken {
  final List<FCancellationToken> _innerTokens;
  final List<FCancellationTokenCallback> _cancelListeners = [];

  bool _isCancellationRequested;

  FCancellationTokenAggregated(List<FCancellationToken> tokens)
      : _innerTokens = List.unmodifiable(tokens),
        _isCancellationRequested = false {
    FCancellationTokenCallback? listener;
    listener = (exCancelled) {
      for (final innerToken in tokens) {
        innerToken.removeCancelListener(listener!);
      }
      this._isCancellationRequested = true;
      const List<FException> errors = [];
      if (this._cancelListeners.isNotEmpty) {
        // Release callback. We do not need its anymore
        final List<FCancellationTokenCallback> cancelListenersCopy =
            List.unmodifiable(this._cancelListeners);
        this._cancelListeners.clear();
        for (var cancelListener in cancelListenersCopy) {
          try {
            cancelListener(exCancelled);
          } catch (e) {
            errors.add(FException.wrapIfNeeded(e));
          }
        }
      }
      if (errors.isNotEmpty) {
        throw FExceptionAggregate(errors);
      }
    };

    for (final innerToken in tokens) {
      innerToken.addCancelListener(listener);
    }
  }

  ///
  /// Returns `true` if any of inner tokens requested cancellation
  ///
  @override
  bool get isCancellationRequested => this._isCancellationRequested;

  @override
  void addCancelListener(final FCancellationTokenCallback cb) {
    this._cancelListeners.add(cb);
  }

  @override
  void removeCancelListener(final FCancellationTokenCallback cb) {
    this._cancelListeners.remove(cb);
  }

  @override
  void throwIfCancellationRequested() {
    for (final innerToken in _innerTokens) {
      innerToken.throwIfCancellationRequested();
    }
  }
}
