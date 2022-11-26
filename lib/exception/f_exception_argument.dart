// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "f_exception.dart" show FException;

class FExceptionArgument extends FException {
  factory FExceptionArgument([
    String? message,
    String? paramName,
    FException? innerException,
  ]) {
    if (paramName != null) {
      if (message != null) {
        return FExceptionArgument._(
            "Wrong argument '$paramName'. $message", innerException);
      } else {
        return FExceptionArgument._(
            "Wrong argument '$paramName'.", innerException);
      }
    } else {
      return FExceptionArgument._("Wrong argument", innerException);
    }
  }

  FExceptionArgument._(
    String message,
    FException? innerException,
  ) : super(message, innerException);
}
