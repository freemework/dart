// Copyright 2021, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import 'FreemeworkException.dart' show FreemeworkException;

class AggregateException extends FreemeworkException {
  static void throwIfNeeded(Iterable<FreemeworkException> innerExceptions) {
    if (innerExceptions.isNotEmpty) {
      if (innerExceptions.length == 1) {
        throw innerExceptions.first;
      }
      throw AggregateException(innerExceptions);
    }
  }

  final Iterable<FreemeworkException> innerExceptions;
  factory AggregateException(Iterable<FreemeworkException> innerExceptions,
      [String message]) {
    assert(innerExceptions != null);
    assert(innerExceptions.isNotEmpty);
    return AggregateException._internal(
        message ?? innerExceptions.first.message, innerExceptions);
  }

  AggregateException._internal(
      String message, List<FreemeworkException> innerExceptions)
      : innerExceptions = innerExceptions,
        super(message, innerExceptions.first);

  @override
  String toString() {
    return super.toString() +
        '\n' +
        innerExceptions.map((e) => e.toString()).join('\n');
  }
}
