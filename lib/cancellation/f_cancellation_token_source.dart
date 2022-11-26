// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "f_cancellation_token.dart" show FCancellationToken;

abstract class FCancellationTokenSource {
  bool get isCancellationRequested;
  FCancellationToken get token;
  void cancel();
}
