import { FDecimal, FDecimalBackend, FDecimalRoundMode } from "@freemework/common";

import { assert } from "chai";

import { FDecimalBackendBigNumber } from "../src";

describe(`FDecimalBackendBigNumber Tests`, function () {
	it("Should miss precision (due overflow)", function () {
		const backend = new FDecimalBackendBigNumber(20, FDecimalRoundMode.Round);
		const decimal = backend.parse("123456789012345678901234.123456789012345678999234")
		const str = backend.toString(decimal);
		assert.equal(str, "123456789012345678901234.123456789012345679");
	});

	it("Should NOT miss precision", function () {
		const backend = new FDecimalBackendBigNumber(24, FDecimalRoundMode.Round);
		const decimal = backend.parse("123456789012345678901234.123456789012345678901234");
		const str = backend.toString(decimal);
		assert.equal(str, "123456789012345678901234.123456789012345678901234");
	});
});
