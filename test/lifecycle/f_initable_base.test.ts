import { assert } from "chai";

import { FDisposable, FExecutionContext, FInitable, FInitableBase } from "../../src/index.js";

interface Deferred<T = any> {
	resolve: (value?: T) => void;
	reject: (err: any) => void;
	promise: Promise<T>;
}
namespace Deferred {
	export function create<T = void>(): Deferred<T> {
		const deferred: any = {};
		deferred.promise = new Promise<void>((r, j) => {
			deferred.resolve = r;
			deferred.reject = j;
		});
		return deferred;
	}
}

async function nextTick(): Promise<void> {
	await new Promise<void>(resolve => process.nextTick(resolve));
	await new Promise<void>(resolve => process.nextTick(resolve));
	await new Promise<void>(resolve => process.nextTick(resolve));
}


describe("Initable tests", function () {

	let onInitPromise: Promise<void> | null = null;
	let onDisposePromise: Promise<void> | null = null;

	class TestInitable extends FInitableBase {
		public _onInitCalled: boolean = false;
		public _onDisposeCalled: boolean = false;

		public override verifyNotDisposed() {
			super.verifyNotDisposed();
		}
		public override verifyInitializedAndNotDisposed() {
			super.verifyInitializedAndNotDisposed();
		}
		public override verifyInitialized() {
			super.verifyInitialized();
		}

		protected onInit(): void | Promise<void> {
			this._onInitCalled = true;
			if (onInitPromise) {
				return onInitPromise;
			}
		}

		protected onDispose(): void | Promise<void> {
			this._onDisposeCalled = true;
			if (onDisposePromise) {
				return onDisposePromise;
			}
		}
	}

	it("Positive test onInit(): void and onDispose(): void", async function () {
		const initable = new TestInitable();
		assert.isFalse(initable.initialized);
		assert.isFalse(initable.initializing);
		assert.isFalse(initable.disposed);
		assert.isFalse(initable.disposing);

		initable.verifyNotDisposed(); // should not raise an error
		assert.throw(() => initable.verifyInitialized()); // should raise an error
		assert.throw(() => initable.verifyInitializedAndNotDisposed()); // should raise an error

		const initPromise = initable.init(FExecutionContext.Empty);

		assert.isTrue(initable.initialized);
		assert.isFalse(initable.initializing);
		assert.isFalse(initable.disposed);
		assert.isFalse(initable.disposing);

		initable.verifyNotDisposed(); // should not raise an error
		initable.verifyInitialized(); // should not raise an error
		initable.verifyInitializedAndNotDisposed(); // should not raise an error

		await nextTick();

		initable.verifyNotDisposed(); // should not raise an error
		initable.verifyInitialized(); // should not raise an error
		initable.verifyInitializedAndNotDisposed(); // should not raise an error

		assert.isTrue(initable.initialized);
		assert.isFalse(initable.initializing);
		assert.isFalse(initable.disposed);
		assert.isFalse(initable.disposing);

		await initPromise;

		initable.verifyNotDisposed(); // should not raise an error
		initable.verifyInitialized(); // should not raise an error
		initable.verifyInitializedAndNotDisposed(); // should not raise an error

		assert.isTrue(initable.initialized);
		assert.isFalse(initable.initializing);
		assert.isFalse(initable.disposed);
		assert.isFalse(initable.disposing);

		initable.dispose();

		initable.verifyInitialized(); // should not raise an error
		assert.throw(() => initable.verifyNotDisposed());
		assert.throw(() => initable.verifyInitializedAndNotDisposed());

		assert.isTrue(initable.initialized);
		assert.isFalse(initable.initializing);
		assert.isTrue(initable.disposed);
		assert.isFalse(initable.disposing);
	});

	it("Positive test onInit(): void and onDispose(): Promise<void>", async function () {
		const initable = new TestInitable();
		assert.isFalse(initable.initialized);
		assert.isFalse(initable.initializing);
		assert.isFalse(initable.disposed);
		assert.isFalse(initable.disposing);

		initable.verifyNotDisposed(); // should not raise an error
		assert.throw(() => initable.verifyInitialized()); // should raise an error
		assert.throw(() => initable.verifyInitializedAndNotDisposed()); // should raise an error

		const initPromise = initable.init(FExecutionContext.Empty);

		assert.isTrue(initable.initialized);
		assert.isFalse(initable.initializing);
		assert.isFalse(initable.disposed);
		assert.isFalse(initable.disposing);

		initable.verifyNotDisposed(); // should not raise an error
		initable.verifyInitialized(); // should not raise an error
		initable.verifyInitializedAndNotDisposed(); // should not raise an error

		await nextTick();

		initable.verifyNotDisposed(); // should not raise an error
		initable.verifyInitialized(); // should not raise an error
		initable.verifyInitializedAndNotDisposed(); // should not raise an error

		assert.isTrue(initable.initialized);
		assert.isFalse(initable.initializing);
		assert.isFalse(initable.disposed);
		assert.isFalse(initable.disposing);

		await initPromise;

		const defer = Deferred.create();
		onDisposePromise = defer.promise;
		try {
			let disposablePromiseResolved = false;
			initable.dispose().then(() => { disposablePromiseResolved = true; });

			assert.isFalse(disposablePromiseResolved);
			assert.throw(() => initable.verifyInitializedAndNotDisposed());
			assert.throw(() => initable.verifyNotDisposed());

			await nextTick();

			assert.isFalse(disposablePromiseResolved);
			assert.throw(() => initable.verifyInitializedAndNotDisposed());
			assert.throw(() => initable.verifyNotDisposed());

			assert.isTrue(initable.initialized);
			assert.isFalse(initable.initializing);
			assert.isFalse(initable.disposed);
			assert.isTrue(initable.disposing);

			let secondDisposablePromiseResolved = false;
			initable.dispose().then(() => { secondDisposablePromiseResolved = true; });

			assert.isFalse(secondDisposablePromiseResolved);

			await nextTick();

			assert.isFalse(disposablePromiseResolved);
			assert.isFalse(secondDisposablePromiseResolved);
			assert.throw(() => initable.verifyInitializedAndNotDisposed());
			assert.throw(() => initable.verifyNotDisposed());
			assert.isTrue(initable.initialized);
			assert.isFalse(initable.initializing);
			assert.isFalse(initable.disposed);
			assert.isTrue(initable.disposing);

			defer.resolve();

			assert.isFalse(disposablePromiseResolved);
			assert.isFalse(secondDisposablePromiseResolved);
			assert.throw(() => initable.verifyInitializedAndNotDisposed());
			assert.throw(() => initable.verifyNotDisposed());

			await nextTick();

			assert.isTrue(disposablePromiseResolved);
			assert.isTrue(secondDisposablePromiseResolved);
			assert.throw(() => initable.verifyInitializedAndNotDisposed());
			assert.throw(() => initable.verifyNotDisposed());

			assert.isTrue(initable.disposed);
			assert.isFalse(initable.disposing);

			let thirdDisposablePromiseResolved = false;
			initable.dispose().then(() => { thirdDisposablePromiseResolved = true; });
			assert.isFalse(thirdDisposablePromiseResolved);
			await nextTick();
			assert.isTrue(thirdDisposablePromiseResolved);
		} finally {
			onDisposePromise = null;
		}
	});

	it("Positive test onInit(): Promise<void> and onDispose(): void", async function () {
		const defer = Deferred.create();
		onInitPromise = defer.promise;
		try {
			const initable = new TestInitable();
			assert.isFalse(initable.initialized);
			assert.isFalse(initable.initializing);
			assert.isFalse(initable.disposed);
			assert.isFalse(initable.disposing);

			initable.verifyNotDisposed(); // should not raise an error
			assert.throw(() => initable.verifyInitialized()); // should raise an error
			assert.throw(() => initable.verifyInitializedAndNotDisposed()); // should raise an error

			initable.init(FExecutionContext.Empty);

			assert.isFalse(initable.initialized);
			assert.isTrue(initable.initializing);
			assert.isFalse(initable.disposed);
			assert.isFalse(initable.disposing);

			defer.resolve();

			assert.isFalse(initable.initialized);
			assert.isTrue(initable.initializing);
			assert.isFalse(initable.disposed);
			assert.isFalse(initable.disposing);

			initable.dispose();

			await nextTick();

			assert.isTrue(initable.initialized);
			assert.isFalse(initable.initializing);
			assert.isTrue(initable.disposed);
			assert.isFalse(initable.disposing);
		} finally {
			onInitPromise = null;
		}
	});

	it("Positive test onInit(): Promise<void> and onDispose(): Promise<void>", async function () {
		const initable = new TestInitable();
		assert.isFalse(initable.disposed);
		assert.isFalse(initable.disposing);

		initable.verifyNotDisposed(); // should not raise an error

		const initDefer = Deferred.create();
		const disposeDefer = Deferred.create();
		onInitPromise = initDefer.promise;
		onDisposePromise = disposeDefer.promise;
		try {
			let initablePromiseResolved = false;
			let disposablePromiseResolved = false;
			initable.init(FExecutionContext.Empty).then(() => { initablePromiseResolved = true; });
			initable.dispose().then(() => { disposablePromiseResolved = true; });

			assert.isFalse(initablePromiseResolved);
			assert.isFalse(disposablePromiseResolved);
			assert.throw(() => initable.verifyNotDisposed());

			await nextTick();

			assert.isFalse(initablePromiseResolved);
			assert.isFalse(disposablePromiseResolved);
			assert.throw(() => initable.verifyNotDisposed());

			assert.isFalse(initable.initialized);
			assert.isFalse(initable.disposed);
			assert.isTrue(initable.initializing);
			assert.isTrue(initable.disposing);

			let secondDisposablePromiseResolved = false;
			initable.dispose().then(() => { secondDisposablePromiseResolved = true; });

			assert.isFalse(secondDisposablePromiseResolved);

			await nextTick();

			assert.isFalse(disposablePromiseResolved);
			assert.isFalse(secondDisposablePromiseResolved);
			assert.throw(() => initable.verifyNotDisposed());
			assert.isFalse(initable.disposed);
			assert.isTrue(initable.disposing);

			initDefer.resolve();
			disposeDefer.resolve();

			assert.isFalse(disposablePromiseResolved);
			assert.isFalse(secondDisposablePromiseResolved);
			assert.throw(() => initable.verifyNotDisposed());

			await nextTick();

			assert.isTrue(disposablePromiseResolved);
			assert.isTrue(secondDisposablePromiseResolved);
			assert.throw(() => initable.verifyNotDisposed());

			assert.isTrue(initable.disposed);
			assert.isFalse(initable.disposing);

			let thirdDisposablePromiseResolved = false;
			initable.dispose().then(() => { thirdDisposablePromiseResolved = true; });
			assert.isFalse(thirdDisposablePromiseResolved);
			await nextTick();
			assert.isTrue(thirdDisposablePromiseResolved);
		} finally {
			onDisposePromise = null;
		}
	});

	it("Positive test onDispose(): Promise<void> by 'await using' feature of TypeScript", async function () {
		let disposable: TestInitable;

		{ // using scope
			await using localDisposable = new TestInitable();
			await localDisposable.init(FExecutionContext.Empty);

			assert.isFalse(localDisposable.disposed);
			assert.isFalse(localDisposable.disposing);

			localDisposable.verifyNotDisposed(); // should not raise an error

			disposable = localDisposable;
		}

		assert.isTrue(disposable.disposed);
		assert.isFalse(disposable.disposing);
	});

	it("Positive test onDispose(): void", async function () {
		const initable = new TestInitable();
		assert.isFalse(initable.disposed);
		assert.isFalse(initable.disposing);

		initable.verifyNotDisposed(); // should not raise an error

		const disposablePromise = initable.dispose();

		assert.isTrue(initable.disposed);
		assert.isFalse(initable.disposing);

		assert.throw(() => initable.verifyNotDisposed());

		await nextTick();

		assert.throw(() => initable.verifyNotDisposed());

		assert.isTrue(initable.disposed);
		assert.isFalse(initable.disposing);

		await disposablePromise;

		assert.throw(() => initable.verifyNotDisposed());

		assert.isTrue(initable.disposed);
		assert.isFalse(initable.disposing);
	});

	it("Twice call of init()", async function () {
		onInitPromise = Promise.resolve();

		const initable = new TestInitable();

		const initPromise1 = initable.init(FExecutionContext.Empty);

		await nextTick();

		initable.verifyNotDisposed(); // should not raise an error
		initable.verifyInitialized(); // should not raise an error
		initable.verifyInitializedAndNotDisposed(); // should not raise an error

		assert.isTrue(initable.initialized);
		assert.isFalse(initable.initializing);
		assert.isFalse(initable.disposed);
		assert.isFalse(initable.disposing);

		await initPromise1;

		initable.verifyNotDisposed(); // should not raise an error
		initable.verifyInitialized(); // should not raise an error
		initable.verifyInitializedAndNotDisposed(); // should not raise an error

		assert.isTrue(initable.initialized);
		assert.isFalse(initable.initializing);
		assert.isFalse(initable.disposed);
		assert.isFalse(initable.disposing);

		let isSuccess = false;
		const initPromise2 = initable.init(FExecutionContext.Empty).finally(() => { isSuccess = true; });
		await nextTick();
		assert.isTrue(isSuccess);
		await initPromise2;
		await initable.dispose();
	});

	it("Should throw error from init()", async function () {
		class MyInitable extends FInitableBase {
			protected onInit(): Promise<void> { return Promise.reject(new Error("test error")); }
			protected onDispose(): Promise<void> { return Promise.resolve(); }
		}

		const initable = new MyInitable();

		let expectedError: any = null;
		try {
			await initable.init(FExecutionContext.Empty);
		} catch (e) {
			expectedError = e;
		}

		assert.isNotNull(expectedError);
		assert.instanceOf(expectedError, Error);
		assert.equal((expectedError as Error).message, "test error");
	});

	it("Should throw error from dispose()", async function () {
		class MyInitable extends FInitableBase {
			protected onInit(): Promise<void> { return Promise.resolve(); }
			protected onDispose(): Promise<void> { return Promise.reject(new Error("test error")); }
		}

		const initable = new MyInitable();

		await initable.init(FExecutionContext.Empty);

		let expectedError: any = null;
		try {
			await initable.dispose();
		} catch (e) {
			expectedError = e;
		}

		assert.isNotNull(expectedError);
		assert.instanceOf(expectedError, Error);
		assert.equal((expectedError as Error).message, "test error");
	});

	it("Check instanceOf", async function () {
		const initable = new TestInitable();
		assert.isTrue(FInitable.instanceOf(initable));
		assert.isTrue(FDisposable.instanceOf(initable));
	});

	it("Should not call onDispose is not initialized", async function () {
		const initable = new TestInitable();
		await initable.init(FExecutionContext.Default);
		await initable[Symbol.asyncDispose]();
		assert.isTrue(initable._onInitCalled);
		assert.isTrue(initable._onDisposeCalled);
	});

	it("Should not call onDispose is not initialized", async function () {
		const initable = new TestInitable();
		await initable[Symbol.asyncDispose]();
		assert.isFalse(initable._onInitCalled);
		assert.isFalse(initable._onDisposeCalled);
	});
});
