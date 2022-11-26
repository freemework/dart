// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "f_exception.dart" show FException;

class FExceptionAggregate extends FException {
  static void throwIfNeeded(final Iterable<FException> innerExceptions) {
    if (innerExceptions.isNotEmpty) {
      if (innerExceptions.length == 1) {
        throw innerExceptions.first;
      }
      throw FExceptionAggregate(innerExceptions);
    }
  }

  final List<FException> innerExceptions;
  factory FExceptionAggregate(final Iterable<FException> innerExceptions,
      [String? message]) {
    const defaultMessage = "One or more errors occurred.";
    return FExceptionAggregate._internal(
      message ?? defaultMessage,
      innerExceptions,
    );
  }

  FExceptionAggregate._internal(
      String? message, Iterable<FException> innerExceptions)
      : innerExceptions = List.unmodifiable(innerExceptions),
        super(
            message, innerExceptions.isNotEmpty ? innerExceptions.first : null);

  @override
  String toString() {
    final List<String> messages = [super.toString()];

    if (this.innerExceptions.isNotEmpty) {
      messages.addAll(this.innerExceptions.map((e) => e.toString()));
    }
    return messages.join("\n");
  }
}
