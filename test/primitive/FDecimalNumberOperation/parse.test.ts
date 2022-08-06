import { assert } from "chai";

import { FDecimal, FDecimalBackendNumber } from "../../../src";


type TestCases = Array<[/*value: */string, /*expectedResult: */string, /*backends: */Array<FDecimal.Backend>]>;

const fractionalDigits = 10;
const roundMode = FDecimal.RoundMode.Round;
const operation: FDecimal.Backend = new FDecimalBackendNumber(fractionalDigits, roundMode);

const testCases: TestCases = [
	["10.9580266", "10.9580266", [operation]],
	["10.95802660", "10.9580266", [operation]],
	["10.958026600", "10.9580266", [operation]],
	["10.9580266000", "10.9580266", [operation]],
	["10.95802660000", "10.9580266", [operation]],
	["0.0", "0", [operation]],
	["0.00000000", "0", [operation]],
	["88.00000000", "88", [operation]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [test, expectedResult, backends] = testCase;

	backends.forEach(function (financial: FDecimal.Backend) {

		describe.skip(`parse should be ${test} => ${expectedResult}`, function () {

			it("financial.parse(value: string): FDecimal", function () {
				const friendlyTest: FDecimal = financial.parse(test);
				assert.equal(friendlyTest.toString(), expectedResult);
			});
		});
	});
});

