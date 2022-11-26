// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "package:collection/collection.dart" show DeepCollectionEquality;

import "package:test/test.dart";

import "package:freemework/freemework.dart";

class _TestExecutionContext extends FExecutionContext {
  const _TestExecutionContext(FExecutionContext prevContext)
      : super(prevContext);
}

void main() {
  group("FExecutionContext tests", () {
    setUp(() {});

    tearDown(() {});

    test("should be instantable without inner errors", () {
      FExceptionAggregate([]); // no expection expected
    });

    test("Empty execution context should NOT have prevContext", () {
      final FExecutionContext emptyCtx =
          FExecutionContext.emptyExecutionContext;
      expect(emptyCtx.prevContext, isNull);
    });

    test("Cancellation execution context should be resolved on head of chain",
        () {
      final FExecutionContext emptyCtx =
          FExecutionContext.emptyExecutionContext;
      final FExecutionContext cancellationCtx =
          FCancellationExecutionContext(emptyCtx, FCancellationToken.dummy);

      final FCancellationExecutionElement element =
          FCancellationExecutionContext.of(cancellationCtx);
      expect(element.owner, same(cancellationCtx));
      expect(element.cancellationToken, same(FCancellationToken.dummy));
    });

    test("Cancellation execution context should be resolved on chain", () {
      final FExecutionContext emptyCtx =
          FExecutionContext.emptyExecutionContext;
      final FExecutionContext cancellationCtx =
          FCancellationExecutionContext(emptyCtx, FCancellationToken.dummy);
      final stubCtx = _TestExecutionContext(cancellationCtx);

      final FCancellationExecutionElement element =
          FCancellationExecutionContext.of(stubCtx);
      expect(element.owner, same(cancellationCtx));
      expect(element.cancellationToken, same(FCancellationToken.dummy));
    });

    test("Cancellation execution context should aggregate tokens", () {
      final FExecutionContext emptyCtx =
          FExecutionContext.emptyExecutionContext;

      final FCancellationTokenSource cts1 = FCancellationTokenSourceManual();
      final FCancellationTokenSource cts2 = FCancellationTokenSourceManual();

      final FCancellationExecutionContext cancellationCtx1 =
          FCancellationExecutionContext(emptyCtx, cts1.token);
      final FCancellationExecutionContext cancellationCtx2 =
          FCancellationExecutionContext(cancellationCtx1, cts2.token, true);
      final stubCtx = _TestExecutionContext(cancellationCtx2);

      final FCancellationExecutionElement element =
          FCancellationExecutionContext.of(stubCtx);

      expect(element.owner, same(cancellationCtx2));
      expect(element.cancellationToken, isNot(FCancellationToken.dummy));
      expect(element.cancellationToken, isNot(FCancellationToken.dummy));
      expect(element.cancellationToken, isA<FCancellationTokenAggregated>());
    });

    test(
        "LoggerProperties execution context should be resolved on head of chain",
        () {
      final FLoggerLabels loggerLabels = {};

      final FExecutionContext emptyCtx =
          FExecutionContext.emptyExecutionContext;
      final FExecutionContext loggerCtx =
          FLoggerLabelsExecutionContext(emptyCtx, loggerLabels);

      final FLoggerLabelsExecutionElement? element =
          FLoggerLabelsExecutionContext.of(loggerCtx);
      expect(element, isNotNull);
      expect(element!.owner, same(loggerCtx));
      expect(
        DeepCollectionEquality().equals(
          element.loggerLabels,
          loggerLabels,
        ),
        true,
      );
    });

    // test("LoggerProperties execution context should be resolved on chain", () {
    //   final loggerLabels = <FLoggerProperty>[];

    //   final FExecutionContext emptyCtx = FExecutionContext.Empty;
    //   final FExecutionContext loggerCtx =
    //       FExecutionContextLoggerProperties(emptyCtx, loggerLabels);
    //   final stubCtx = _TestExecutionContext(loggerCtx);

    //   final FExecutionElementLoggerProperties element =
    //       FExecutionContextLoggerProperties.of(stubCtx);
    //   expect(element.owner, same(loggerCtx));
    //   expect(
    //     ListEquality<FLoggerProperty>().equals(
    //       element.loggerLabels.toList(),
    //       loggerLabels,
    //     ),
    //     true,
    //   );
    // });

    // test(
    //     "LoggerProperties execution context should instantiate from logger context",
    //     () {
    //   final prop1 = FLoggerProperty("data", "41");
    //   final prop2 = FLoggerProperty("data", "42");

    //   final loggerLabels = <FLoggerProperty>[prop1];

    //   final FExecutionContext emptyCtx = FExecutionContext.Empty;
    //   final FExecutionContext loggerCtx =
    //       FExecutionContextLoggerProperties(emptyCtx, loggerLabels);
    //   final FExecutionContext loggerWithPropertiesCtx =
    //       FExecutionContextLoggerProperties(loggerCtx, [
    //     prop2,
    //   ]);
    //   final stubCtx = _TestExecutionContext(loggerWithPropertiesCtx);

    //   final FExecutionElementLoggerProperties element =
    //       FExecutionContextLoggerProperties.of(stubCtx);
    //   expect(element.owner, same(loggerWithPropertiesCtx));
    //   expect(
    //     ListEquality<FLoggerProperty>().equals(
    //       element.loggerLabels.toList(),
    //       [
    //         prop2,
    //         prop1,
    //       ],
    //     ),
    //     true,
    //   );
    // });
  });
}
