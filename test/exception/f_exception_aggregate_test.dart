// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "dart:convert" show LineSplitter;

import "package:test/test.dart";

import "package:freemework/freemework.dart";

void main() {
  group("FExceptionAggregate tests", () {
    setUp(() {});

    tearDown(() {});

    test("should be instantable without inner errors", () {
      FExceptionAggregate([]); // no expection expected
    });

    test("should be instantable without inner errors", () {
      FExceptionAggregate aggrError;
      try {
        throw FExceptionAggregate([], "my message");
      } catch (e) {
        aggrError = e as FExceptionAggregate;
      }
      expect(aggrError.message, equals("my message"));
    });

    test("should concatenate messages from inner errors", () {
      FException err1;
      FException err2;
      FException err3;

      try {
        throw FException("Err1");
      } catch (e) {
        err1 = e as FException;
      }
      try {
        throw FException("Err2");
      } catch (e) {
        err2 = e as FException;
      }
      try {
        throw FException("Err3");
      } catch (e) {
        err3 = e as FException;
      }

      FExceptionAggregate aggrError;
      try {
        throw FExceptionAggregate([err1, err2, err3]);
      } catch (e) {
        aggrError = e as FExceptionAggregate;
      }

      expect(aggrError.message, equals("One or more errors occurred."));
      expect(
          LineSplitter.split(aggrError.toString()).first,
          equals(
            "FExceptionAggregate: One or more errors occurred. ---> FException: Err1",
          ));
    });
  });
}
