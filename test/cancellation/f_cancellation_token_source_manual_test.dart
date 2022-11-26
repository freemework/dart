// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "package:test/test.dart";

import "package:freemework/freemework.dart";

void main() {
  group("FCancellationTokenSourceManual tests", () {
    setUp(() {});

    tearDown(() {});

    test("Should cancel two listeners", () async {
      bool cancel1 = false;
      bool cancel2 = false;

      final cts = FCancellationTokenSourceManual();

      final FCancellationToken token = cts.token;

      token.addCancelListener((_) {
        cancel1 = true;
      });
      token.addCancelListener((_) {
        cancel2 = true;
      });

      cts.cancel();

      expect(cancel1, isTrue);
      expect(cancel2, isTrue);
    });

    test("Should call cancel callback once", () async {
      int cancelCount = 0;

      final cts = FCancellationTokenSourceManual();

      cts.token.addCancelListener((_) {
        ++cancelCount;
      });

      cts.cancel();
      cts.cancel();

      expect(
        cancelCount,
        equals(1),
        reason: "Cancel callback should call once",
      );
    });
  });
}
