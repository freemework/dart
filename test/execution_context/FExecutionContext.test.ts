import {
	FCancellationTokenAggregated, FCancellationTokenSource, FCancellationTokenSourceManual,
	FExecutionContextCancellation, FExecutionElementCancellation, FCancellationToken,
	FExecutionContext, FExecutionContextBase,
	FExecutionContextLoggerProperties,
	FExecutionElementLoggerProperties,
	FLoggerProperties
} from "../../src/index";

import { assert } from "chai";

describe("FExecutionContext test", function () {
	it("Empty execution context should NOT have prevContext", function () {
		const emptyCtx: FExecutionContext = FExecutionContext.Empty;
		assert.isNull(emptyCtx.prevContext);
	});

	it("Cancellation execution context should be resolved on head of chain", function () {
		const emptyCtx: FExecutionContext = FExecutionContext.Empty;
		const cancellationCtx: FExecutionContext = new FExecutionContextCancellation(emptyCtx, FCancellationToken.Dummy);

		const element: FExecutionElementCancellation = FExecutionContextCancellation.of(cancellationCtx);
		assert.strictEqual(element.owner, cancellationCtx);
		assert.strictEqual(element.cancellationToken, FCancellationToken.Dummy);
	});

	it("Cancellation execution context should be resolved on chain", function () {
		const emptyCtx: FExecutionContext = FExecutionContext.Empty;
		const cancellationCtx: FExecutionContext = new FExecutionContextCancellation(emptyCtx, FCancellationToken.Dummy);
		const stubCtx = new StubExecutionContext(cancellationCtx);

		const element: FExecutionElementCancellation = FExecutionContextCancellation.of(stubCtx);
		assert.strictEqual(element.owner, cancellationCtx);
		assert.strictEqual(element.cancellationToken, FCancellationToken.Dummy);
	});

	it("Cancellation execution context should aggregate tokens", function () {
		const emptyCtx: FExecutionContext = FExecutionContext.Empty;

		const cts1: FCancellationTokenSource = new FCancellationTokenSourceManual();
		const cts2: FCancellationTokenSource = new FCancellationTokenSourceManual();

		const cancellationCtx1: FExecutionContext = new FExecutionContextCancellation(emptyCtx, cts1.token);
		const cancellationCtx2: FExecutionContext = new FExecutionContextCancellation(cancellationCtx1, cts2.token, true);
		const stubCtx = new StubExecutionContext(cancellationCtx2);

		const element: FExecutionElementCancellation = FExecutionContextCancellation.of(stubCtx);
		assert.strictEqual(element.owner, cancellationCtx2);
		assert.notStrictEqual(element.cancellationToken, cts1.token);
		assert.notStrictEqual(element.cancellationToken, cts2.token);
		assert.instanceOf(element.cancellationToken, FCancellationTokenAggregated);
	});

	it("Logger execution context should be resolved on head of chain", function () {
		const emptyCtx: FExecutionContext = FExecutionContext.Empty;
		const loggerCtx: FExecutionContext = new FExecutionContextLoggerProperties(emptyCtx, { name: "test", value: "42" });

		const element: FExecutionElementLoggerProperties = FExecutionContextLoggerProperties.of(loggerCtx);
		assert.strictEqual(element.owner, loggerCtx);
		assert.strictEqual(element.loggerProperties.name, "test");
		assert.strictEqual(element.loggerProperties.value, "42");
	});

	it("Logger execution context should be resolved on chain", function () {
		const emptyCtx: FExecutionContext = FExecutionContext.Empty;
		const loggerCtx1: FExecutionContext = new FExecutionContextLoggerProperties(emptyCtx, { name: "test", value: "42" });
		const loggerCtx2: FExecutionContext = new FExecutionContextLoggerProperties(loggerCtx1, { name: "test", value: "43" });
		const stubCtx = new StubExecutionContext(loggerCtx2);

		const element: FExecutionElementLoggerProperties = FExecutionContextLoggerProperties.of(stubCtx);
		assert.strictEqual(element.owner, loggerCtx2);
		assert.deepEqual({ ...element.loggerProperties }, { name: "test", value: "42" });
	});
});

class StubExecutionContext extends FExecutionContextBase {
}
