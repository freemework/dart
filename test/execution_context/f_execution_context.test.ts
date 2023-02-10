import {
	FCancellationTokenAggregated, FCancellationTokenSource, FCancellationTokenSourceManual,
	FCancellationExecutionContext, FCancellationExecutionElement, FCancellationToken,
	FExecutionContext, FExecutionContextBase,
	FLoggerLabelsExecutionContext,
	FLoggerPropertiesExecutionElement,
	FLoggerLabels
} from "../../src";

import { assert } from "chai";

describe("FExecutionContext test", function () {
	it("Empty execution context should NOT have prevContext", function () {
		const emptyCtx: FExecutionContext = FExecutionContext.Empty;
		assert.isNull(emptyCtx.prevContext);
	});

	it("Cancellation execution context should be resolved on head of chain", function () {
		const emptyCtx: FExecutionContext = FExecutionContext.Empty;
		const cancellationCtx: FExecutionContext = new FCancellationExecutionContext(emptyCtx, FCancellationToken.Dummy);

		const element: FCancellationExecutionElement = FCancellationExecutionContext.of(cancellationCtx);
		assert.strictEqual(element.owner, cancellationCtx);
		assert.strictEqual(element.cancellationToken, FCancellationToken.Dummy);
	});

	it("Cancellation execution context should be resolved on chain", function () {
		const emptyCtx: FExecutionContext = FExecutionContext.Empty;
		const cancellationCtx: FExecutionContext = new FCancellationExecutionContext(emptyCtx, FCancellationToken.Dummy);
		const stubCtx = new StubExecutionContext(cancellationCtx);

		const element: FCancellationExecutionElement = FCancellationExecutionContext.of(stubCtx);
		assert.strictEqual(element.owner, cancellationCtx);
		assert.strictEqual(element.cancellationToken, FCancellationToken.Dummy);
	});

	it("Cancellation execution context should aggregate tokens", function () {
		const emptyCtx: FExecutionContext = FExecutionContext.Empty;

		const cts1: FCancellationTokenSource = new FCancellationTokenSourceManual();
		const cts2: FCancellationTokenSource = new FCancellationTokenSourceManual();

		const cancellationCtx1: FExecutionContext = new FCancellationExecutionContext(emptyCtx, cts1.token);
		const cancellationCtx2: FExecutionContext = new FCancellationExecutionContext(cancellationCtx1, cts2.token, true);
		const stubCtx = new StubExecutionContext(cancellationCtx2);

		const element: FCancellationExecutionElement = FCancellationExecutionContext.of(stubCtx);
		assert.strictEqual(element.owner, cancellationCtx2);
		assert.notStrictEqual(element.cancellationToken, cts1.token);
		assert.notStrictEqual(element.cancellationToken, cts2.token);
		assert.instanceOf(element.cancellationToken, FCancellationTokenAggregated);
	});

	it("Logger execution context should be resolved on head of chain", function () {
		const emptyCtx: FExecutionContext = FExecutionContext.Empty;
		const loggerCtx: FExecutionContext = new FLoggerLabelsExecutionContext(emptyCtx, { name: "test", value: "42" });

		const element: FLoggerPropertiesExecutionElement = FLoggerLabelsExecutionContext.of(loggerCtx)!;
		assert.isNotNull(element);
		assert.strictEqual(element.owner, loggerCtx);
		assert.strictEqual(element.loggerLabels.name, "test");
		assert.strictEqual(element.loggerLabels.value, "42");
	});

	it("Logger execution context should be resolved on chain", function () {
		const emptyCtx: FExecutionContext = FExecutionContext.Empty;
		const loggerCtx1: FExecutionContext = new FLoggerLabelsExecutionContext(emptyCtx, { name: "test", value: "42" });
		const loggerCtx2: FExecutionContext = new FLoggerLabelsExecutionContext(loggerCtx1, { name: "test", value: "43" });
		const stubCtx = new StubExecutionContext(loggerCtx2);

		const element: FLoggerPropertiesExecutionElement = FLoggerLabelsExecutionContext.of(stubCtx)!;
		assert.isNotNull(element);
		assert.strictEqual(element.owner, loggerCtx2);
		assert.deepEqual({ ...element.loggerLabels }, { name: "test", value: "42" });
	});
});

class StubExecutionContext extends FExecutionContextBase {
}
