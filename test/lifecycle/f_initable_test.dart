// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "dart:async" show Completer, Future, FutureOr, unawaited;

import "package:test/test.dart";

import "package:freemework/freemework.dart"
    show FExceptionInvalidOperation, FExecutionContext, FInitableBase;

class _InheritInitable extends FInitableBase {
  final FutureOr<void>? onInitFuture;
  final FutureOr<void>? onDisposeFuture;

  _InheritInitable({
    this.onInitFuture,
    this.onDisposeFuture,
  });

  @override
  // ignore: unnecessary_overrides
  void verifyNotDisposed() {
    super.verifyNotDisposed();
  }

  @override
  // ignore: unnecessary_overrides
  void verifyInitializedAndNotDisposed() {
    super.verifyInitializedAndNotDisposed();
  }

  @override
  // ignore: unnecessary_overrides
  void verifyInitialized() {
    super.verifyInitialized();
  }

  @override
  FutureOr<void> onInit() {
    if (onInitFuture != null) {
      return onInitFuture;
    }
  }

  @override
  FutureOr<void> onDispose() {
    if (onDisposeFuture != null) {
      return onDisposeFuture;
    }
  }
}

class _InheritInitFailureInitable extends FInitableBase {
  final Error error = Error();

  @override
  Future<void> onInit() {
    return Future<void>.error(error);
  }

  @override
  Future<void> onDispose() {
    return Future<void>.value();
  }
}

class _InheritDisposeFailureInitable extends FInitableBase {
  final Error error = Error();

  @override
  Future<void> onInit() {
    return Future<void>.value();
  }

  @override
  Future<void> onDispose() {
    return Future<void>.error(error);
  }
}

class _MixedInitable with FInitableBase {
  FutureOr<void>? onInitFuture;
  FutureOr<void>? onDisposeFuture;

  @override
  // ignore: unnecessary_overrides
  void verifyInitialized() {
    super.verifyInitialized();
  }

  @override
  // ignore: unnecessary_overrides
  void verifyInitializedAndNotDisposed() {
    super.verifyInitializedAndNotDisposed();
  }

  @override
  // ignore: unnecessary_overrides
  void verifyNotDisposed() {
    super.verifyNotDisposed();
  }

  @override
  FutureOr<void> onInit() {
    if (onInitFuture != null) {
      return onInitFuture;
    }
  }

  @override
  FutureOr<void> onDispose() {
    if (onDisposeFuture != null) {
      return onDisposeFuture;
    }
  }
}

class _MixedInitFailureInitable with FInitableBase {
  final Error error = Error();

  @override
  FutureOr<void> onInit() {
    return Future<void>.error(error);
  }

  @override
  Future<void> onDispose() {
    return Future<void>.value();
  }
}

class _MixedDisposeFailureInitable with FInitableBase {
  final Error error = Error();

  @override
  FutureOr<void> onInit() {
    return Future<void>.value();
  }

  @override
  Future<void> onDispose() {
    return Future<void>.error(error);
  }
}

Future<void> _nextTick() async {
  await Future<void>.microtask(() {});
}

void main() {
  group("FInitable tests", () {
    setUp(() {});

    tearDown(() {});
    test("Positive test `Future<void> onInit()` and `Future<void> onDispose()`",
        () async {
      final initable = _InheritInitable();
      expect(initable.initialized, isFalse);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      initable.verifyNotDisposed(); // should not raise an error

      expect(() => initable.verifyInitialized(),
          throwsA(isA<FExceptionInvalidOperation>()));
      expect(() => initable.verifyInitializedAndNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      final initPromise =
          initable.init(FExecutionContext.emptyExecutionContext);

      expect(initable.initialized, isTrue);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      initable.verifyNotDisposed(); // should not raise an error
      initable.verifyInitialized(); // should not raise an error
      initable.verifyInitializedAndNotDisposed(); // should not raise an error

      await _nextTick();

      initable.verifyNotDisposed(); // should not raise an error
      initable.verifyInitialized(); // should not raise an error
      initable.verifyInitializedAndNotDisposed(); // should not raise an error

      expect(initable.initialized, isTrue);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      await initPromise;

      initable.verifyNotDisposed(); // should not raise an error
      initable.verifyInitialized(); // should not raise an error
      initable.verifyInitializedAndNotDisposed(); // should not raise an error

      expect(initable.initialized, isTrue);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      unawaited(initable.dispose());

      initable.verifyInitialized(); // should not raise an error

      expect(() => initable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));
      expect(() => initable.verifyInitializedAndNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      expect(initable.initialized, isTrue);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isTrue);
      expect(initable.disposing, isFalse);
    });

    test("Positive test `void onInit()` and `Future<void> onDispose()`",
        () async {
      final defer = Completer<void>();
      final initable = _InheritInitable(onDisposeFuture: defer.future);
      expect(initable.initialized, isFalse);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      initable.verifyNotDisposed(); // should not raise an error
      expect(() => initable.verifyInitialized(),
          throwsA(isA<FExceptionInvalidOperation>())); // should raise an error
      expect(() => initable.verifyInitializedAndNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>())); // should raise an error

      final initPromise =
          initable.init(FExecutionContext.emptyExecutionContext);

      expect(initable.initialized, isTrue);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      initable.verifyNotDisposed(); // should not raise an error
      initable.verifyInitialized(); // should not raise an error
      initable.verifyInitializedAndNotDisposed(); // should not raise an error

      await _nextTick();

      initable.verifyNotDisposed(); // should not raise an error
      initable.verifyInitialized(); // should not raise an error
      initable.verifyInitializedAndNotDisposed(); // should not raise an error

      expect(initable.initialized, isTrue);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      await initPromise;

      try {
        bool disposablePromiseResolved = false;
        unawaited(initable.dispose().then((_) {
          disposablePromiseResolved = true;
        }));

        expect(disposablePromiseResolved, isFalse);
        expect(() => initable.verifyInitializedAndNotDisposed(),
            throwsA(isA<FExceptionInvalidOperation>()));
        expect(() => initable.verifyNotDisposed(),
            throwsA(isA<FExceptionInvalidOperation>()));

        await _nextTick();

        expect(disposablePromiseResolved, isFalse);
        expect(() => initable.verifyInitializedAndNotDisposed(),
            throwsA(isA<FExceptionInvalidOperation>()));
        expect(() => initable.verifyNotDisposed(),
            throwsA(isA<FExceptionInvalidOperation>()));

        expect(initable.initialized, isTrue);
        expect(initable.initializing, isFalse);
        expect(initable.disposed, isFalse);
        expect(initable.disposing, isTrue);

        bool secondDisposablePromiseResolved = false;
        unawaited(initable.dispose().then((_) {
          secondDisposablePromiseResolved = true;
        }));

        expect(secondDisposablePromiseResolved, isFalse);

        await _nextTick();

        expect(disposablePromiseResolved, isFalse);
        expect(secondDisposablePromiseResolved, isFalse);
        expect(() => initable.verifyInitializedAndNotDisposed(),
            throwsA(isA<FExceptionInvalidOperation>()));
        expect(() => initable.verifyNotDisposed(),
            throwsA(isA<FExceptionInvalidOperation>()));
        expect(initable.initialized, isTrue);
        expect(initable.initializing, isFalse);
        expect(initable.disposed, isFalse);
        expect(initable.disposing, isTrue);

        defer.complete();

        expect(disposablePromiseResolved, isFalse);
        expect(secondDisposablePromiseResolved, isFalse);
        expect(() => initable.verifyInitializedAndNotDisposed(),
            throwsA(isA<FExceptionInvalidOperation>()));
        expect(() => initable.verifyNotDisposed(),
            throwsA(isA<FExceptionInvalidOperation>()));

        await _nextTick();

        expect(disposablePromiseResolved, isTrue);
        expect(secondDisposablePromiseResolved, isTrue);
        expect(() => initable.verifyInitializedAndNotDisposed(),
            throwsA(isA<FExceptionInvalidOperation>()));
        expect(() => initable.verifyNotDisposed(),
            throwsA(isA<FExceptionInvalidOperation>()));

        expect(initable.disposed, isTrue);
        expect(initable.disposing, isFalse);

        bool thirdDisposablePromiseResolved = false;
        unawaited(initable.dispose().then((_) {
          thirdDisposablePromiseResolved = true;
        }));
        expect(thirdDisposablePromiseResolved, isFalse);
        await _nextTick();
        expect(thirdDisposablePromiseResolved, isTrue);
      } finally {
        // onDisposePromise = null;
      }
    });

    test("Positive test `Future<void> onInit()` and `void onDispose()`",
        () async {
      final defer = Completer<void>();
      try {
        final initable = _InheritInitable(onInitFuture: defer.future);
        expect(initable.initialized, isFalse);
        expect(initable.initializing, isFalse);
        expect(initable.disposed, isFalse);
        expect(initable.disposing, isFalse);

        initable.verifyNotDisposed(); // should not raise an error
        expect(
            () => initable.verifyInitialized(),
            throwsA(
                isA<FExceptionInvalidOperation>())); // should raise an error
        expect(
            () => initable.verifyInitializedAndNotDisposed(),
            throwsA(
                isA<FExceptionInvalidOperation>())); // should raise an error

        unawaited(initable.init(FExecutionContext.emptyExecutionContext));

        expect(initable.initialized, isFalse);
        expect(initable.initializing, isTrue);
        expect(initable.disposed, isFalse);
        expect(initable.disposing, isFalse);

        defer.complete();

        expect(initable.initialized, isFalse);
        expect(initable.initializing, isTrue);
        expect(initable.disposed, isFalse);
        expect(initable.disposing, isFalse);

        unawaited(initable.dispose());

        await _nextTick();

        expect(initable.initialized, isTrue);
        expect(initable.initializing, isFalse);
        expect(initable.disposed, isTrue);
        expect(initable.disposing, isFalse);
      } finally {
        // onInitPromise = null;
      }
    });

    test("Positive test `Future<void> onInit()` and `Future<void> onDispose()`",
        () async {
      final initDefer = Completer<void>();
      final disposeDefer = Completer<void>();
      final initable = _InheritInitable(
          onInitFuture: initDefer.future, onDisposeFuture: disposeDefer.future);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      initable.verifyNotDisposed(); // should not raise an error

      try {
        bool initablePromiseResolved = false;
        bool disposablePromiseResolved = false;
        unawaited(
            initable.init(FExecutionContext.emptyExecutionContext).then((_) {
          initablePromiseResolved = true;
        }));
        unawaited(initable.dispose().then((_) {
          disposablePromiseResolved = true;
        }));

        expect(initablePromiseResolved, isFalse);
        expect(disposablePromiseResolved, isFalse);
        expect(() => initable.verifyNotDisposed(),
            throwsA(isA<FExceptionInvalidOperation>()));

        await _nextTick();

        expect(initablePromiseResolved, isFalse);
        expect(disposablePromiseResolved, isFalse);
        expect(() => initable.verifyNotDisposed(),
            throwsA(isA<FExceptionInvalidOperation>()));

        expect(initable.initialized, isFalse);
        expect(initable.disposed, isFalse);
        expect(initable.initializing, isTrue);
        expect(initable.disposing, isTrue);

        bool secondDisposablePromiseResolved = false;
        unawaited(initable.dispose().then((_) {
          secondDisposablePromiseResolved = true;
        }));

        expect(secondDisposablePromiseResolved, isFalse);

        await _nextTick();

        expect(disposablePromiseResolved, isFalse);
        expect(secondDisposablePromiseResolved, isFalse);
        expect(() => initable.verifyNotDisposed(),
            throwsA(isA<FExceptionInvalidOperation>()));
        expect(initable.disposed, isFalse);
        expect(initable.disposing, isTrue);

        initDefer.complete();
        disposeDefer.complete();

        expect(disposablePromiseResolved, isFalse);
        expect(secondDisposablePromiseResolved, isFalse);
        expect(() => initable.verifyNotDisposed(),
            throwsA(isA<FExceptionInvalidOperation>()));

        await _nextTick();

        expect(disposablePromiseResolved, isTrue);
        expect(secondDisposablePromiseResolved, isTrue);
        expect(() => initable.verifyNotDisposed(),
            throwsA(isA<FExceptionInvalidOperation>()));

        expect(initable.disposed, isTrue);
        expect(initable.disposing, isFalse);

        bool thirdDisposablePromiseResolved = false;
        unawaited(initable.dispose().then((_) {
          thirdDisposablePromiseResolved = true;
        }));
        expect(thirdDisposablePromiseResolved, isFalse);
        await _nextTick();
        expect(thirdDisposablePromiseResolved, isTrue);
      } finally {
        // onDisposePromise = null;
      }
    });

    test("Positive test `void onDispose()`", () async {
      final initable = _InheritInitable();
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      initable.verifyNotDisposed(); // should not raise an error

      final disposablePromise = initable.dispose();

      expect(initable.disposed, isTrue);
      expect(initable.disposing, isFalse);

      expect(() => initable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      await _nextTick();

      expect(() => initable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      expect(initable.disposed, isTrue);
      expect(initable.disposing, isFalse);

      await disposablePromise;

      expect(() => initable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      expect(initable.disposed, isTrue);
      expect(initable.disposing, isFalse);
    });

    test("Twice call of init()", () async {
      final initable = _InheritInitable(onInitFuture: Future.value());

      final initPromise1 =
          initable.init(FExecutionContext.emptyExecutionContext);

      await _nextTick();

      initable.verifyNotDisposed(); // should not raise an error
      initable.verifyInitialized(); // should not raise an error
      initable.verifyInitializedAndNotDisposed(); // should not raise an error

      expect(initable.initialized, isTrue);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      await initPromise1;

      initable.verifyNotDisposed(); // should not raise an error
      initable.verifyInitialized(); // should not raise an error
      initable.verifyInitializedAndNotDisposed(); // should not raise an error

      expect(initable.initialized, isTrue);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      bool isSuccessed = false;
      final initPromise2 = initable
          .init(FExecutionContext.emptyExecutionContext)
          .whenComplete(() {
        isSuccessed = true;
      });
      await _nextTick();
      expect(isSuccessed, isTrue);
      await initPromise2;
      await initable.dispose();
    });

    test("Should throw error from init()", () async {
      final initable = _InheritInitFailureInitable();

      dynamic expectedError;
      try {
        await initable.init(FExecutionContext.emptyExecutionContext);
      } catch (e) {
        expectedError = e;
      }

      expect(expectedError, isNotNull);
      expect(expectedError, isA<Error>());
      expect(expectedError, equals(initable.error));
    });

    test("Should throw error from dispose()", () async {
      final initable = _InheritDisposeFailureInitable();

      await initable.init(FExecutionContext.emptyExecutionContext);

      dynamic expectedError;
      try {
        await initable.dispose();
      } catch (e) {
        expectedError = e;
      }

      expect(expectedError, isNotNull);
      expect(expectedError, isA<Error>());
      expect(expectedError, equals(initable.error));
    });
  });

  group("FInitable mixin tests", () {
    test("Positive test `void onInit()` and `void onDispose()`", () async {
      final initable = _MixedInitable();
      expect(initable.initialized, isFalse);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      initable.verifyNotDisposed(); // should not raise an error
      expect(() => initable.verifyInitialized(),
          throwsA(isA<FExceptionInvalidOperation>()));
      // should raise an error
      expect(() => initable.verifyInitializedAndNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));
      // should raise an error

      final initPromise =
          initable.init(FExecutionContext.emptyExecutionContext);

      expect(initable.initialized, isTrue);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      initable.verifyNotDisposed(); // should not raise an error
      initable.verifyInitialized(); // should not raise an error
      initable.verifyInitializedAndNotDisposed(); // should not raise an error

      await _nextTick();

      initable.verifyNotDisposed(); // should not raise an error
      initable.verifyInitialized(); // should not raise an error
      initable.verifyInitializedAndNotDisposed(); // should not raise an error

      expect(initable.initialized, isTrue);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      await initPromise;

      initable.verifyNotDisposed(); // should not raise an error
      initable.verifyInitialized(); // should not raise an error
      initable.verifyInitializedAndNotDisposed(); // should not raise an error

      expect(initable.initialized, isTrue);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      unawaited(initable.dispose());

      initable.verifyInitialized(); // should not raise an error
      expect(() => initable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));
      expect(() => initable.verifyInitializedAndNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      expect(initable.initialized, isTrue);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isTrue);
      expect(initable.disposing, isFalse);
    });

    test("Positive test `void onInit()` and `Future<void> onDispose()`",
        () async {
      final defer = Completer<void>();
      final initable = _MixedInitable()..onDisposeFuture = defer.future;
      expect(initable.initialized, isFalse);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      initable.verifyNotDisposed(); // should not raise an error
      expect(() => initable.verifyInitialized(),
          throwsA(isA<FExceptionInvalidOperation>()));
      // should raise an error
      expect(() => initable.verifyInitializedAndNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));
      // should raise an error

      final initPromise =
          initable.init(FExecutionContext.emptyExecutionContext);

      expect(initable.initialized, isTrue);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      initable.verifyNotDisposed(); // should not raise an error
      initable.verifyInitialized(); // should not raise an error
      initable.verifyInitializedAndNotDisposed(); // should not raise an error

      await _nextTick();

      initable.verifyNotDisposed(); // should not raise an error
      initable.verifyInitialized(); // should not raise an error
      initable.verifyInitializedAndNotDisposed(); // should not raise an error

      expect(initable.initialized, isTrue);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      await initPromise;

      bool disposablePromiseResolved = false;
      unawaited(initable.dispose().then((_) {
        disposablePromiseResolved = true;
      }));

      expect(disposablePromiseResolved, isFalse);
      expect(() => initable.verifyInitializedAndNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));
      expect(() => initable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      await _nextTick();

      expect(disposablePromiseResolved, isFalse);
      expect(() => initable.verifyInitializedAndNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));
      expect(() => initable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      expect(initable.initialized, isTrue);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isTrue);

      bool secondDisposablePromiseResolved = false;
      unawaited(initable.dispose().then((_) {
        secondDisposablePromiseResolved = true;
      }));

      expect(secondDisposablePromiseResolved, isFalse);

      await _nextTick();

      expect(disposablePromiseResolved, isFalse);
      expect(secondDisposablePromiseResolved, isFalse);
      expect(() => initable.verifyInitializedAndNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));
      expect(() => initable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));
      expect(initable.initialized, isTrue);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isTrue);

      defer.complete();

      expect(disposablePromiseResolved, isFalse);
      expect(secondDisposablePromiseResolved, isFalse);
      expect(() => initable.verifyInitializedAndNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));
      expect(() => initable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      await _nextTick();

      expect(disposablePromiseResolved, isTrue);
      expect(secondDisposablePromiseResolved, isTrue);
      expect(() => initable.verifyInitializedAndNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));
      expect(() => initable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      expect(initable.disposed, isTrue);
      expect(initable.disposing, isFalse);

      bool thirdDisposablePromiseResolved = false;
      unawaited(initable.dispose().then((_) {
        thirdDisposablePromiseResolved = true;
      }));
      expect(thirdDisposablePromiseResolved, isFalse);
      await _nextTick();
      expect(thirdDisposablePromiseResolved, isTrue);
    });

    test("Positive test `Future<void> onInit()` and `void onDispose()`",
        () async {
      final defer = Completer<void>();
      final initable = _MixedInitable()..onInitFuture = defer.future;

      expect(initable.initialized, isFalse);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      initable.verifyNotDisposed(); // should not raise an error
      expect(() => initable.verifyInitialized(),
          throwsA(isA<FExceptionInvalidOperation>()));
      // should raise an error
      expect(() => initable.verifyInitializedAndNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));
      // should raise an error

      unawaited(initable.init(FExecutionContext.emptyExecutionContext));

      expect(initable.initialized, isFalse);
      expect(initable.initializing, isTrue);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      defer.complete();

      expect(initable.initialized, isFalse);
      expect(initable.initializing, isTrue);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      unawaited(initable.dispose());

      await _nextTick();

      expect(initable.initialized, isTrue);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isTrue);
      expect(initable.disposing, isFalse);
    });

    test("Positive test `Future<void> onInit()` and `Future<void> onDispose()`",
        () async {
      final initDefer = Completer<void>();
      final disposeDefer = Completer<void>();
      final initable = _MixedInitable()
        ..onInitFuture = initDefer.future
        ..onDisposeFuture = disposeDefer.future;
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      initable.verifyNotDisposed(); // should not raise an error

      bool initablePromiseResolved = false;
      bool disposablePromiseResolved = false;
      unawaited(
          initable.init(FExecutionContext.emptyExecutionContext).then((_) {
        initablePromiseResolved = true;
      }));
      unawaited(initable.dispose().then((_) {
        disposablePromiseResolved = true;
      }));

      expect(initablePromiseResolved, isFalse);
      expect(disposablePromiseResolved, isFalse);
      expect(() => initable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      await _nextTick();

      expect(initablePromiseResolved, isFalse);
      expect(disposablePromiseResolved, isFalse);
      expect(() => initable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      expect(initable.initialized, isFalse);
      expect(initable.disposed, isFalse);
      expect(initable.initializing, isTrue);
      expect(initable.disposing, isTrue);

      bool secondDisposablePromiseResolved = false;
      unawaited(initable.dispose().then((_) {
        secondDisposablePromiseResolved = true;
      }));

      expect(secondDisposablePromiseResolved, isFalse);

      await _nextTick();

      expect(disposablePromiseResolved, isFalse);
      expect(secondDisposablePromiseResolved, isFalse);
      expect(() => initable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isTrue);

      initDefer.complete();
      disposeDefer.complete();

      expect(disposablePromiseResolved, isFalse);
      expect(secondDisposablePromiseResolved, isFalse);
      expect(() => initable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      await _nextTick();

      expect(disposablePromiseResolved, isTrue);
      expect(secondDisposablePromiseResolved, isTrue);
      expect(() => initable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      expect(initable.disposed, isTrue);
      expect(initable.disposing, isFalse);

      bool thirdDisposablePromiseResolved = false;
      unawaited(initable.dispose().then((_) {
        thirdDisposablePromiseResolved = true;
      }));
      expect(thirdDisposablePromiseResolved, isFalse);
      await _nextTick();
      expect(thirdDisposablePromiseResolved, isTrue);
    });

    test("Positive test `void onDispose()`", () async {
      final initable = _MixedInitable();
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      initable.verifyNotDisposed(); // should not raise an error

      final disposablePromise = initable.dispose();

      expect(initable.disposed, isTrue);
      expect(initable.disposing, isFalse);

      expect(() => initable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      await _nextTick();

      expect(() => initable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      expect(initable.disposed, isTrue);
      expect(initable.disposing, isFalse);

      await disposablePromise;

      expect(() => initable.verifyNotDisposed(),
          throwsA(isA<FExceptionInvalidOperation>()));

      expect(initable.disposed, isTrue);
      expect(initable.disposing, isFalse);
    });

    test("Twice call of init()", () async {
      final initable = _MixedInitable()..onInitFuture = Future<void>.value();

      final initPromise1 =
          initable.init(FExecutionContext.emptyExecutionContext);

      await _nextTick();

      initable.verifyNotDisposed(); // should not raise an error
      initable.verifyInitialized(); // should not raise an error
      initable.verifyInitializedAndNotDisposed(); // should not raise an error

      expect(initable.initialized, isTrue);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      await initPromise1;

      initable.verifyNotDisposed(); // should not raise an error
      initable.verifyInitialized(); // should not raise an error
      initable.verifyInitializedAndNotDisposed(); // should not raise an error

      expect(initable.initialized, isTrue);
      expect(initable.initializing, isFalse);
      expect(initable.disposed, isFalse);
      expect(initable.disposing, isFalse);

      bool isSuccessed = false;
      final initPromise2 = initable
          .init(FExecutionContext.emptyExecutionContext)
          .whenComplete(() {
        isSuccessed = true;
      });
      await _nextTick();
      expect(isSuccessed, isTrue);
      await initPromise2;
      await initable.dispose();
    });

    test("Should throw error from init()", () async {
      final initable = _MixedInitFailureInitable();

      dynamic expectedError;
      try {
        await initable.init(FExecutionContext.emptyExecutionContext);
      } catch (e) {
        expectedError = e;
      }

      expect(expectedError, isNotNull);
      expect(expectedError, isA<Error>());
      expect(expectedError, equals(initable.error));
    });

    test("Should throw error from dispose()", () async {
      final initable = _MixedDisposeFailureInitable();

      await initable.init(FExecutionContext.emptyExecutionContext);

      dynamic expectedError;
      try {
        await initable.dispose();
      } catch (e) {
        expectedError = e;
      }

      expect(expectedError, isNotNull);
      expect(expectedError, isA<Error>());
      expect(expectedError, equals(initable.error));
    });
  });
}
