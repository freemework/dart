// Copyright 2021, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import 'package:freemework/freemework.dart'
    show CancellationToken, ExecutionContext;
import 'package:test/test.dart'
    show
        equals,
        expect,
        group,
        isEmpty,
        isNot,
        isNotEmpty,
        isNotNull,
        setUp,
        tearDown,
        test;

void main() {
  group('ExecutionContext tests', () {
    ExecutionContext executionContext;

    setUp(() {
      executionContext = ExecutionContext.EMPTY;
    });

    tearDown(() {
      executionContext = null;
    });

    test('Default ExecutionContext should has cancel CancellationToken.DUMMY',
        () {
      expect(
          executionContext.cancellationToken, equals(CancellationToken.DUMMY));
    });

    test('Default ExecutionContext should has no Logger Properties', () {
      expect(executionContext.loggerProperties, isEmpty);
    });

    test('Inner ExecutionContext should produce new ExecutionContext by call WithLoggerProperty', () {
      final innerExecutionContext =
          executionContext.WithLoggerProperty('testName', 'testValue');
      expect(innerExecutionContext, isNotNull);
      expect(innerExecutionContext, isNot(equals(executionContext)));
    });

    test('Inner ExecutionContext should produce new ExecutionContext by call WithCancellationToken', () {
      final innerExecutionContext =
          executionContext.WithCancellationToken(_TestCancellationToken());
      expect(innerExecutionContext, isNotNull);
      expect(innerExecutionContext, isNot(equals(executionContext)));
    });

    test('Inner ExecutionContext should produce new logger property', () {
      final innerExecutionContext =
          executionContext.WithLoggerProperty('testName', 'testValue');
      expect(innerExecutionContext, isNotNull);
      expect(innerExecutionContext, isNot(equals(executionContext)));
      expect(innerExecutionContext.loggerProperties, isNotEmpty);
      expect(innerExecutionContext.loggerProperties.first.name, 'testName');
      expect(innerExecutionContext.loggerProperties.first.value, 'testValue');
    });

    test('Inner ExecutionContext should produce new cancellation token', () {
      final newCancellationToken = _TestCancellationToken();
      final innerExecutionContext =
          executionContext.WithCancellationToken(newCancellationToken);
      expect(innerExecutionContext.cancellationToken, equals(newCancellationToken));
    });
  });
}

class _TestCancellationToken implements CancellationToken {
  @override
  void addCancelListener(cb) {
    throw UnimplementedError();
  }

  @override
  bool get isCancellationRequested => throw UnimplementedError();

  @override
  void removeCancelListener(cb) => throw UnimplementedError();

  @override
  void throwIfCancellationRequested() => throw UnimplementedError();
}
