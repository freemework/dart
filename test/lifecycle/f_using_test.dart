// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "dart:async" show Completer, Future, FutureOr;

import "package:test/test.dart";

import "package:freemework/freemework.dart";

class _TestDisposable extends FDisposableBase {
  final Function? onDisposeCb;
  _TestDisposable([this.onDisposeCb]);

  @override
  FutureOr<void> onDispose() {
    if (onDisposeCb != null) {
      onDisposeCb!();
    }
  }
}

class _TestFailureDisposable extends FDisposableBase {
  final FException error;

  _TestFailureDisposable(final String errMessage)
      : error = FException(errMessage);

  @override
  Future<void> onDispose() {
    return Future<void>.error(error);
  }
}

class _TestInitable extends FInitableBase {
  @override
  FutureOr<void> onInit() {}
  @override
  FutureOr<void> onDispose() {}
}

Future<void> _nextTick() async {
  await Future<void>.microtask(() {});
}

void main() {
  group("Fusing tests", () {
    setUp(() {});

    tearDown(() {});

    test("Should pass Future result to worker", () async {
      final disposable = _TestDisposable();
      bool executed = false;
      await fusing(
        FExecutionContext.emptyExecutionContext,
        (_) => disposable,
        (ct, instance) {
          executed = true;
          expect(disposable, same(instance));
        },
      );
      expect(executed, isTrue);
      expect(disposable.disposed, isTrue);
      expect(disposable.disposing, isFalse);
    });
    test(
        "Should pass factory result to worker (result is instance of Disposable)",
        () async {
      FDisposableBase? disposable;
      bool executed = false;
      await fusing(
        FExecutionContext.emptyExecutionContext,
        (_) => disposable = _TestDisposable(),
        (ct, instance) {
          executed = true;
          expect(disposable, same(instance));
        },
      );
      expect(executed, isTrue);
      expect(disposable!.disposed, isTrue);
      expect(disposable!.disposing, isFalse);
    });
    test(
        "Should pass factory result to worker (resource is instance of Future<Disposable>)",
        () async {
      FDisposableBase? disposable;
      bool executed = false;
      await fusing(
        FExecutionContext.emptyExecutionContext,
        (_) => Future.value(disposable = _TestDisposable()),
        (ct, instance) {
          executed = true;
          expect(disposable, same(instance));
        },
      );
      expect(executed, isTrue);
      expect(disposable!.disposed, isTrue);
      expect(disposable!.disposing, isFalse);
    });
    test("Should handle and execure worker's Future", () async {
      FDisposableBase? disposable;
      bool executed = false;
      await fusing(
        FExecutionContext.emptyExecutionContext,
        (_) => Future.value(disposable = _TestDisposable()),
        (ct, instance) {
          // Create new NON-Started task
          return Future<void>.value().then(
            (_) {
              executed = true;
              expect(disposable, same(instance));
            },
          );
        },
      );
      expect(executed, isTrue);
      expect(disposable!.disposed, isTrue);
      expect(disposable!.disposing, isFalse);
    });
    test("Should wait for execute Future-worker before call dispose()",
        () async {
      FDisposableBase? disposable;
      bool executed = false;

      final callSequence = <String>[];
      disposeCallback() {
        callSequence.add("dispose");
      }

      await fusing(
        FExecutionContext.emptyExecutionContext,
        (_) => disposable = _TestDisposable(disposeCallback),
        (ct, instance) async {
          executed = true;
          expect(disposable, same(instance));

          await Future<void>.delayed(Duration(milliseconds: 25));
          // ignore: prefer_single_quotes
          callSequence.add("worker");
        },
      );
      expect(executed, isTrue);
      expect(disposable!.disposed, isTrue);
      expect(disposable!.disposing, isFalse);
      expect(callSequence.length, equals(2));
      expect(callSequence[0], equals("worker"));
      expect(callSequence[1], equals("dispose"));
    });
    test("Should fail if dispose() raise an error", () async {
      bool executed = false;

      dynamic expectedError;

      try {
        await fusing(
          FExecutionContext.emptyExecutionContext,
          (_) => _TestFailureDisposable("Expected abnormal error"),
          (ct, instance) {
            executed = true;
          },
        );
      } catch (e) {
        expectedError = e;
      }

      expect(executed, isTrue);
      expect(expectedError, isA<FExceptionDisposingFailure>());
      expect(
        (expectedError as FExceptionDisposingFailure).innerException!.message,
        equals("Expected abnormal error"),
      );
    });
    test("Should fail with worker's error", () async {
      final disposable = _TestDisposable();
      bool executed = false;
      dynamic expectedError;
      try {
        await fusing(
          FExecutionContext.emptyExecutionContext,
          (_) => disposable,
          (ct, instance) {
            executed = true;
            throw FException("Test ERROR");
          },
        );
      } catch (e) {
        expectedError = e;
      }
      expect(expectedError, isNotNull);
      expect(expectedError, isA<FException>());
      expect((expectedError! as FException).message, equals("Test ERROR"));

      expect(executed, isTrue);
      expect(disposable.disposed, isTrue);
      expect(disposable.disposing, isFalse);
    });
    test("Should fail with worker's reject", () async {
      final disposable = _TestDisposable();
      bool executed = false;
      dynamic expectedError;
      try {
        await fusing(
          FExecutionContext.emptyExecutionContext,
          (FExecutionContext _) => disposable,
          (ct, instance) {
            executed = true;
            return Future<void>.error(FException("Test ERROR"));
          },
        );
      } catch (e) {
        expectedError = e;
      }
      expect(expectedError, isNotNull);
      expect(expectedError, isA<FException>());
      expect((expectedError! as FException).message, equals("Test ERROR"));

      expect(executed, isTrue);
      expect(disposable.disposed, isTrue);
      expect(disposable.disposing, isFalse);
    });
    test("Fusing test `Future<void> onDispose()`", () async {
      final defer = Completer<int>();
      bool usingResolved = false;
      final usingFuture = fusing(
        FExecutionContext.emptyExecutionContext,
        (_) => _TestDisposable(),
        (ct, instance) => defer.future,
      ).then((v) {
        usingResolved = true;
        return v;
      });

      expect(usingResolved, isFalse);
      await _nextTick();
      expect(usingResolved, isFalse);
      defer.complete(42);
      expect(usingResolved, isFalse);
      await _nextTick();
      await _nextTick();
      expect(usingResolved, isTrue);
      final result = await usingFuture;
      expect(result, equals(42));
    });
    test("Should be able to use CancellationToken on init phase", () async {
      final cts = FCancellationTokenSourceManual();
      final FCancellationToken token = cts.token;

      cts.cancel();

      final disposable = _TestDisposable();
      dynamic err;
      try {
        await fusing(
          FCancellationExecutionContext(
              FExecutionContext.emptyExecutionContext, token),
          (executionContext) {
            FCancellationExecutionContext.of(executionContext)
                .cancellationToken
                .throwIfCancellationRequested();
            return disposable;
          },
          (ct, instance) {
            // Do nothing
          },
        );
      } catch (e) {
        err = e;
      }

      expect(err, isNotNull);
      expect(err, isA<FCancellationException>());
    });
    test("Should be able to use CancellationToken on worker phase", () async {
      final cts = FCancellationTokenSourceManual();
      final FCancellationToken token = cts.token;

      bool onDisposeCalled = false;
      final disposable = _TestDisposable(() {
        onDisposeCalled = true;
      });

      dynamic err;
      try {
        await fusing(
          FCancellationExecutionContext(
              FExecutionContext.emptyExecutionContext, token),
          (executionContext) {
            cts.cancel();
            return disposable;
          },
          (executionContext, instance) {
            FCancellationExecutionContext.of(executionContext)
                .cancellationToken
                .throwIfCancellationRequested();
            // Do nothing
          },
        );
      } catch (e) {
        err = e;
      }

      expect(err, isNotNull);
      expect(err, isA<FCancellationException>());
      expect(onDisposeCalled, isTrue);
    });
    test("Should call init() for Initable", () async {
      final initable = _TestInitable();
      bool executedAfterInit = false;
      await fusing(
        FExecutionContext.emptyExecutionContext,
        (_) => initable,
        (ct, instance) {
          executedAfterInit = initable.initialized;
          expect(initable, same(instance));
        },
      );

      expect(executedAfterInit, isTrue);
      expect(initable.initialized, isTrue);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isTrue);
      expect(initable.disposing, isFalse);
    });
  });
}
