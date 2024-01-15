import { FDecimal, FDecimalBackend, FDecimalRoundMode } from "@freemework/common";

import { assert } from "chai";

import { FDecimalBackendBigNumber } from "../../src/index.js";

const fractionalDigits = 10;
const roundMode = FDecimalRoundMode.Round;
const testBackend = new FDecimalBackendBigNumber(fractionalDigits, roundMode);


type TestCases = Array<[/*left: */string, /*right: */string, /*expectedResult: */string, /*backends: */Array<FDecimalBackend>]>;

const testCases: TestCases = [
	["10", "5", "5", [testBackend]],
	["0", "-5", "5", [testBackend]],
	["0.3", "0.1", "0.2", [testBackend]],
	["0.00000000002", "0.00000000001", "0", [testBackend]], // should be round to zero according fractionalDigits === 10
	["0.00000000001", "0.00000000002", "0", [testBackend]], // should be round to zero according fractionalDigits === 10
	["0", "0.2", "-0.2", [testBackend]],
	["354793854793875498383034114812", "354793854793875498379548374958", "3485739854", [testBackend]],
	["35479385479387549837954850.981574", "35479385479387549837954837.495835", "13.485739", [testBackend]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [left, right, expectedResult, backends] = testCase;

	backends.forEach(function (backend: FDecimalBackend) {
		describe(`subtract should be ${left} - ${right} = ${expectedResult}`, function () {
			before(() => { FDecimal.configure(backend); });
			after(() => { (FDecimal as any)._cfg = null; });

			it("FDecimal.subtract(left: FDecimal, right: FDecimal): FDecimal", function () {
				const friendlyLeft: FDecimal = FDecimal.parse(left);
				const friendlyRight: FDecimal = FDecimal.parse(right);
				const result: FDecimal = FDecimal.subtract(friendlyLeft, friendlyRight);
				assert.equal(result.toString(), expectedResult);
			});

			it("value.subtract(right: FDecimal): FDecimal", function () {
				const friendlyLeft: FDecimal = FDecimal.parse(left);
				const friendlyRight: FDecimal = FDecimal.parse(right);
				const result: FDecimal = friendlyLeft.subtract(friendlyRight);
				assert.equal(result.toString(), expectedResult);
			});
		});
	});
});
