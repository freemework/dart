import { assert } from "chai";

import { FDecimal,  FDecimalBackend, FDecimalBackendNumber, FDecimalRoundMode } from "../../../src/index.js";


type TestCases = Array<[/*left: */string, /*right: */string, /*expectedResult: */string, /*backends: */Array<FDecimalBackend>]>;

const fractionalDigits = 10;
const roundMode = FDecimalRoundMode.Round;
const operation: FDecimalBackend = new FDecimalBackendNumber(fractionalDigits, roundMode);

const testCases: TestCases = [
	["5", "5", "10", [operation]],
	["-5", "5", "0", [operation]],
	["0.1", "0.2", "0.3", [operation]],
	["0.00000000001", "0.00000000002", "0", [operation]], // should be round to zero according fractionalDigits === 10
	["0", "0.2", "0.2", [operation]],
	["354793854793875498379548374958", "3485739854", "354793854793875498383034114812", [operation]],
	["35479385479387549837954837.495835", "13.485739", "35479385479387549837954850.981574", [operation]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [left, right, expectedResult, backends] = testCase;

	backends.forEach(function (financial: FDecimalBackend) {

		describe.skip(`add should be ${left} + ${right} = ${expectedResult}`, function () {

			it("financial.add(left: FDecimal, right: FDecimal): FDecimal", function () {
				const friendlyLeft: FDecimal = financial.parse(left);
				const friendlyRight: FDecimal = financial.parse(right);
				const result: FDecimal = financial.add(friendlyLeft, friendlyRight);
				assert.equal(result.toString(), expectedResult);
			});

			it("value.add(right: FDecimal): FDecimal", function () {
				const friendlyLeft: FDecimal = financial.parse(left);
				const friendlyRight: FDecimal = financial.parse(right);
				const result: FDecimal = friendlyLeft.add(friendlyRight);
				assert.equal(result.toString(), expectedResult);
			});
		});
	});
});
