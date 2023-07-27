import { FDecimal, FDecimalBackend, FDecimalRoundMode } from "@freemework/common";

import { assert } from "chai";

import { FDecimalBackendBigNumber } from "../../src/index";

describe(`toJSON tests`, function () {
	before(() => { FDecimal.configure(new FDecimalBackendBigNumber(10, FDecimalRoundMode.Round)); });
	after(() => { (FDecimal as any)._cfg = null; });

	it("toJSON() should represent decimal string", function () {
		const test: FDecimal = FDecimal.parse("42.42");

		const result: string = test.toJSON();

		assert.equal(result, "42.42");
	});

	it("JSON.stringify() should serialize", function () {
		const test: FDecimal = FDecimal.parse("42.42");

		const result: string = JSON.stringify({ test });

		assert.equal(result, '{"test":"42.42"}');
	});
});
