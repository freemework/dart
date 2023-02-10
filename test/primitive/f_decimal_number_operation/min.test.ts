import { assert } from "chai";

import { FDecimal, FDecimalBackendNumber } from "../../../src";


type TestCases = Array<[/*left: */string, /*right: */string, /*expectedResult: */string, /*backends: */Array<FDecimal.Backend>]>;

const fractionalDigits = 10;
const roundMode = FDecimal.RoundMode.Round;
const operation: FDecimal.Backend = new FDecimalBackendNumber(fractionalDigits, roundMode);

const testCases: TestCases = [
	["5", "10", "5", [operation]],
	["-5", "5", "-5", [operation]],
	["0.1", "0.2", "0.1", [operation]],
	["0.1", "-0.2", "-0.2", [operation]],
	["0.00000000001", "0.00000000002", "0", [operation]], // should be round to zero according fractionalDigits === 10
	["0", "0.2", "0", [operation]],
	["354793854793875498379548374958", "3485739854", "3485739854", [operation]],
	["35479385479387549837954837.495835", "13.485739", "13.485739", [operation]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [left, right, expectedResult, backends] = testCase;

	backends.forEach(function (financial: FDecimal.Backend) {

		describe.skip(`min should be ${left} vs ${right} = ${expectedResult}`, function () {

			it("financial.min(left: FDecimal, right: FDecimal): FDecimal", function () {
				const friendlyLeft: FDecimal = financial.parse(left);
				const friendlyRight: FDecimal = financial.parse(right);
				const result: FDecimal = financial.min(friendlyLeft, friendlyRight);
				assert.equal(result.toString(), expectedResult);
			});
		});
	});
});
