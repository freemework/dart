// Copyright 2021, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import 'FreemeworkException.dart' show FreemeworkException;

class InvalidOperationException extends FreemeworkException {
  InvalidOperationException(
      [String message, FreemeworkException innerException])
      : super(message, innerException);
}