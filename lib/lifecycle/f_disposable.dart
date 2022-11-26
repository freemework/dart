// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "dart:async" show Future;

import "../exception/f_exception.dart" show FException;
import "../exception/f_exception_aggregate.dart" show FExceptionAggregate;

abstract class FDisposable {
  Future<void> dispose();

  static Future<void> disposeAll(final Iterable<FDisposable> instances) async {
    final innerExceptions = <FException>[];
    for (final instance in instances) {
      try {
        await instance.dispose();
      } catch (e) {
        innerExceptions.add(FException.wrapIfNeeded(e));
      }
    }
    FExceptionAggregate.throwIfNeeded(innerExceptions);
  }

  // const FDisposable._(); // disallow extends (allow implements only)
}
