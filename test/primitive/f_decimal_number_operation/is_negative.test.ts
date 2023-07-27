import { assert } from "chai";

import { FDecimal,  FDecimalBackend, FDecimalBackendNumber, FDecimalRoundMode } from "../../../src";


type TestCases = Array<[/*left: */string, /*expectedResult: */boolean, /*backends: */Array<FDecimalBackend>]>;

const fractionalDigits = 10;
const roundMode = FDecimalRoundMode.Round;
const operation: FDecimalBackend = new FDecimalBackendNumber(fractionalDigits, roundMode);

const testCases: TestCases = [
	["5", false, [operation]],
	["-5", true, [operation]],
	["0.1", false, [operation]],
	["-0.1", true, [operation]],
	["0.00000000002", false, [operation]], // should be round to zero according fractionalDigits === 10
	["0.00000000001", false, [operation]], // should be round to zero according fractionalDigits === 10
	["0", false, [operation]],
	["-354793854793875498379548374958", true, [operation]],
	["354793854793875498379548374958", false, [operation]],
	["-35479385479387549837954837.495835", true, [operation]],
	["35479385479387549837954837.495835", false, [operation]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [test, expectedResult, backends] = testCase;

	backends.forEach(function (financial: FDecimalBackend) {

		const msg = expectedResult === true ? "negative" : "not negative";
		describe.skip(`isNegative should be ${test} is ${msg}`, function () {

			it("financial.isNegative(test: FDecimal): boolean", function () {
				const friendlyTest: FDecimal = financial.parse(test);
				const result: boolean = financial.isNegative(friendlyTest);
				assert.equal(result, expectedResult);
			});

			it("value.isNegative(): boolean", function () {
				const friendlyTest: FDecimal = financial.parse(test);
				const result: boolean = friendlyTest.isNegative();
				assert.equal(result, expectedResult);
			});
		});
	});
});
