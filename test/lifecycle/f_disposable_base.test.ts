import { assert } from "chai";

import { FDisposableBase } from "../../src/index.js";

import * as tools from "./tools.js";

describe("FDisposableBase tests", function () {

	let onDisposePromise: Promise<void> | null = null;

	class TestDisposable extends FDisposableBase {
		public override verifyNotDisposed() {
			super.verifyNotDisposed();
		}

		protected onDispose(): void | Promise<void> {
			if (onDisposePromise) {
				return onDisposePromise;
			}
		}
	}

	it("Positive test onDispose(): Promise<void>", async function () {
		const disposable = new TestDisposable();
		assert.isFalse(disposable.disposed);
		assert.isFalse(disposable.disposing);

		disposable.verifyNotDisposed(); // should not raise an error

		const defer = tools.Deferred.create();
		onDisposePromise = defer.promise;
		try {
			let disposablePromiseResolved = false;
			disposable.dispose().then(() => { disposablePromiseResolved = true; });

			assert.isFalse(disposablePromiseResolved);
			assert.throw(() => disposable.verifyNotDisposed());

			await tools.nextTick();

			assert.isFalse(disposablePromiseResolved);
			assert.throw(() => disposable.verifyNotDisposed());

			assert.isFalse(disposable.disposed);
			assert.isTrue(disposable.disposing);

			let secondDisposablePromiseResolved = false;
			disposable.dispose().then(() => { secondDisposablePromiseResolved = true; });

			assert.isFalse(secondDisposablePromiseResolved);

			await tools.nextTick();

			assert.isFalse(disposablePromiseResolved);
			assert.isFalse(secondDisposablePromiseResolved);
			assert.throw(() => disposable.verifyNotDisposed());
			assert.isFalse(disposable.disposed);
			assert.isTrue(disposable.disposing);

			defer.resolve();

			assert.isFalse(disposablePromiseResolved);
			assert.isFalse(secondDisposablePromiseResolved);
			assert.throw(() => disposable.verifyNotDisposed());

			await tools.nextTick();

			assert.isTrue(disposablePromiseResolved);
			assert.isTrue(secondDisposablePromiseResolved);
			assert.throw(() => disposable.verifyNotDisposed());

			assert.isTrue(disposable.disposed);
			assert.isFalse(disposable.disposing);

			let thirdDisposablePromiseResolved = false;
			disposable.dispose().then(() => { thirdDisposablePromiseResolved = true; });
			assert.isFalse(thirdDisposablePromiseResolved);
			await tools.nextTick();
			assert.isTrue(thirdDisposablePromiseResolved);
		} finally {
			onDisposePromise = null;
		}
	});

	it("Positive test onDispose(): void", async function () {
		const disposable = new TestDisposable();
		assert.isFalse(disposable.disposed);
		assert.isFalse(disposable.disposing);

		disposable.verifyNotDisposed(); // should not raise an error

		const disposablePromise = disposable.dispose();

		assert.isTrue(disposable.disposed);
		assert.isFalse(disposable.disposing);

		assert.throw(() => disposable.verifyNotDisposed());

		await tools.nextTick();

		assert.throw(() => disposable.verifyNotDisposed());

		assert.isTrue(disposable.disposed);
		assert.isFalse(disposable.disposing);

		await disposablePromise;

		assert.throw(() => disposable.verifyNotDisposed());

		assert.isTrue(disposable.disposed);
		assert.isFalse(disposable.disposing);
	});

	it("Positive test onDispose(): Promise<void> by 'await using' feature of TypeScript", async function () {
		let disposable: TestDisposable;

		{ // using scope
			await using localDisposable = new TestDisposable();

			assert.isFalse(localDisposable.disposed);
			assert.isFalse(localDisposable.disposing);

			localDisposable.verifyNotDisposed(); // should not raise an error

			disposable = localDisposable;
		}

		assert.isTrue(disposable.disposed);
		assert.isFalse(disposable.disposing);
	});

	// it("Should execute and wait for disposable task", async function () {
	// 	let onDisposeTaskCalled = false;
	// 	const onDisposeTask: cryptopay.Task = Task.create(() => {
	// 		onDisposeTaskCalled = true;
	// 	});

	// 	class MyDisposable extends Disposable {
	// 		protected onDispose(): Promise<void> { return onDisposeTask; }
	// 	}

	// 	const disposable = new MyDisposable();

	// 	await disposable.dispose();
	// 	assert.isTrue(onDisposeTaskCalled, "dispose() should execute dispose task");
	// });

	it("Should throw error from dispose()", async function () {
		class MyDisposable extends FDisposableBase {
			protected onDispose(): Promise<void> { return Promise.reject(new Error("test error")); }
		}

		const disposable = new MyDisposable();

		let expectedError: any = null;
		try {
			await disposable.dispose();
		} catch (e) {
			expectedError = e;
		}

		assert.isNotNull(expectedError);
		assert.instanceOf(expectedError, Error);
		assert.equal((expectedError as Error).message, "test error");
	});
});


// describe("FDisposableBase.safeDispose tests", function () {
// 	it("should safe dispose number", async function () {
// 		await FDisposableBase.safeDispose(5);
// 	});
// 	it("should safe dispose non-disposable object", async function () {
// 		await FDisposableBase.safeDispose({ a: 42 });
// 	});
// 	it("should safe dispose non-disposable object", async function () {
// 		await FDisposableBase.safeDispose({ dispose: 42 });
// 	});
// 	it("should safe dispose disposable object", async function () {
// 		const obj = {
// 			dispose: () => { /* nop */ }
// 		};
// 		await FDisposableBase.safeDispose(obj);
// 	});
// 	it("should safe dispose disposable object", async function () {
// 		const obj = {
// 			dispose: () => Promise.resolve()
// 		};
// 		await FDisposableBase.safeDispose(obj);
// 	});
// 	it("should safe dispose suppress an error", async function () {
// 		const testName = this.test!.title;
// 		const obj = {
// 			dispose: () => { throw new Error(`Should be suppressed. This is expected message produced by the test '${testName}'`); }
// 		};

// 		let unexpectedErr: any;
// 		try {
// 			await FDisposableBase.safeDispose(obj);
// 		} catch (e) {
// 			unexpectedErr = e;
// 		}
// 		assert.isUndefined(unexpectedErr, "safeDispose should suppress any errors");
// 	});
// });
