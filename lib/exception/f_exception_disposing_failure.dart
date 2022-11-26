// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "../lifecycle/f_disposable.dart" show FDisposable;

import "f_exception.dart" show FException;

class FExceptionDisposingFailure extends FException {
  final FDisposable disposable;

  FExceptionDisposingFailure(FException innerException, this.disposable)
      : super(
          "A dispose() method raised an error. This is unexpected behaviour due dispose() should be exception safe. See `innerException` and `disposable` properties for details.",
          innerException,
        );
}
