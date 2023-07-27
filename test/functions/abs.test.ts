import { FDecimal, FDecimalBackend, FDecimalRoundMode } from "@freemework/common";

import { assert } from "chai";

import { FDecimalBackendBigNumber } from "../../src/index";

const fractionalDigits = 10;
const roundMode = FDecimalRoundMode.Round;
const testBackend = new FDecimalBackendBigNumber(fractionalDigits, roundMode);


type TestCases = Array<[/*value: */string, /*expectedResult: */string, /*backends: */Array<FDecimalBackend>]>;

const testCases: TestCases = [
	["5", "5", [testBackend]],
	["-5", "5", [testBackend]],
	["0.1", "0.1", [testBackend]],
	["-0.1", "0.1", [testBackend]],
	["0.00000000001", "0", [testBackend]], // should be round to zero according fractionalDigits === 10
	["-0.00000000001", "0", [testBackend]], // should be round to zero according fractionalDigits === 10
	["354793854793875498379548374958", "354793854793875498379548374958", [testBackend]],
	["-354793854793875498379548374958", "354793854793875498379548374958", [testBackend]],
	["35479385479387549837954837.495835", "35479385479387549837954837.495835", [testBackend]],
	["-35479385479387549837954837.495835", "35479385479387549837954837.495835", [testBackend]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [test, expectedResult, backends] = testCase;

	backends.forEach(function (backend: FDecimalBackend) {
		describe(`abs should be ${test} => ${expectedResult}`, function () {
			before(() => { FDecimal.configure(backend); });
			after(() => { (FDecimal as any)._cfg = null; });

			it("FDecimal.abs(value: FDecimal): FDecimal", function () {
				const friendlyTest: FDecimal = backend.parse(test);
				const result: FDecimal = backend.abs(friendlyTest);
				assert.equal(result.toString(), expectedResult);
			});

			it("value.abs(): FDecimal", function () {
				const friendlyTest: FDecimal = backend.parse(test);
				const result: FDecimal = friendlyTest.abs();
				assert.equal(result.toString(), expectedResult);
			});
		});
	});
});
