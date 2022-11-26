// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "../exception/f_exception.dart" show FException;

class FCancellationException extends FException {
  FCancellationException([String? message, FException? innerException])
      : super(_messageFormatter(message), innerException);

  static String _messageFormatter(String? message) =>
      message ?? "An operation was cancelled by an user.";
}
