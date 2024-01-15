import { assert } from "chai";

import { FDecimal,  FDecimalBackend, FDecimalBackendNumber, FDecimalRoundMode } from "../../../src/index.js";


type TestCases = Array<[/*left: */string, /*right: */string, /*expectedResult: */boolean, /*backends: */Array<FDecimalBackend>]>;

const fractionalDigits = 10;
const roundMode = FDecimalRoundMode.Round;
const operation: FDecimalBackend = new FDecimalBackendNumber(fractionalDigits, roundMode);

const testCases: TestCases = [
	["5", "5", true, [operation]],
	["-5", "5", false, [operation]],
	["0.1", "0.1", true, [operation]],
	["-0.1", "0.1", false, [operation]],
	["0.00000000001", "0", true, [operation]], // should be round to zero according fractionalDigits === 10
	["-0.00000000001", "0", true, [operation]], // should be round to zero according fractionalDigits === 10
	["354793854793875498379548374958", "354793854793875498379548374958", true, [operation]],
	["-354793854793875498379548374958", "354793854793875498379548374958", false, [operation]],
	["35479385479387549837954837.495835", "35479385479387549837954837.495835", true, [operation]],
	["-35479385479387549837954837.495835", "35479385479387549837954837.495835", false, [operation]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [left, right, expectedResult, backends] = testCase;

	backends.forEach(function (financial: FDecimalBackend) {
		const msg = expectedResult === true ? "===" : "!==";
		describe.skip(`equals should be ${left} ${msg} ${right}`, function () {

			it("financial.equals(left: FDecimal, right: FDecimal): FDecimal", function () {
				const friendlyLeft: FDecimal = financial.parse(left);
				const friendlyRight: FDecimal = financial.parse(right);
				const result: boolean = financial.equals(friendlyLeft, friendlyRight);
				assert.strictEqual(result, expectedResult);
			});

			it("value.equals(right: FDecimal): FDecimal", function () {
				const friendlyLeft: FDecimal = financial.parse(left);
				const friendlyRight: FDecimal = financial.parse(right);
				const result: boolean = friendlyLeft.equals(friendlyRight);
				assert.strictEqual(result, expectedResult);
			});
		});
	});
});
