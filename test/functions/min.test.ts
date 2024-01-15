import { FDecimal, FDecimalBackend, FDecimalRoundMode } from "@freemework/common";

import { assert } from "chai";

import { FDecimalBackendBigNumber } from "../../src/index.js";

const fractionalDigits = 10;
const roundMode = FDecimalRoundMode.Round;
const testBackend = new FDecimalBackendBigNumber(fractionalDigits, roundMode);


type TestCases = Array<[/*left: */string, /*right: */string, /*expectedResult: */string, /*backends: */Array<FDecimalBackend>]>;

const testCases: TestCases = [
	["5", "10", "5", [testBackend]],
	["-5", "5", "-5", [testBackend]],
	["0.1", "0.2", "0.1", [testBackend]],
	["0.1", "-0.2", "-0.2", [testBackend]],
	["0.00000000001", "0.00000000002", "0", [testBackend]], // should be round to zero according fractionalDigits === 10
	["0", "0.2", "0", [testBackend]],
	["354793854793875498379548374958", "3485739854", "3485739854", [testBackend]],
	["35479385479387549837954837.495835", "13.485739", "13.485739", [testBackend]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [left, right, expectedResult, backends] = testCase;

	backends.forEach(function (backend: FDecimalBackend) {
		describe(`min should be ${left} vs ${right} = ${expectedResult}`, function () {
			before(() => { FDecimal.configure(backend); });
			after(() => { (FDecimal as any)._cfg = null; });

			it("FDecimal.min(left: FDecimal, right: FDecimal): FDecimal", function () {
				const friendlyLeft: FDecimal = FDecimal.parse(left);
				const friendlyRight: FDecimal = FDecimal.parse(right);
				const result: FDecimal = FDecimal.min(friendlyLeft, friendlyRight);
				assert.equal(result.toString(), expectedResult);
			});
		});
	});
});
