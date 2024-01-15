import { FDecimal, FDecimalBackend, FDecimalRoundMode } from "@freemework/common";

import { assert } from "chai";

import { FDecimalBackendBigNumber } from "../../src/index.js";

const fractionalDigits = 10;
const roundMode = FDecimalRoundMode.Round;
const testBackend = new FDecimalBackendBigNumber(fractionalDigits, roundMode);


type TestCases = Array<[/*left: */string, /*right: */string, /*expectedResult: */boolean, /*backends: */Array<FDecimalBackend>]>;

const testCases: TestCases = [
	["6", "5", true, [testBackend]],
	["5", "5", true, [testBackend]],
	["-5", "5", false, [testBackend]],
	["0.1", "0.2", false, [testBackend]],
	["0.00000000002", "0.00000000001", true, [testBackend]], // should be round to zero according fractionalDigits === 10
	["0.00000000001", "0.00000000002", true, [testBackend]], // should be round to zero according fractionalDigits === 10
	["0", "0.2", false, [testBackend]],
	["354793854793875498379548374958", "3485739854", true, [testBackend]],
	["35479385479387549837954837.495835", "13.485739", true, [testBackend]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [left, right, expectedResult, backends] = testCase;

	backends.forEach(function (backend: FDecimalBackend) {
		describe(`gte should be ${left} >= ${right} = ${expectedResult}`, function () {
			before(() => { FDecimal.configure(backend); });
			after(() => { (FDecimal as any)._cfg = null; });

			it("FDecimal.gte(left: FDecimal, right: FDecimal): boolean", function () {
				const friendlyLeft: FDecimal = FDecimal.parse(left);
				const friendlyRight: FDecimal = FDecimal.parse(right);
				const result: boolean = FDecimal.gte(friendlyLeft, friendlyRight);
				assert.equal(result, expectedResult);
			});
		});
	});
});
