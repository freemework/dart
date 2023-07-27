import { FDecimal, FDecimalBackend, FDecimalRoundMode } from "@freemework/common";

import { assert } from "chai";

import { FDecimalBackendBigNumber } from "../../src/index";

const fractionalDigits = 10;
const roundMode = FDecimalRoundMode.Round;
const testBackend = new FDecimalBackendBigNumber(fractionalDigits, roundMode);


type TestCases = Array<[/*left: */string, /*expectedResult: */boolean, /*backends: */Array<FDecimalBackend>]>;

const testCases: TestCases = [
	["5", true, [testBackend]],
	["-5", false, [testBackend]],
	["0.1", true, [testBackend]],
	["-0.1", false, [testBackend]],
	["0.00000000002", false, [testBackend]], // should be round to zero according fractionalDigits === 10
	["0.00000000001", false, [testBackend]], // should be round to zero according fractionalDigits === 10
	["0", false, [testBackend]],
	["-354793854793875498379548374958", false, [testBackend]],
	["354793854793875498379548374958", true, [testBackend]],
	["-35479385479387549837954837.495835", false, [testBackend]],
	["35479385479387549837954837.495835", true, [testBackend]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [test, expectedResult, backends] = testCase;

	backends.forEach(function (backend: FDecimalBackend) {
		const msg = expectedResult === true ? "positive" : "not positive";
		describe(`isPositive should be ${test} is ${msg}`, function () {
			before(() => { FDecimal.configure(backend); });
			after(() => { (FDecimal as any)._cfg = null; });

			it("FDecimal.isPositive(test: FDecimal): boolean", function () {
				const friendlyTest: FDecimal = FDecimal.parse(test);
				const result: boolean = FDecimal.isPositive(friendlyTest);
				assert.equal(result, expectedResult);
			});

			it("value.isPositive(): boolean", function () {
				const friendlyTest: FDecimal = FDecimal.parse(test);
				const result: boolean = friendlyTest.isPositive();
				assert.equal(result, expectedResult);
			});
		});
	});
});
