import { FDecimal } from "@freemework/common";

import { assert } from "chai";

import { FDecimalBackendBigNumber } from "../../src/index";

const fractionalDigits = 10;
const roundMode = FDecimal.RoundMode.Round;
const testBackend = new FDecimalBackendBigNumber(fractionalDigits, roundMode);


type TestCases = Array<[/*left: */string, /*right: */string, /*expectedResult: */boolean, /*backends: */Array<FDecimal.Backend>]>;

const testCases: TestCases = [
	["6", "5", false, [testBackend]],
	["5", "5", true, [testBackend]],
	["-5", "5", true, [testBackend]],
	["0.1", "0.2", true, [testBackend]],
	["0.00000000002", "0.00000000001", true, [testBackend]], // should be round to zero according fractionalDigits === 10
	["0.00000000001", "0.00000000002", true, [testBackend]], // should be round to zero according fractionalDigits === 10
	["0", "0.2", true, [testBackend]],
	["354793854793875498379548374958", "3485739854", false, [testBackend]],
	["35479385479387549837954837.495835", "13.485739", false, [testBackend]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [left, right, expectedResult, backends] = testCase;

	backends.forEach(function (backend: FDecimal.Backend) {
		describe(`lte should be ${left} <= ${right} = ${expectedResult}`, function () {
			before(() => { FDecimal.configure(backend); });
			after(() => { (FDecimal as any)._cfg = null; });

			it("FDecimal.lte(left: FDecimal, right: FDecimal): boolean", function () {
				const friendlyLeft: FDecimal = FDecimal.parse(left);
				const friendlyRight: FDecimal = FDecimal.parse(right);
				const result: boolean = FDecimal.lte(friendlyLeft, friendlyRight);
				assert.equal(result, expectedResult);
			});
		});
	});
});
