import { assert } from "chai";

import { FDisposableBase } from "../../src";

describe("FDisposableBase.safeDispose tests", function () {
	it("should safe dispose number", async function () {
		await FDisposableBase.safeDispose(5);
	});
	it("should safe dispose non-disposable object", async function () {
		await FDisposableBase.safeDispose({ a: 42 });
	});
	it("should safe dispose non-disposable object", async function () {
		await FDisposableBase.safeDispose({ dispose: 42 });
	});
	it("should safe dispose disposable object", async function () {
		const obj = {
			dispose: () => { /* nop */ }
		};
		await FDisposableBase.safeDispose(obj);
	});
	it("should safe dispose disposable object", async function () {
		const obj = {
			dispose: () => Promise.resolve()
		};
		await FDisposableBase.safeDispose(obj);
	});
	it("should safe dispose suppress an error", async function () {
		const testName = this.test!.title;
		const obj = {
			dispose: () => { throw new Error(`Should be suppressed. This is expected message produced by the test '${testName}'`); }
		};

		let unexpectedErr: any;
		try {
			await FDisposableBase.safeDispose(obj);
		} catch (e) {
			unexpectedErr = e;
		}
		assert.isUndefined(unexpectedErr, "safeDispose should suppress any errors");
	});
});
