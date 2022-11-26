// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "dart:convert";

import "package:test/test.dart";

import "package:freemework/freemework.dart";

void main() {
  group("FException tests", () {
    setUp(() {});

    tearDown(() {});
    test("should NOT be instantable without inner errors", () {
      FException? testEx;
      try {
        throw FException("Inner2");
      } catch (ex0) {
        try {
          throw FException("Inner1", ex0 as FException);
        } catch (ex1) {
          try {
            throw FException("Main", ex1 as FException);
          } catch (ex2) {
            testEx = ex2 as FException;
          }
        }
      }

      expect(testEx, isNotNull);
      expect(testEx.message, equals("Main"));
      expect(testEx.innerException!.message, equals("Inner1"));
      expect(testEx.innerException!.innerException!.message, equals("Inner2"));
      expect(
          LineSplitter.split(testEx.toString()).first,
          equals(
            "FException: Main ---> FException: Inner1 ---> FException: Inner2",
          ));

      //
    });
  });
}
