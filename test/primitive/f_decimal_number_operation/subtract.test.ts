import { assert } from "chai";

import { FDecimal,  FDecimalBackend, FDecimalBackendNumber, FDecimalRoundMode } from "../../../src/index.js";


type TestCases = Array<[/*left: */string, /*right: */string, /*expectedResult: */string, /*backends: */Array<FDecimalBackend>]>;

const fractionalDigits = 10;
const roundMode = FDecimalRoundMode.Round;
const operation: FDecimalBackend = new FDecimalBackendNumber(fractionalDigits, roundMode);

const testCases: TestCases = [
	["10", "5", "5", [operation]],
	["0", "-5", "5", [operation]],
	["0.3", "0.1", "0.2", [operation]],
	["0.00000000002", "0.00000000001", "0", [operation]], // should be round to zero according fractionalDigits === 10
	["0.00000000001", "0.00000000002", "0", [operation]], // should be round to zero according fractionalDigits === 10
	["0", "0.2", "-0.2", [operation]],
	["354793854793875498383034114812", "354793854793875498379548374958", "3485739854", [operation]],
	["35479385479387549837954850.981574", "35479385479387549837954837.495835", "13.485739", [operation]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [left, right, expectedResult, backends] = testCase;

	backends.forEach(function (financial: FDecimalBackend) {

		describe.skip(`subtract should be ${left} - ${right} = ${expectedResult}`, function () {

			it("financial.subtract(left: FDecimal, right: FDecimal): FDecimal", function () {
				const friendlyLeft: FDecimal = financial.parse(left);
				const friendlyRight: FDecimal = financial.parse(right);
				const result: FDecimal = financial.subtract(friendlyLeft, friendlyRight);
				assert.equal(result.toString(), expectedResult);
			});

			it("value.subtract(right: FDecimal): FDecimal", function () {
				const friendlyLeft: FDecimal = financial.parse(left);
				const friendlyRight: FDecimal = financial.parse(right);
				const result: FDecimal = friendlyLeft.subtract(friendlyRight);
				assert.equal(result.toString(), expectedResult);
			});
		});
	});
});
