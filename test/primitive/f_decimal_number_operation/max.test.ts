import { assert } from "chai";

import { FDecimal,  FDecimalBackend, FDecimalBackendNumber, FDecimalRoundMode } from "../../../src";


type TestCases = Array<[/*left: */string, /*right: */string, /*expectedResult: */string, /*backends: */Array<FDecimalBackend>]>;

const fractionalDigits = 10;
const roundMode = FDecimalRoundMode.Round;
const operation: FDecimalBackend = new FDecimalBackendNumber(fractionalDigits, roundMode);

const testCases: TestCases = [
	["5", "10", "10", [operation]],
	["-5", "5", "5", [operation]],
	["0.1", "0.2", "0.2", [operation]],
	["0.1", "-0.2", "0.1", [operation]],
	["0.00000000001", "0.00000000002", "0", [operation]], // should be round to zero according fractionalDigits === 10
	["0", "0.2", "0.2", [operation]],
	["354793854793875498379548374958", "3485739854", "354793854793875498379548374958", [operation]],
	["35479385479387549837954837.495835", "13.485739", "35479385479387549837954837.495835", [operation]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [left, right, expectedResult, backends] = testCase;

	backends.forEach(function (financial: FDecimalBackend) {

		describe.skip(`max should be ${left} vs ${right} = ${expectedResult}`, function () {

			it("financial.max(left: FDecimal, right: FDecimal): FDecimal", function () {
				const friendlyLeft: FDecimal = financial.parse(left);
				const friendlyRight: FDecimal = financial.parse(right);
				const result: FDecimal = financial.max(friendlyLeft, friendlyRight);
				assert.equal(result.toString(), expectedResult);
			});
		});
	});
});
