import {
	FCancellationTokenAggregated, FCancellationTokenSource, FCancellationTokenSourceManual,
	FExecutionContextCancellation, FExecutionElementCancellation, FCancellationToken,
	FExecutionContext, FExecutionContextBase,
	FExecutionContextLoggerProperties,
	FExecutionElementLoggerProperties,
	FLoggerProperty
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

	it("LoggerLegacy execution context should be resolved on head of chain", function () {
		const emptyCtx: FExecutionContext = FExecutionContext.Empty;
		const loggerCtx: FExecutionContext = new FExecutionContextLoggerProperties(emptyCtx, { name: "test", value: "42" });

		const element: FExecutionElementLoggerProperties = FExecutionContextLoggerProperties.of(loggerCtx);
		assert.strictEqual(element.owner, loggerCtx);
		assert.strictEqual(element.loggerProperties[0].name, "test");
		assert.strictEqual(element.loggerProperties[0].value, "42");
	});

	it("LoggerLegacy execution context should be resolved on chain", function () {
		const emptyCtx: FExecutionContext = FExecutionContext.Empty;
		const logProp: FLoggerProperty = { name: "test", value: "42" };
		const loggerCtx: FExecutionContext = new FExecutionContextLoggerProperties(emptyCtx, logProp);
		const stubCtx = new StubExecutionContext(loggerCtx);

		const element: FExecutionElementLoggerProperties = FExecutionContextLoggerProperties.of(stubCtx);
		assert.strictEqual(element.owner, loggerCtx);
		assert.strictEqual([...element.loggerProperties][0], logProp);
	});
});

class StubExecutionContext extends FExecutionContextBase {
}
