// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "package:test/test.dart";

import "package:freemework/freemework.dart";

void main() {
  group("FCancellationTokenAggregated tests", () {
    setUp(() {});

    tearDown(() {});

    test("Should not cancel", () async {
      final cts1 = FCancellationTokenSourceManual();
      final cts2 = FCancellationTokenSourceManual();

      final token = FCancellationTokenAggregated([cts1.token, cts2.token]);

      expect(token.isCancellationRequested, isFalse);
    });

    test("Should cancel by first token", () async {
      bool cancel = false;

      final cts1 = FCancellationTokenSourceManual();
      final cts2 = FCancellationTokenSourceManual();

      final token = FCancellationTokenAggregated([cts1.token, cts2.token]);

      token.addCancelListener((_) {
        cancel = true;
      });

      cts1.cancel();

      expect(cancel, isTrue);
    });

    test("Should cancel by first token #2", () async {
      final cts1 = FCancellationTokenSourceManual();
      final cts2 = FCancellationTokenSourceManual();

      final token = FCancellationTokenAggregated([cts1.token, cts2.token]);

      cts1.cancel();

      expect(token.isCancellationRequested, isTrue);
    });

    test("Should cancel by second token", () async {
      bool cancel = false;

      final cts1 = FCancellationTokenSourceManual();
      final cts2 = FCancellationTokenSourceManual();

      final token = FCancellationTokenAggregated([cts1.token, cts2.token]);

      token.addCancelListener((_) {
        cancel = true;
      });

      cts2.cancel();

      expect(cancel, isTrue);
    });

    test("Should cancel by second token #2", () async {
      final cts1 = FCancellationTokenSourceManual();
      final cts2 = FCancellationTokenSourceManual();

      final token = FCancellationTokenAggregated([cts1.token, cts2.token]);

      cts2.cancel();

      expect(token.isCancellationRequested, isTrue);
    });

    test("Should be able to removeCancelListener", () async {
      bool cancel = false;

      final cts1 = FCancellationTokenSourceManual();
      final cts2 = FCancellationTokenSourceManual();

      final token = FCancellationTokenAggregated([cts1.token, cts2.token]);

      listener(FCancellationException _) {
        cancel = true;
      }

      token.addCancelListener(listener);
      token.removeCancelListener(listener);

      cts2.cancel();

      expect(cancel, isFalse);
    });

    test("Should call cancel callback once", () async {
      int cancelCount = 0;

      final cts1 = FCancellationTokenSourceManual();
      final cts2 = FCancellationTokenSourceManual();

      final token = FCancellationTokenAggregated([cts1.token, cts2.token]);

      token.addCancelListener((_) {
        ++cancelCount;
      });

      cts1.cancel();
      cts2.cancel();

      expect(
        cancelCount,
        equals(1),
        reason: "Cancel callback should call once",
      );
    });

    test("Should throw if cancel", () async {
      final cts1 = FCancellationTokenSourceManual();
      final cts2 = FCancellationTokenSourceManual();

      final token = FCancellationTokenAggregated([cts1.token, cts2.token]);

      cts1.cancel();

      dynamic expectedError;
      try {
        token.throwIfCancellationRequested();
      } catch (e) {
        expectedError = e;
      }

      expect(expectedError, isNotNull);
      expect(expectedError, isA<FCancellationException>());
    });
  });
}
