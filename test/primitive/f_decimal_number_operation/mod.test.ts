import { assert } from "chai";

import { FDecimal,  FDecimalBackend, FDecimalBackendNumber, FDecimalRoundMode } from "../../../src";


const fractionalDigits = 10;
const roundMode = FDecimalRoundMode.Round;
const operation: FDecimalBackend = new FDecimalBackendNumber(fractionalDigits, roundMode);

type TestCases = Array<[
	/*left: */string,
	/*right: */string,
	/*expectedResult: */string,
	/*backends: */Array<FDecimalBackend>
]>;

const testCases: TestCases = [
	["10", "3", "1", [operation]],
	["-10", "-3", "-1", [operation]],
	["10", "-3", "1", [operation]],
	["-10", "3", "-1", [operation]],

	["0.9", "0.91", "0.9", [operation]],
	["0.91", "0.91", "0", [operation]],
	["0.92", "0.91", "0.01", [operation]],

	["1331234.3000100011", "21.02", "16.6800100011", [operation]],
	["-1331234.3000100011", "-21.02", "-16.6800100011", [operation]],
	["1331234.3000100011", "-21.02", "16.6800100011", [operation]],
	["-1331234.3000100011", "21.02", "-16.6800100011", [operation]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [left, right, expectedResult, backends] = testCase;

	backends.forEach(function (financial: FDecimalBackend) {
		// tslint:disable-next-line: max-line-length
		describe.skip(`mod with roundMode: ${roundMode}, fractionalDigits: ${fractionalDigits} should be ${left} mod ${right} = ${expectedResult}`, function () {

			it("financial.mod(left: FDecimal, right: FDecimal): FDecimal", function () {
				const friendlyLeft: FDecimal = financial.parse(left);
				const friendlyRight: FDecimal = financial.parse(right);
				const result: FDecimal = financial.mod(friendlyLeft, friendlyRight);
				assert.equal(result.toString(), expectedResult);
			});

			it("value.mod(value: FDecimal): FDecimal", function () {
				const friendlyLeft: FDecimal = financial.parse(left);
				const friendlyRight: FDecimal = financial.parse(right);
				const result: FDecimal = friendlyLeft.mod(friendlyRight);
				assert.equal(result.toString(), expectedResult);
			});
		});
	});
});
