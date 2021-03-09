// Copyright 2021, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import 'package:freemework/freemework.dart';

import 'FrameworkException.dart' show FrameworkException;

class AggregateException extends FrameworkException {
  static void throwIfNeeded(Iterable<FrameworkException> innerExceptions) {
    if (innerExceptions.isNotEmpty) {
      if (innerExceptions.length == 1) {
        throw innerExceptions.first;
      }
      throw AggregateException(innerExceptions);
    }
  }

  final Iterable<FrameworkException> innerExceptions;
  factory AggregateException(Iterable<FrameworkException> innerExceptions,
      [String message]) {
    assert(innerExceptions != null);
    assert(innerExceptions.isNotEmpty);
    return AggregateException._internal(
        message ?? innerExceptions.first.message, innerExceptions);
  }

  AggregateException._internal(
      String message, List<FrameworkException> innerExceptions)
      : innerExceptions = innerExceptions,
        super(message, innerExceptions.first);

  @override
  String toString() {
    return super.toString() +
        '\n' +
        innerExceptions.map((e) => e.toString()).join('\n');
  }
}
