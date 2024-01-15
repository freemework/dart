import { assert } from "chai";

import { FDecimal,  FDecimalBackend, FDecimalBackendNumber, FDecimalRoundMode } from "../../../src/index.js";


type TestCases = Array<[/*left: */string, /*expectedResult: */boolean, /*backends: */Array<FDecimalBackend>]>;

const fractionalDigits = 10;
const roundMode = FDecimalRoundMode.Round;
const operation: FDecimalBackend = new FDecimalBackendNumber(fractionalDigits, roundMode);

const testCases: TestCases = [
	["6", false, [operation]],
	["5", false, [operation]],
	["-5", false, [operation]],
	["0.1", false, [operation]],
	["0.00000000002", true, [operation]], // should be round to zero according fractionalDigits === 10
	["0.00000000001", true, [operation]], // should be round to zero according fractionalDigits === 10
	["0", true, [operation]],
	["354793854793875498379548374958", false, [operation]],
	["35479385479387549837954837.495835", false, [operation]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [test, expectedResult, backends] = testCase;

	backends.forEach(function (financial: FDecimalBackend) {
		const msg = expectedResult === true ? "zero" : "not zero";
		describe.skip(`isZero should be ${test} is ${msg}`, function () {

			it("financial.isZero(test: FDecimal): boolean", function () {
				const friendlyTest: FDecimal = financial.parse(test);
				const result: boolean = financial.isZero(friendlyTest);
				assert.equal(result, expectedResult);
			});

			it("value.isZero(): boolean", function () {
				const friendlyTest: FDecimal = financial.parse(test);
				const result: boolean = friendlyTest.isZero();
				assert.equal(result, expectedResult);
			});
		});
	});
});
