// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "dart:async" show Future, FutureOr;

import "package:meta/meta.dart" show protected;

import "../exception/f_exception.dart" show FException;
import "../exception/f_exception_disposing_failure.dart"
    show FExceptionDisposingFailure;
import "../exception/f_exception_invalid_operation.dart"
    show FExceptionInvalidOperation;
import "f_disposable.dart" show FDisposable;

abstract class FDisposableBase implements FDisposable {
  bool _disposed = false;
  Future<void>? _disposingFuture;

  // Error: Can't use 'FDisposableBase' as a mixin because it has constructors.
  // FDisposableBase()
  //     : _disposed = false,
  //       _disposingFuture = null;

  bool get disposed => this._disposed;

  bool get disposing => this._disposingFuture != null;

  @override
  Future<void> dispose() {
    return Future<void>.sync(() {
      if (this._disposed != true) {
        if (this._disposingFuture == null) {
          this._disposingFuture = Future<void>.value();
          final onDisposeResult = this.onDispose();
          if (onDisposeResult is Future<void>) {
            this._disposingFuture = this
                ._disposingFuture!
                .then((_) => onDisposeResult)
                .whenComplete(() {
              this._disposingFuture = null;
              this._disposed = true;
            });
            return this._disposingFuture;
          } else {
            this._disposed = true;
            this._disposingFuture = null;
          }
        } else {
          return this._disposingFuture;
        }
      }
    }).catchError((Object err) {
      final ex = FException.wrapIfNeeded(err);
      print(
        "Dispose method raised an error. This is unexpected behavior due dispose() should be exception safe. The error was bypassed.\n${ex.toString()}",
      );
      throw FExceptionDisposingFailure(ex, this);
    });
  }

  @protected
  FutureOr<void> onDispose();

  @protected
  void verifyNotDisposed() {
    if (this.disposed || this.disposing) {
      throw FExceptionInvalidOperation("Wrong operation on disposed object");
    }
  }
}
