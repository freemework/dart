// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "dart:async" show Timer;

import "../exception/f_exception_invalid_operation.dart"
    show FExceptionInvalidOperation;

import "f_cancellation_token_source_manual.dart"
    show FCancellationTokenSourceManual;

class FCancellationTokenSourceTimeout extends FCancellationTokenSourceManual {
  Timer? _timeoutHandler;

  FCancellationTokenSourceTimeout(Duration timeout) {
    _timeoutHandler = Timer(timeout, _onTimer);
  }

  bool get isActive => _timeoutHandler != null;

  @override
  void cancel() {
    final timeoutHandler = _timeoutHandler;
    if (timeoutHandler != null) {
      timeoutHandler.cancel();
      _timeoutHandler = null;
    }
    super.cancel();
  }

  ///
  /// After call the method, the instance behaves is as `SimpleCancellationTokenSource`
  ///
  void preventTimeout() {
    final timeoutHandler = _timeoutHandler;
    if (timeoutHandler == null) {
      throw FExceptionInvalidOperation("Cannot prevent inactive timeout.");
    }

    timeoutHandler.cancel();
    _timeoutHandler = null;
  }

  void _onTimer() {
    if (_timeoutHandler != null) {
      _timeoutHandler = null;
    }
    super.cancel();
  }
}
