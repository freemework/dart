// Copyright 2021, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

/*

$ dart run example/AggregateException_example.dart

workload failure with AggregateException
workload produce 3 errors.
workload inner error is "Exception: error1" (this is first error)
workload first error is "Exception: error1"
workload last error is "Exception: error3"

*/

import 'package:freemework/freemework.dart'
    show AggregateException, FreemeworkException;

void main() {
  try {
    workload();
  } catch (e) {
    if (e is AggregateException) {
      print('workload failure with AggregateException');
      print('workload produce ${e.innerExceptions.length} errors.');
      print('workload inner error is "${e.innerException!.message}" (this is first error)');
      print('workload first error is "${e.innerExceptions.first.message}"');
      print('workload last error is "${e.innerExceptions.last.message}"');
    }
  }
}

void workload() {
  final workers = <Function>[error1, error2, error3];
  final errors = <FreemeworkException>[];

  for (final worker in workers) {
    try {
      worker();
    } catch (e) {
      errors.add(FreemeworkException.wrapIfNeeded(e));
    }
  }

  AggregateException.throwIfNeeded(
      errors); // this will throw due errors.length > 0
}

void error1() {
  throw Exception('error1');
}

void error2() {
  throw Exception('error2');
}

void error3() {
  throw Exception('error3');
}
