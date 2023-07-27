import { FDecimal, FDecimalBackend, FDecimalRoundMode } from "@freemework/common";

import { assert } from "chai";

import { FDecimalBackendBigNumber } from "../../src/index";

const fractionalDigits = 2;
const roundMode = FDecimalRoundMode.Round;
const testBackend = new FDecimalBackendBigNumber(fractionalDigits, roundMode);


type TestCases = Array<[/*value: */number, /*expectedResult: */string, /*backends: */Array<FDecimalBackend>]>;

const testCases: TestCases = [
	[0.001, "0", [testBackend]], // should be round to zero according fractionalDigits === 2
	[-0.001, "0", [testBackend]], // should be round to zero according fractionalDigits === 2
	[-0.009, "-0.01", [testBackend]], // should be round to zero according fractionalDigits === 2
	[0.009, "0.01", [testBackend]], // should be round to zero according fractionalDigits === 2
	[424242424242424242424242.424242424242424242421111, "424242424242424200000000", [testBackend]],
	[4.242424242424242e+23, "424242424242424200000000", [testBackend]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [test, expectedResult, backends] = testCase;

	backends.forEach(function (backend: FDecimalBackend) {
		describe(`fromFloat should be ${test} => ${expectedResult}`, function () {
			before(() => { FDecimal.configure(backend); });
			after(() => { (FDecimal as any)._cfg = null; });

			it("FDecimal.fromFloat(value: number): Financial", function () {
				const result: FDecimal = FDecimal.fromFloat(test);
				const friendlyResult = result.toString();
				assert.isString(friendlyResult);
				assert.equal(friendlyResult, expectedResult);
			});
		});
	});
});
