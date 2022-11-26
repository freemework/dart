// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "dart:async" show Completer, Future, FutureOr, unawaited;

import "package:test/test.dart";

import "package:freemework/freemework.dart";

class _InheritDisposable extends FDisposableBase {
  final FutureOr<void>? onDisposeFuture;

  _InheritDisposable([this.onDisposeFuture]);

  @override
  // ignore: unnecessary_overrides
  void verifyNotDisposed() {
    super.verifyNotDisposed();
  }

  @override
  FutureOr<void> onDispose() {
    if (onDisposeFuture != null) {
      return onDisposeFuture;
    }
  }
}

class _InheritFailureDisposable extends FDisposableBase {
  final Error error = Error();

  @override
  Future<void> onDispose() {
    return Future<void>.error(error);
  }
}

class _MixedDisposable with FDisposableBase {
  FutureOr<void>? onDisposeFuture;

  @override
  // ignore: unnecessary_overrides
  void verifyNotDisposed() {
    super.verifyNotDisposed();
  }

  @override
  FutureOr<void> onDispose() {
    if (onDisposeFuture != null) {
      return onDisposeFuture;
    }
  }
}

class _MixedFailureDisposable with FDisposableBase {
  final Error error = Error();

  @override
  Future<void> onDispose() {
    return Future<void>.error(error);
  }
}

Future<void> _nextTick() async {
  await Future<void>.microtask(() {});
}

void main() {
  group("FDisposable tests", () {
    setUp(() {});

    tearDown(() {});

    test("Positive test `Future<void> onDispose()`", () async {
      final defer = Completer<void>();
      final disposable = _InheritDisposable(defer.future);
      expect(disposable.disposed, isFalse);
      expect(disposable.disposing, isFalse);

      disposable.verifyNotDisposed(); // should not raise an error

      bool disposablePromiseResolved = false;
      unawaited(disposable.dispose().then((_) {
        disposablePromiseResolved = true;
      }));

      expect(disposablePromiseResolved, isFalse);
      expect(() => disposable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      await _nextTick();

      expect(disposablePromiseResolved, isFalse);
      expect(() => disposable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      expect(disposable.disposed, isFalse);
      expect(disposable.disposing, isTrue);

      bool secondDisposablePromiseResolved = false;
      unawaited(disposable.dispose().then((_) {
        secondDisposablePromiseResolved = true;
      }));

      expect(secondDisposablePromiseResolved, isFalse);

      await _nextTick();

      expect(disposablePromiseResolved, isFalse);
      expect(secondDisposablePromiseResolved, isFalse);
      expect(() => disposable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));
      expect(disposable.disposed, isFalse);
      expect(disposable.disposing, isTrue);

      defer.complete();

      expect(disposablePromiseResolved, isFalse);
      expect(secondDisposablePromiseResolved, isFalse);
      expect(() => disposable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      await _nextTick();

      expect(disposablePromiseResolved, isTrue);
      expect(secondDisposablePromiseResolved, isTrue);
      expect(() => disposable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      expect(disposable.disposed, isTrue);
      expect(disposable.disposing, isFalse);

      bool thirdDisposablePromiseResolved = false;
      unawaited(disposable.dispose().then((_) {
        thirdDisposablePromiseResolved = true;
      }));
      expect(thirdDisposablePromiseResolved, isFalse);
      await _nextTick();
      expect(thirdDisposablePromiseResolved, isTrue);
    });

    test("Positive test `void onDispose()`", () async {
      final disposable = _InheritDisposable();
      expect(disposable.disposed, isFalse);
      expect(disposable.disposing, isFalse);

      disposable.verifyNotDisposed(); // should not raise an error

      final disposablePromise = disposable.dispose();

      expect(disposable.disposed, isTrue);
      expect(disposable.disposing, isFalse);

      expect(() => disposable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      await _nextTick();

      expect(() => disposable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      expect(disposable.disposed, isTrue);
      expect(disposable.disposing, isFalse);

      await disposablePromise;

      expect(() => disposable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      expect(disposable.disposed, isTrue);
      expect(disposable.disposing, isFalse);
    });

    test("Should throw error from dispose()", () async {
      final disposable = _InheritFailureDisposable();

      dynamic expectedError;
      try {
        await disposable.dispose();
      } catch (e) {
        expectedError = e;
      }

      expect(expectedError, isNotNull);
      expect(expectedError, isA<FExceptionDisposingFailure>());
      expect((expectedError as FExceptionDisposingFailure).innerException,
          isA<FExceptionNativeErrorWrapper>());
      expect(
          (expectedError.innerException as FExceptionNativeErrorWrapper)
              .nativeError,
          equals(disposable.error));
    });
  });

  group("FDisposable mixin tests", () {
    test("Positive test `Future<void> onDispose()`", () async {
      final defer = Completer<void>();
      final disposable = _MixedDisposable()..onDisposeFuture = defer.future;

      expect(disposable.disposed, isFalse);
      expect(disposable.disposing, isFalse);

      disposable.verifyNotDisposed(); // should not raise an error

      bool disposablePromiseResolved = false;
      unawaited(disposable.dispose().then((_) {
        disposablePromiseResolved = true;
      }));

      expect(disposablePromiseResolved, isFalse);
      expect(() => disposable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      await _nextTick();

      expect(disposablePromiseResolved, isFalse);
      expect(() => disposable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      expect(disposable.disposed, isFalse);
      expect(disposable.disposing, isTrue);

      bool secondDisposablePromiseResolved = false;
      unawaited(disposable.dispose().then((_) {
        secondDisposablePromiseResolved = true;
      }));

      expect(secondDisposablePromiseResolved, isFalse);

      await _nextTick();

      expect(disposablePromiseResolved, isFalse);
      expect(secondDisposablePromiseResolved, isFalse);
      expect(() => disposable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));
      expect(disposable.disposed, isFalse);
      expect(disposable.disposing, isTrue);

      defer.complete();

      expect(disposablePromiseResolved, isFalse);
      expect(secondDisposablePromiseResolved, isFalse);
      expect(() => disposable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      await _nextTick();

      expect(disposablePromiseResolved, isTrue);
      expect(secondDisposablePromiseResolved, isTrue);
      expect(() => disposable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      expect(disposable.disposed, isTrue);
      expect(disposable.disposing, isFalse);

      bool thirdDisposablePromiseResolved = false;
      unawaited(disposable.dispose().then((_) {
        thirdDisposablePromiseResolved = true;
      }));
      expect(thirdDisposablePromiseResolved, isFalse);
      await _nextTick();
      expect(thirdDisposablePromiseResolved, isTrue);
    });

    test("Positive test `void onDispose()`", () async {
      final disposable = _MixedDisposable();

      expect(disposable.disposed, isFalse);
      expect(disposable.disposing, isFalse);

      disposable.verifyNotDisposed(); // should not raise an error

      final disposablePromise = disposable.dispose();

      expect(disposable.disposed, isTrue);
      expect(disposable.disposing, isFalse);

      expect(() => disposable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      await _nextTick();

      expect(() => disposable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      expect(disposable.disposed, isTrue);
      expect(disposable.disposing, isFalse);

      await disposablePromise;

      expect(() => disposable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      expect(disposable.disposed, isTrue);
      expect(disposable.disposing, isFalse);
    });

    test("Should throw error from dispose()", () async {
      final disposable = _MixedFailureDisposable();

      dynamic expectedError;
      try {
        await disposable.dispose();
      } catch (e) {
        expectedError = e;
      }

      expect(expectedError, isNotNull);
      expect(expectedError, isA<FExceptionDisposingFailure>());
      expect((expectedError as FExceptionDisposingFailure).innerException,
          isA<FExceptionNativeErrorWrapper>());
      expect(
          (expectedError.innerException as FExceptionNativeErrorWrapper)
              .nativeError,
          equals(disposable.error));
    });
  });
}
