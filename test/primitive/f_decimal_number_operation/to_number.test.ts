import { assert } from "chai";

import { FDecimal,  FDecimalBackend, FDecimalBackendNumber, FDecimalRoundMode } from "../../../src";

type TestCases = Array<[/*value: */string, /*expectedResult: */number, /*backends: */Array<FDecimalBackend>]>;

const fractionalDigits = 10;
const roundMode = FDecimalRoundMode.Round;
const operation: FDecimalBackend = new FDecimalBackendNumber(fractionalDigits, roundMode);

const testCases: TestCases = [
	["5", 5, [operation]],
	["-5", -5,  [operation]],
	["0.1", 0.1, [operation]],
	["-0.1", -0.1, [operation]],
	["0.00000000001", 0, [operation]], // should be round to zero according fractionalDigits === 10
	["-0.00000000001", 0, [operation]] // should be round to zero according fractionalDigits === 10
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [test, expectedResult, backends] = testCase;

	backends.forEach(function (financial: FDecimalBackend) {

		describe.skip(`toNumber should be ${test} => ${expectedResult}`, function () {

			it("financial.toNumber(value: FDecimal): number", function () {
				const friendlyTest: FDecimal = financial.parse(test);
				const result: number = financial.toNumber(friendlyTest);
				assert.equal(result, expectedResult);
			});

			it("value.toNumber(): number", function () {
				const friendlyTest: FDecimal = financial.parse(test);
				const result: number = friendlyTest.toNumber();
				assert.equal(result, expectedResult);
			});
		});
	});
});
