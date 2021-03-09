// Copyright 2021, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import 'package:freemework/freemework.dart';

abstract class CancellationToken {
  static const CancellationToken DUMMY = _DummyCancellationToken();

  bool get isCancellationRequested;
  void addCancelListener(CancellationCallback cb);
  void removeCancelListener(CancellationCallback cb);
  void throwIfCancellationRequested();
  const CancellationToken();
}

typedef CancellationCallback = void Function(CancellationException);

class _DummyCancellationToken extends CancellationToken {
  const _DummyCancellationToken();

  @override
  void addCancelListener(CancellationCallback cb) {/*bypass*/}

  @override
  bool get isCancellationRequested => false;

  @override
  void removeCancelListener(CancellationCallback cb) {/*bypass*/}

  @override
  void throwIfCancellationRequested() {/*bypass*/}
}
