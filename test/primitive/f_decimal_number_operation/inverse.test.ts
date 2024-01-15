import { assert } from "chai";

import { FDecimal,  FDecimalBackend, FDecimalBackendNumber, FDecimalRoundMode } from "../../../src/index.js";


type TestCases = Array<[/*value: */string, /*expectedResult: */string, /*backends: */Array<FDecimalBackend>]>;

const fractionalDigits = 10;
const roundMode = FDecimalRoundMode.Round;
const operation: FDecimalBackend = new FDecimalBackendNumber(fractionalDigits, roundMode);

const testCases: TestCases = [
	["5", "-5", [operation]],
	["-5", "5",  [operation]],
	["0.1", "-0.1", [operation]],
	["-0.1", "0.1", [operation]],
	["0.00000000001", "0", [operation]], // should be round to zero according fractionalDigits === 10
	["-0.00000000001", "0", [operation]], // should be round to zero according fractionalDigits === 10
	["354793854793875498379548374958", "-354793854793875498379548374958", [operation]],
	["-354793854793875498379548374958", "354793854793875498379548374958", [operation]],
	["35479385479387549837954837.495835", "-35479385479387549837954837.495835", [operation]],
	["-35479385479387549837954837.495835", "35479385479387549837954837.495835", [operation]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [test, expectedResult, backends] = testCase;

	backends.forEach(function (financial: FDecimalBackend) {

		describe.skip(`inverse should be ${test} => ${expectedResult}`, function () {

			it("financial.inverse(value: FDecimal): FDecimal", function () {
				const friendlyTest: FDecimal = financial.parse(test);
				const result: FDecimal = financial.inverse(friendlyTest);
				assert.equal(result.toString(), expectedResult);
			});

			it("value.inverse(): FDecimal", function () {
				const friendlyTest: FDecimal = financial.parse(test);
				const result: FDecimal = friendlyTest.inverse();
				assert.equal(result.toString(), expectedResult);
			});
		});
	});
});
