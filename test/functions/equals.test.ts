import { FDecimal, FDecimalBackend, FDecimalRoundMode } from "@freemework/common";

import { assert } from "chai";

import { FDecimalBackendBigNumber } from "../../src/index.js";

const fractionalDigits = 10;
const roundMode = FDecimalRoundMode.Round;
const testBackend = new FDecimalBackendBigNumber(fractionalDigits, roundMode);


type TestCases = Array<[/*left: */string, /*right: */string, /*expectedResult: */boolean, /*backends: */Array<FDecimalBackend>]>;

const testCases: TestCases = [
	["5", "5", true, [testBackend]],
	["-5", "5", false, [testBackend]],
	["0.1", "0.1", true, [testBackend]],
	["-0.1", "0.1", false, [testBackend]],
	["0.00000000001", "0", true, [testBackend]], // should be round to zero according fractionalDigits === 10
	["-0.00000000001", "0", true, [testBackend]], // should be round to zero according fractionalDigits === 10
	["354793854793875498379548374958", "354793854793875498379548374958", true, [testBackend]],
	["-354793854793875498379548374958", "354793854793875498379548374958", false, [testBackend]],
	["35479385479387549837954837.495835", "35479385479387549837954837.495835", true, [testBackend]],
	["-35479385479387549837954837.495835", "35479385479387549837954837.495835", false, [testBackend]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [left, right, expectedResult, backends] = testCase;

	backends.forEach(function (backend: FDecimalBackend) {
		const msg = expectedResult === true ? "===" : "!==";
		describe(`equals should be ${left} ${msg} ${right}`, function () {
			before(() => { FDecimal.configure(backend); });
			after(() => { (FDecimal as any)._cfg = null; });

			it("FDecimal.equals(left: FDecimal, right: FDecimal): FDecimal", function () {
				const friendlyLeft: FDecimal = FDecimal.parse(left);
				const friendlyRight: FDecimal = FDecimal.parse(right);
				const result: boolean = FDecimal.equals(friendlyLeft, friendlyRight);
				assert.strictEqual(result, expectedResult);
			});

			it("value.equals(right: FDecimal): FDecimal", function () {
				const friendlyLeft: FDecimal = FDecimal.parse(left);
				const friendlyRight: FDecimal = FDecimal.parse(right);
				const result: boolean = friendlyLeft.equals(friendlyRight);
				assert.strictEqual(result, expectedResult);
			});
		});
	});
});
