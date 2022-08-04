import { assert } from "chai";

import { FDisposable, Fusing, FInitable, FDisposableBase, FInitableBase, FExecutionContext, FExceptionCancelled, FCancellationToken, FCancellationTokenSourceManual, FExecutionContextCancellation } from "../../src";
import { Deferred, nextTick } from "./tools";

// interface Deferred<T = any> {
// 	resolve: (value?: T) => void;
// 	reject: (err: any) => void;
// 	promise: Promise<T>;
// }
// namespace Deferred {
// 	export function create<T = void>(): Deferred<T> {
// 		const deferred: any = {};
// 		deferred.promise = new Promise<void>((r, j) => {
// 			deferred.resolve = r;
// 			deferred.reject = j;
// 		});
// 		return deferred;
// 	}
// }
// function nextTick(): Promise<void> {
// 	return new Promise<void>(resolve => process.nextTick(resolve));
// }

describe("Fusing tests", function () {
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
		await Fusing(FExecutionContext.Empty, Promise.resolve(disposable), (ct, instance) => {
			executed = true;
			assert.strictEqual(disposable, instance);
		});
		assert.isTrue(executed);
		assert.isTrue(disposable.disposed);
		assert.isFalse(disposable.disposing);
	});
	it("Should pass Task result to worker", async function () {
		const disposable = new TestDisposable();
		let executed = false;
		await Fusing(FExecutionContext.Empty, Promise.resolve(disposable), (ct, instance) => {
			executed = true;
			assert.strictEqual(disposable, instance);
		});
		assert.isTrue(executed);
		assert.isTrue(disposable.disposed);
		assert.isFalse(disposable.disposing);
	});
	it("Should pass factory result to worker (result is instance of Disposable)", async function () {
		let disposable: any;
		let executed = false;
		await Fusing(FExecutionContext.Empty, () => (disposable = new TestDisposable()), (ct, instance) => {
			executed = true;
			assert.strictEqual(disposable, instance);
		});
		assert.isTrue(executed);
		assert.isTrue(disposable.disposed);
		assert.isFalse(disposable.disposing);
	});
	it("Should pass factory result to worker (result is Promise<Disposable>)", async function () {
		let disposable: any;
		let executed = false;
		await Fusing(FExecutionContext.Empty, () => Promise.resolve(disposable = new TestDisposable()), (ct, instance) => {
			executed = true;
			assert.strictEqual(disposable, instance);
		});
		assert.isTrue(executed);
		assert.isTrue(disposable.disposed);
		assert.isFalse(disposable.disposing);
	});
	it("Should pass factory result to worker (result is Task<Disposable>)", async function () {
		let disposable: any;
		let executed = false;
		await Fusing(FExecutionContext.Empty, () => Promise.resolve(disposable = new TestDisposable()), (ct, instance) => {
			executed = true;
			assert.strictEqual(disposable, instance);
		});
		assert.isTrue(executed);
		assert.isTrue(disposable.disposed);
		assert.isFalse(disposable.disposing);
	});
	it("Should handle and execure worker's Task", async function () {
		let disposable: any;
		let executed = false;
		await Fusing(FExecutionContext.Empty, () => Promise.resolve(disposable = new TestDisposable()), (ct, instance) => {
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

		await Fusing(FExecutionContext.Empty, () => Promise.resolve(disposable = new TestDisposable(disposeCallback)), async (ct, instance) => {
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
	it("Should wait for execute Task-worker before call dispose()", async function () {
		let disposable: any;
		let executed = false;

		const callSequence: Array<string> = [];
		function disposeCallback() { callSequence.push("dispose"); }

		await Fusing(FExecutionContext.Empty, () => Promise.resolve(disposable = new TestDisposable(disposeCallback)), (ct, instance) => {
			return Promise.resolve().then(async () => {
				executed = true;
				assert.strictEqual(disposable, instance);
				await new Promise(r => setTimeout(r, 25));
				callSequence.push("worker");
			});
		});
		assert.isTrue(executed);
		assert.isTrue(disposable.disposed);
		assert.isFalse(disposable.disposing);
		assert.equal(callSequence.length, 2);
		assert.equal(callSequence[0], "worker");
		assert.equal(callSequence[1], "dispose");
	});
	it("Should NOT fail if dispose() raise an error", async function () {
		const originalConsole = (global as any).console;
		try {
			let executed = false;

			let expectedErrorMessage: any;
			let expectedErrorObj: any;

			(global as any).console = {
				error(msg: any, err: any) {
					expectedErrorMessage = msg;
					expectedErrorObj = err;
				}
			};
			await Fusing(
				FExecutionContext.Empty,
				() => ({ dispose: () => Promise.resolve().then(() => { throw new Error("Expected abnormal error"); }) }),
				(ct, instance) => {
					executed = true;
				});
			assert.isTrue(executed);
			assert.isString(expectedErrorMessage);
			assert.equal(expectedErrorMessage,
				"Dispose method raised an error. This is unexpected behaviour due dispose() should be exception safe. The error was bypassed.");
			assert.instanceOf(expectedErrorObj, Error);
			assert.equal(expectedErrorObj.message, "Expected abnormal error");
		} finally {
			(global as any).console = originalConsole;
		}
	});
	it("Should fail when wrong disposable", async function () {
		let executed = false;
		let expectedError: any;
		try {
			await Fusing(FExecutionContext.Empty, null as any, (ct, instance) => {
				//
			});
		} catch (e) {
			expectedError = e;
		}
		assert.isDefined(expectedError);
		assert.instanceOf(expectedError, Error);
		assert.include(expectedError.message, "Wrong argument");
		assert.isFalse(executed);
	});
	it("Should fail when wrong worker", async function () {
		let executed = false;
		let expectedError: any;
		try {
			await Fusing(FExecutionContext.Empty, Promise.resolve(new TestDisposable()), null as any);
		} catch (e) {
			expectedError = e;
		}
		assert.isDefined(expectedError);
		assert.instanceOf(expectedError, Error);
		assert.include(expectedError.message, "Wrong argument");
		assert.isFalse(executed);
	});
	it("Should fail with worker's error", async function () {
		const disposable = new TestDisposable();
		let executed = false;
		let expectedError: any;
		try {
			await Fusing(FExecutionContext.Empty, Promise.resolve(disposable), (ct, instance) => {
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
			await Fusing(FExecutionContext.Empty, Promise.resolve(disposable), (ct, instance) => {
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
	it("Fusing test onDispose(): Promise<void>", async function () {
		const defer = Deferred.create<number>();
		let FusingPromiseResolved = false;
		const FusingPromise = Fusing(FExecutionContext.Empty, () => (new TestDisposable()), (ct, instance) => defer.promise)
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
			await Fusing(
				new FExecutionContextCancellation(FExecutionContext.Empty, token),
				(executionContext) => {
					FExecutionContextCancellation.of(executionContext).cancellationToken.throwIfCancellationRequested();
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
		assert.instanceOf(err, FExceptionCancelled);
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
			await Fusing(
				new FExecutionContextCancellation(FExecutionContext.Empty, token),
				(executionContext) => {
					cts.cancel();
					return disposable;
				},
				(executionContext, instance) => {
					FExecutionContextCancellation.of(executionContext).cancellationToken.throwIfCancellationRequested();
					// Do nothing
				}
			);
		} catch (e) {
			err = e;
		}

		assert.isDefined(err);
		assert.instanceOf(err, FExceptionCancelled);
		assert.isTrue(onDisposeCalled);
	});
	it("Should call init() for Initable", async function () {
		const initable = new TestInitable();
		let executedAfterInit = false;
		await Fusing(FExecutionContext.Empty, Promise.resolve(initable), (ct, instance) => {
			executedAfterInit = initable.initialized;
			assert.strictEqual(initable, instance);
		});
		assert.isTrue(executedAfterInit);
		assert.isTrue(initable.initialized);
		assert.isFalse(initable.initializing);
		assert.isTrue(initable.disposed);
		assert.isFalse(initable.disposing);
	});
});
