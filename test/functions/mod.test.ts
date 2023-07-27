import { FDecimal, FDecimalBackend, FDecimalRoundMode } from "@freemework/common";

import { assert } from "chai";

import { FDecimalBackendBigNumber } from "../../src/index";

const fractionalDigits = 10;
const roundMode = FDecimalRoundMode.Round;
const testBackend = new FDecimalBackendBigNumber(fractionalDigits, roundMode);


type TestCases = Array<[
	/*left: */string,
	/*right: */string,
	/*expectedResult: */string,
	/*backends: */Array<FDecimalBackend>
]>;

const testCases: TestCases = [
	["10", "3", "1", [testBackend]],
	["-10", "-3", "-1", [testBackend]],
	["10", "-3", "1", [testBackend]],
	["-10", "3", "-1", [testBackend]],

	["0.9", "0.91", "0.9", [testBackend]],
	["0.91", "0.91", "0", [testBackend]],
	["0.92", "0.91", "0.01", [testBackend]],

	["1331234.3000100011", "21.02", "16.6800100011", [testBackend]],
	["-1331234.3000100011", "-21.02", "-16.6800100011", [testBackend]],
	["1331234.3000100011", "-21.02", "16.6800100011", [testBackend]],
	["-1331234.3000100011", "21.02", "-16.6800100011", [testBackend]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [left, right, expectedResult, backends] = testCase;

	backends.forEach(function (backend: FDecimalBackend) {
		// tslint:disable-next-line: max-line-length
		describe(`mod with roundMode: ${roundMode}, fractionalDigits: ${fractionalDigits} should be ${left} mod ${right} = ${expectedResult}`, function () {
			before(() => { FDecimal.configure(backend); });
			after(() => { (FDecimal as any)._cfg = null; });

			it("FDecimal.mod(left: FDecimal, right: FDecimal): FDecimal", function () {
				const friendlyLeft: FDecimal = FDecimal.parse(left);
				const friendlyRight: FDecimal = FDecimal.parse(right);
				const result: FDecimal = FDecimal.mod(friendlyLeft, friendlyRight);
				assert.equal(result.toString(), expectedResult);
			});
		});
	});
});
