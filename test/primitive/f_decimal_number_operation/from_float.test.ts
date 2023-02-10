import { assert } from "chai";

import { FDecimal, FDecimalBackendNumber } from "../../../src";


type TestCases = Array<[/*value: */number, /*expectedResult: */string, /*backends: */Array<FDecimal.Backend>]>;

const fractionalDigits = 2;
const roundMode = FDecimal.RoundMode.Round;
const operation: FDecimal.Backend = new FDecimalBackendNumber(fractionalDigits, roundMode);

const testCases: TestCases = [
	[0.001, "0", [operation]], // should be round to zero according fractionalDigits === 2
	[-0.001, "0", [operation]], // should be round to zero according fractionalDigits === 2
	[-0.009, "-0.01", [operation]], // should be round to zero according fractionalDigits === 2
	[0.009, "0.01", [operation]], // should be round to zero according fractionalDigits === 2
	[424242424242424242424242.424242424242424242421111, "424242424242424200000000", [operation]],
	[4.242424242424242e+23, "424242424242424200000000", [operation]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [test, expectedResult, backends] = testCase;

	backends.forEach(function (financial: FDecimal.Backend) {

		describe.skip(`fromFloat should be ${test} => ${expectedResult}`, function () {

			it("financial.fromFloat(value: number): Financial", function () {
				const result: FDecimal = financial.fromFloat(test);
				const friendlyResult = result.toString();
				assert.isString(friendlyResult);
				assert.equal(friendlyResult, expectedResult);
			});
		});
	});
});
