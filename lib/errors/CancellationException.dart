// Copyright 2021, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import 'FreemeworkException.dart' show FreemeworkException;

class CancellationException extends FreemeworkException {
  ///
  /// An exception that hold stackTrace where a user activates operation cancellation.
  ///
  /// It slould be passed by cancellationToken uses code via `CancellationException.withCancellationOrigin`
  ///
  final CancellationException? cancellationOriginException;

  CancellationException([String? message])
      : cancellationOriginException = null,
        super(_messageFormatter(message));

  CancellationException.withCancellationOrigin(this.cancellationOriginException,
      [String? message])
      : super(_messageFormatter(message));

  static String _messageFormatter(String? message) =>
      message ?? 'An operation was cancelled by an user.';
}
