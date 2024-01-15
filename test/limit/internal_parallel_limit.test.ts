import { FLimitInternalParallelLimit } from "../../src/limit/internal/f_limit_internal_parallel_limit.js";
import { FLimitException } from "../../src/index.js";


import { assert } from "chai";
import { spy } from "sinon";

describe(`${FLimitInternalParallelLimit.name} tests`, function () {
	it("Should be able to instance and destroy", async function () {
		const mylimit = new FLimitInternalParallelLimit(2);
		mylimit.accrueToken(1).commit();
	});
	it("Should be equal maxTokens to hitCount", async function () {
		// Setup limit for 2 parallel call
		const limit = new FLimitInternalParallelLimit(2);
		assert.equal(limit.maxWeight, 2);
	});
	it("Should get 2 tokens and block 3-rd token", async function () {
		// Setup limit for 2 parallel call
		const limit = new FLimitInternalParallelLimit(2);

		assert.equal(limit.availableWeight, 2);

		limit.accrueToken(1);
		assert.equal(limit.availableWeight, 1);

		limit.accrueToken(1);
		assert.equal(limit.availableWeight, 0);

		let expectedError;
		try {
			limit.accrueToken(1);
		} catch (e) {
			expectedError = e;
		}
		assert.instanceOf(expectedError, FLimitException);
	});
	it("Should get 2 tokens and commit 2 tokens", async function () {
		// Setup limit for 2 parallel call
		const limit = new FLimitInternalParallelLimit(2);

		assert.equal(limit.availableWeight, 2);

		const limitToken0 = limit.accrueToken(1);
		assert.equal(limit.availableWeight, 1);

		const limitToken1 = limit.accrueToken(1);
		assert.equal(limit.availableWeight, 0);

		limitToken0.commit();
		assert.equal(limit.availableWeight, 1);

		limitToken1.commit();
		assert.equal(limit.availableWeight, 2);
	});
	it("Should get 2 tokens and rollback 2 tokens", async function () {
		// Setup limit for 2 parallel call
		const limit = new FLimitInternalParallelLimit(2);

		assert.equal(limit.availableWeight, 2);

		const limitToken0 = limit.accrueToken(1);
		assert.equal(limit.availableWeight, 1);

		const limitToken1 = limit.accrueToken(1);
		assert.equal(limit.availableWeight, 0);

		limitToken0.rollback();
		assert.equal(limit.availableWeight, 1);

		limitToken1.rollback();
		assert.equal(limit.availableWeight, 2);
	});
	it("Should get 2 tokens and get another 2 tokens", async function () {
		// Setup limit for 2 parallel call
		const limit = new FLimitInternalParallelLimit(2);

		assert.equal(limit.availableWeight, 2);

		const limitToken0 = limit.accrueToken(1);
		assert.equal(limit.availableWeight, 1);

		const limitToken1 = limit.accrueToken(1);
		assert.equal(limit.availableWeight, 0);

		limitToken0.commit();
		assert.equal(limit.availableWeight, 1);

		limitToken1.rollback();
		assert.equal(limit.availableWeight, 2);

		limit.accrueToken(1);
		assert.equal(limit.availableWeight, 1);

		limit.accrueToken(1);
		assert.equal(limit.availableWeight, 0);
	});
	it("Should get 3 Weight and get another 1 Weight", async function () {
		// Setup limit for 4 parallel call
		const limit = new FLimitInternalParallelLimit(4);

		assert.equal(limit.availableWeight, 4);

		const limitToken0 = limit.accrueToken(3);
		assert.equal(limit.availableWeight, 1);

		const limitToken1 = limit.accrueToken(1);
		assert.equal(limit.availableWeight, 0);

		limitToken0.commit();
		assert.equal(limit.availableWeight, 3);

		limitToken1.rollback();
		assert.equal(limit.availableWeight, 4);

		limit.accrueToken(1);
		assert.equal(limit.availableWeight, 3);

		limit.accrueToken(1);
		assert.equal(limit.availableWeight, 2);

		limit.accrueToken(1);
		assert.equal(limit.availableWeight, 1);

		limit.accrueToken(1);
		assert.equal(limit.availableWeight, 0);
	});
	it("Should NOT decrement availableTokens on multiple call commit on same token", async function () {
		// Setup limit for 2 parallel call
		const limit = new FLimitInternalParallelLimit(2);

		assert.equal(limit.availableWeight, 2);
		const limitToken0 = limit.accrueToken(1);
		assert.equal(limit.availableWeight, 1);

		limitToken0.commit();
		assert.equal(limit.availableWeight, 2);
		limitToken0.commit();
		assert.equal(limit.availableWeight, 2);
		limitToken0.commit();
		assert.equal(limit.availableWeight, 2);
	});
	it("Should NOT decrement availableTokens on multiple call rollback on same token", async function () {
		// Setup limit for 2 parallel call
		const limit = new FLimitInternalParallelLimit(2);

		assert.equal(limit.availableWeight, 2);
		const limitToken0 = limit.accrueToken(1);
		assert.equal(limit.availableWeight, 1);

		limitToken0.rollback();
		assert.equal(limit.availableWeight, 2);
		limitToken0.rollback();
		assert.equal(limit.availableWeight, 2);
		limitToken0.rollback();
		assert.equal(limit.availableWeight, 2);
	});
	it("Should NOT decrement availableTokens on multiple call commit+rollback on same token", async function () {
		// Setup limit for 2 parallel call
		const limit = new FLimitInternalParallelLimit(2);

		assert.equal(limit.availableWeight, 2);
		const limitToken0 = limit.accrueToken(1);
		assert.equal(limit.availableWeight, 1);

		limitToken0.commit();
		assert.equal(limit.availableWeight, 2);
		limitToken0.rollback();
		assert.equal(limit.availableWeight, 2);
		limitToken0.commit();
		assert.equal(limit.availableWeight, 2);
		limitToken0.rollback();
		assert.equal(limit.availableWeight, 2);
	});
	it("Should fire callback on commit", async function () {
		// Setup limit for 2 parallel call
		const limit = new FLimitInternalParallelLimit(2);

		const listenerSpy = spy();
		limit.addReleaseTokenListener(listenerSpy);

		const limitToken0 = limit.accrueToken(1);
		const limitToken1 = limit.accrueToken(1);

		assert.isFalse(listenerSpy.called, "Listener should NOT call before commit");

		limitToken0.commit();
		assert.isTrue(listenerSpy.calledOnce, "Listener should be called once");

		limitToken1.commit();
		assert.isTrue(listenerSpy.calledTwice, "Listener should be called twice");
	});
	it("Should fire callback on rollback", async function () {
		// Setup limit for 2 parallel call
		const limit = new FLimitInternalParallelLimit(2);

		const listenerSpy = spy();
		limit.addReleaseTokenListener(listenerSpy);

		const limitToken0 = limit.accrueToken(1);
		const limitToken1 = limit.accrueToken(1);

		assert.isFalse(listenerSpy.called, "Listener should NOT call before commit");

		limitToken0.rollback();
		assert.isTrue(listenerSpy.calledOnce, "Listener should be called once");

		limitToken1.rollback();
		assert.isTrue(listenerSpy.calledTwice, "Listener should be called twice");
	});
});
