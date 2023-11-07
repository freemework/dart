import { assert } from "chai";

import {
	FCancellationToken,
	FCancellationTokenSourceManual,
	FDisposable,
	FDisposableBase,
	FExecutionContext,
	FCancellationException,
	FCancellationExecutionContext,
	FInitableBase,
	FUsing,
	FException,
} from "../../src";
import { Deferred, nextTick } from "./tools";

describe("FUsing tests", function () {
	class TestDisposable extends FDisposableBase {
		private readonly _onDisposeCb: Function | null;
		public constructor(onDisposeCb?: Function) {
			super();
			this._onDisposeCb = onDisposeCb || null;
		}

		protected onDispose(): void | Promise<void> {
			if (this._onDisposeCb !== null) {
				this._onDisposeCb();
			}
		}
	}
	class TestInitable extends FInitableBase {
		protected onInit(): void | Promise<void> {
			//
		}
		protected onDispose(): void | Promise<void> {
			//
		}
	}

	it("Should pass Promise result to worker", async function () {
		const disposable = new TestDisposable();
		let executed = false;
		await FUsing(FExecutionContext.Empty, () => Promise.resolve(disposable), (instance: TestDisposable) => {
			executed = true;
			assert.strictEqual(disposable, instance);
		});
		assert.isTrue(executed);
		assert.isTrue(disposable.disposed);
		assert.isFalse(disposable.disposing);
	});
	it("Should pass factory result to worker (resource is instance of Disposable)", async function () {
		let disposable: any;
		let executed = false;
		await FUsing(FExecutionContext.Empty, () => (disposable = new TestDisposable()), (instance: TestDisposable) => {
			executed = true;
			assert.strictEqual(disposable, instance);
		});
		assert.isTrue(executed);
		assert.isTrue(disposable.disposed);
		assert.isFalse(disposable.disposing);
	});
	it("Should pass factory result to worker (resource is instance Promise<Disposable>)", async function () {
		let disposable: any;
		let executed = false;
		await FUsing(FExecutionContext.Empty, () => Promise.resolve(disposable = new TestDisposable()), (ct, instance) => {
			executed = true;
			assert.strictEqual(disposable, instance);
		});
		assert.isTrue(executed);
		assert.isTrue(disposable.disposed);
		assert.isFalse(disposable.disposing);
	});
	it("Should handle and execute worker's Promise", async function () {
		let disposable: any;
		let executed = false;
		await FUsing(FExecutionContext.Empty, () => Promise.resolve(disposable = new TestDisposable()), (ct, instance) => {
			// Create new NON-Started task
			return Promise.resolve().then(() => {
				executed = true;
				assert.strictEqual(disposable, instance);
			});

		});
		assert.isTrue(executed);
		assert.isTrue(disposable.disposed);
		assert.isFalse(disposable.disposing);
	});
	it("Should wait for execute Promise-worker before call dispose()", async function () {
		let disposable: any;
		let executed = false;

		const callSequence: Array<string> = [];
		function disposeCallback() { callSequence.push("dispose"); }

		await FUsing(FExecutionContext.Empty, () => Promise.resolve(disposable = new TestDisposable(disposeCallback)), async (ct, instance) => {
			executed = true;
			assert.strictEqual(disposable, instance);
			await new Promise(r => setTimeout(r, 25));
			callSequence.push("worker");
		});
		assert.isTrue(executed);
		assert.isTrue(disposable.disposed);
		assert.isFalse(disposable.disposing);
		assert.equal(callSequence.length, 2);
		assert.equal(callSequence[0], "worker");
		assert.equal(callSequence[1], "dispose");
	});
	it("Should fail if dispose() raise an error", async function () {
		let executed = false;

		let expectedError: any;

		try {
			await FUsing(
				FExecutionContext.Empty,
				() => { 
					const dispose = () => Promise.resolve().then(() => { throw new FException("Expected abnormal error"); });
					return ({ 
					dispose,
					[Symbol.asyncDispose]() { return dispose(); },
				 }) 
				},
				(ct, instance) => { executed = true; }
			);
		} catch (e) {
			expectedError = e;
		}

		assert.isTrue(executed);
		assert.instanceOf(expectedError, FException);
		assert.equal((expectedError as FException).message, "Expected abnormal error");
	});
	it("Should fail with worker's error", async function () {
		const disposable = new TestDisposable();
		let executed = false;
		let expectedError: any;
		try {
			await FUsing(FExecutionContext.Empty, () => Promise.resolve(disposable), (ct, instance) => {
				executed = true;
				throw new Error("Test ERROR");
			});
		} catch (e) {
			expectedError = e;
		}
		assert.isDefined(expectedError);
		assert.instanceOf(expectedError, Error);
		assert.equal(expectedError.message, "Test ERROR");
		assert.isTrue(executed);
		assert.isTrue(disposable.disposed);
		assert.isFalse(disposable.disposing);
	});
	it("Should fail with worker's reject", async function () {
		const disposable = new TestDisposable();
		let executed = false;
		let expectedError: any;
		try {
			await FUsing(FExecutionContext.Empty, () => Promise.resolve(disposable), (ct, instance) => {
				executed = true;
				return Promise.reject(new Error("Test ERROR"));
			});
		} catch (e) {
			expectedError = e;
		}
		assert.isDefined(expectedError);
		assert.instanceOf(expectedError, Error);
		assert.equal(expectedError.message, "Test ERROR");
		assert.isTrue(executed);
		assert.isTrue(disposable.disposed);
		assert.isFalse(disposable.disposing);
	});
	it("FUsing test onDispose(): Promise<void>", async function () {
		const defer = Deferred.create<number>();
		let FusingPromiseResolved = false;
		const FusingPromise = FUsing(FExecutionContext.Empty, () => (new TestDisposable()), (ct, instance) => defer.promise)
			.then((v) => { FusingPromiseResolved = true; return v; });

		assert.isFalse(FusingPromiseResolved);
		await nextTick();
		assert.isFalse(FusingPromiseResolved);
		defer.resolve(42);
		assert.isFalse(FusingPromiseResolved);
		await nextTick();
		assert.isTrue(FusingPromiseResolved);
		const result = await FusingPromise;
		assert.equal(result, 42);
	});
	it("Should be able to use CancellationToken on init phase", async function () {
		const cts = new FCancellationTokenSourceManual();
		const token: FCancellationToken = cts.token;

		cts.cancel();

		const disposable: FDisposable = new TestDisposable();
		let err;
		try {
			await FUsing(
				new FCancellationExecutionContext(FExecutionContext.Empty, token),
				(executionContext) => {
					FCancellationExecutionContext.of(executionContext).cancellationToken.throwIfCancellationRequested();
					return disposable;
				},
				(ct, instance) => {
					// Do nothing
				}
			);
		} catch (e) {
			err = e;
		}

		assert.isDefined(err);
		assert.instanceOf(err, FCancellationException);
	});
	it("Should be able to use CancellationToken on worker phase", async function () {
		const cts = new FCancellationTokenSourceManual();
		const token: FCancellationToken = cts.token;

		const disposable: FDisposableBase = new TestDisposable();

		let onDisposeCalled = false;
		(disposable as any).onDispose = () => {
			onDisposeCalled = true;
		};

		let err;
		try {
			await FUsing(
				new FCancellationExecutionContext(FExecutionContext.Empty, token),
				(executionContext) => {
					cts.cancel();
					return disposable;
				},
				(executionContext, instance) => {
					FCancellationExecutionContext.of(executionContext).cancellationToken.throwIfCancellationRequested();
					// Do nothing
				}
			);
		} catch (e) {
			err = e;
		}

		assert.isDefined(err);
		assert.instanceOf(err, FCancellationException);
		assert.isTrue(onDisposeCalled);
	});
	it("Should call init() for Initable", async function () {
		const initable = new TestInitable();
		let executedAfterInit = false;
		await FUsing(
			FExecutionContext.Empty,
			() => Promise.resolve(initable),
			(ct, instance) => {
				executedAfterInit = initable.initialized;
				assert.strictEqual(initable, instance);
			}
		);
		assert.isTrue(executedAfterInit);
		assert.isTrue(initable.initialized);
		assert.isFalse(initable.initializing);
		assert.isTrue(initable.disposed);
		assert.isFalse(initable.disposing);
	});
});
