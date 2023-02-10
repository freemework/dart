import { assert } from "chai";

import { Fsleep, FCancellationTokenSourceManual, FCancellationTokenSourceTimeout, FCancellationException } from "../src";

describe("Fsleep tests", function () {
	it("Should cancel Fsleep() before started", async () => {
		let expectedError;

		const cancellationTokenSource = new FCancellationTokenSourceManual();
		cancellationTokenSource.cancel();
		Fsleep(cancellationTokenSource.token, 1000).catch(err => { expectedError = err; });
		await new Promise(wakeup => setTimeout(wakeup, 25));

		assert.isDefined(expectedError);
		assert.instanceOf(expectedError, FCancellationException);
	});
	it("Should cancel Fsleep() after start", async () => {
		let expectedError;

		const cancellationTokenSource = new FCancellationTokenSourceManual();
		const sleepTask = Fsleep(cancellationTokenSource.token, 1000).catch(err => { expectedError = err; });
		await new Promise(wakeup => setTimeout(wakeup, 25));

		cancellationTokenSource.cancel();

		await sleepTask;

		assert.isDefined(expectedError);
		assert.instanceOf(expectedError, FCancellationException);
	});
	it("Should cancel Fsleep() via cancellationToken", async () => {
		let expectedError;

		const cancellationTokenSource = new FCancellationTokenSourceManual();
		Fsleep(cancellationTokenSource.token).catch(err => { expectedError = err; });

		await new Promise(wakeup => setTimeout(wakeup, 10));

		assert.isUndefined(expectedError);

		cancellationTokenSource.cancel();

		assert.isUndefined(expectedError);

		await new Promise(wakeup => setTimeout(wakeup, 10));

		assert.isDefined(expectedError);
		assert.instanceOf(expectedError, FCancellationException);
	});
	it("Should cancel Fsleep() via Timeout", async () => {
		let expectedError;

		const cancellationTokenSource = new FCancellationTokenSourceTimeout(25);

		const sleepTask = Fsleep(cancellationTokenSource.token, 1000).catch(err => { expectedError = err; });

		await new Promise(wakeup => setTimeout(wakeup, 50));

		await sleepTask;


		assert.isDefined(expectedError);
		assert.instanceOf(expectedError, FCancellationException);
	});
	it("Should cancel Fsleep() via Timeout before start", async () => {
		let expectedError;

		const cancellationTokenSource = new FCancellationTokenSourceTimeout(24 * 60 * 60 * 1000/* long timeout */);

		cancellationTokenSource.cancel();

		Fsleep(cancellationTokenSource.token, 1000).catch(err => { expectedError = err; });

		await new Promise(wakeup => setTimeout(wakeup, 50));


		assert.isDefined(expectedError);
		assert.instanceOf(expectedError, FCancellationException);
	});
	it("Should cancel Fsleep() via Timeout + call cancel()", async () => {
		let expectedError;

		const cancellationTokenSource = new FCancellationTokenSourceTimeout(24 * 60 * 60 * 1000/* long timeout */);

		const sleepTask = Fsleep(cancellationTokenSource.token, 1000).catch(err => { expectedError = err; });

		await new Promise(wakeup => setTimeout(wakeup, 50));

		cancellationTokenSource.cancel();

		assert.isUndefined(expectedError);

		await sleepTask;

		assert.isDefined(expectedError);
		assert.instanceOf(expectedError, FCancellationException);
	});
});
