import { FDecimal, FDecimalBackend, FDecimalRoundMode } from "@freemework/common";

import { assert } from "chai";

import { FDecimalBackendBigNumber } from "../../src/index";

const fractionalDigits = 10;
const roundMode = FDecimalRoundMode.Round;
const testBackend = new FDecimalBackendBigNumber(fractionalDigits, roundMode);


type TestCases = Array<[/*value: */string, /*expectedResult: */string, /*backends: */Array<FDecimalBackend>]>;

const testCases: TestCases = [
	["10.9580266", "10.9580266", [testBackend]],
	["10.95802660", "10.9580266", [testBackend]],
	["10.958026600", "10.9580266", [testBackend]],
	["10.9580266000", "10.9580266", [testBackend]],
	["10.95802660000", "10.9580266", [testBackend]],
	["0.0", "0", [testBackend]],
	["0.00000000", "0", [testBackend]],
	["88.00000000", "88", [testBackend]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [test, expectedResult, backends] = testCase;

	backends.forEach(function (backend: FDecimalBackend) {
		describe(`parse should be ${test} => ${expectedResult}`, function () {
			before(() => { FDecimal.configure(backend); });
			after(() => { (FDecimal as any)._cfg = null; });

			it("FDecimal.parse(value: string): FDecimal", function () {
				const friendlyTest: FDecimal = FDecimal.parse(test);
				assert.equal(friendlyTest.toString(), expectedResult);
			});
		});
	});
});

