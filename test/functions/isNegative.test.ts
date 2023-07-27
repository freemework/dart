import { FDecimal, FDecimalBackend, FDecimalRoundMode } from "@freemework/common";

import { assert } from "chai";

import { FDecimalBackendBigNumber } from "../../src/index";

const fractionalDigits = 10;
const roundMode = FDecimalRoundMode.Round;
const testBackend = new FDecimalBackendBigNumber(fractionalDigits, roundMode);


type TestCases = Array<[/*left: */string, /*expectedResult: */boolean, /*backends: */Array<FDecimalBackend>]>;

const testCases: TestCases = [
	["5", false, [testBackend]],
	["-5", true, [testBackend]],
	["0.1", false, [testBackend]],
	["-0.1", true, [testBackend]],
	["0.00000000002", false, [testBackend]], // should be round to zero according fractionalDigits === 10
	["0.00000000001", false, [testBackend]], // should be round to zero according fractionalDigits === 10
	["0", false, [testBackend]],
	["-354793854793875498379548374958", true, [testBackend]],
	["354793854793875498379548374958", false, [testBackend]],
	["-35479385479387549837954837.495835", true, [testBackend]],
	["35479385479387549837954837.495835", false, [testBackend]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [test, expectedResult, backends] = testCase;

	backends.forEach(function (backend: FDecimalBackend) {
		const msg = expectedResult === true ? "negative" : "not negative";
		describe(`isNegative should be ${test} is ${msg}`, function () {
			before(() => { FDecimal.configure(backend); });
			after(() => { (FDecimal as any)._cfg = null; });

			it("FDecimal.isNegative(test: FDecimal): boolean", function () {
				const friendlyTest: FDecimal = FDecimal.parse(test);
				const result: boolean = FDecimal.isNegative(friendlyTest);
				assert.equal(result, expectedResult);
			});

			it("value.isNegative(): boolean", function () {
				const friendlyTest: FDecimal = FDecimal.parse(test);
				const result: boolean = friendlyTest.isNegative();
				assert.equal(result, expectedResult);
			});
		});
	});
});
