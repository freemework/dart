// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "dart:async" show Future, FutureOr;

import "package:meta/meta.dart" show protected;

import "../exception/f_exception_invalid_operation.dart"
    show FExceptionInvalidOperation;
import "../execution_context/f_execution_context.dart" show FExecutionContext;

import "f_disposable_base.dart" show FDisposableBase;
import "f_initable.dart" show FInitable;

abstract class FInitableBase implements FInitable, FDisposableBase {
  bool? _initialized;
  Future<void>? _initializingFuture;
  bool? _disposed;
  Future<void>? _disposingFuture;
  late final FExecutionContext _initExecutionContext;

  bool get initialized {
    return _initialized != null && _initialized!;
  }

  bool get initializing {
    return _initializingFuture != null;
  }

  @override
  bool get disposed {
    return _disposed != null && _disposed!;
  }

  @override
  bool get disposing {
    return _disposingFuture != null;
  }

  @override
  Future<void> init(final FExecutionContext executionContext) {
    return Future<void>.sync(() {
      this.verifyNotDisposed();
      if (this._initialized != true) {
        if (this._initializingFuture == null) {
          this._initExecutionContext = executionContext;
          this._initializingFuture = Future<void>.value();
          final onInitializeResult = this.onInit();
          if (onInitializeResult is Future<void>) {
            this._initializingFuture = this
                ._initializingFuture!
                .then((_) => onInitializeResult)
                .whenComplete(() {
              this._initializingFuture = null;
              this._initialized = true;
            });
            return this._initializingFuture;
          } else {
            this._initialized = true;
            this._initializingFuture = null;
          }
        } else {
          return this._initializingFuture!;
        }
      }
    });
  }

  @override
  Future<void> dispose() {
    return Future<void>.sync(() {
      if (this.disposed != true) {
        if (this._disposingFuture == null) {
          if (this._initializingFuture != null) {
            this._disposingFuture = this
                ._initializingFuture!
                .then((_) => this.onDispose())
                .whenComplete(() {
              this._disposingFuture = null;
              this._disposed = true;
            });
            return this._disposingFuture;
          } else {
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
            } else {
              this._disposingFuture = null;
              this._disposed = true;
            }
            return this._disposingFuture;
          }
        } else {
          return this._disposingFuture;
        }
      }
    });
  }

  ///
  /// Override this method to insert own logic at initialize phase
  ///
  /// Note: this.initExecutionContext may be used here
  ///
  @protected
  FutureOr<void> onInit();

  ///
  /// Override this method to insert own logic at disposing phase
  ///
  /// Note: this.initExecutionContext may be used here
  ///
  @override
  @protected
  FutureOr<void> onDispose();

  ///
  /// @remark Defined as property to be able to use inside dispose()
  ///
  @protected
  FExecutionContext get initExecutionContext {
    if (!(this.initialized || this.initializing)) {
      throw FExceptionInvalidOperation(
          "Wrong operation. Cannot obtain initExecutionContext before call init().");
    }
    return this._initExecutionContext;
  }

  @protected
  void verifyInitialized() {
    if (!this.initialized) {
      throw FExceptionInvalidOperation(
          "Wrong operation on non-initialized object");
    }
  }

  @protected
  void verifyInitializedAndNotDisposed() {
    this.verifyInitialized();
    this.verifyNotDisposed();
  }

  @override
  @protected
  void verifyNotDisposed() {
    // if (this.disposed) {
    if (disposed || disposing) {
      throw FExceptionInvalidOperation("Wrong operation on disposed object");
    }
  }
}
