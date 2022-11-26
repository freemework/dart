// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "f_cancellation_exception.dart" show FCancellationException;

abstract class FCancellationToken {
  ///
  /// Returns a dummy CancellationToken value.
  /// This cancellation token cannot be cancelled.
  /// * all methods do nothing
  /// * a property `isCancellationRequested` always returns `false`
  ///
  static const FCancellationToken dummy = _DummyCancellationToken();

  bool get isCancellationRequested;
  void addCancelListener(FCancellationTokenCallback cb);
  void removeCancelListener(FCancellationTokenCallback cb);
  void throwIfCancellationRequested();
  const FCancellationToken();
}

typedef FCancellationTokenCallback = void Function(FCancellationException);

class _DummyCancellationToken extends FCancellationToken {
  const _DummyCancellationToken();

  @override
  void addCancelListener(final FCancellationTokenCallback cb) {/*bypass*/}

  @override
  bool get isCancellationRequested => false;

  @override
  void removeCancelListener(final FCancellationTokenCallback cb) {/*bypass*/}

  @override
  void throwIfCancellationRequested() {/*bypass*/}
}
