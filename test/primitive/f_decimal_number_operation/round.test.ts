import { assert } from "chai";

import { FDecimal, FDecimalBackendNumber } from "../../../src";


type TestCases = Array<[
	/*value: */string,
	/*expectedResult: */string,
	/*fractionalDigits: */number,
	/*roundMode: */FDecimal.RoundMode,
	/*backends: */Array<FDecimal.Backend>
]>;

const fractionalDigits = 10;
const roundMode = FDecimal.RoundMode.Round;
const operation: FDecimal.Backend = new FDecimalBackendNumber(fractionalDigits, roundMode);

const testCases: TestCases = [
	// Math.round(55.5) => 56
	["0.555", "0.56", 2, FDecimal.RoundMode.Round, [operation]],

	// Math.round(-55.5) => -55
	["-0.555", "-0.55", 2, FDecimal.RoundMode.Round, [operation]],

	// Math.ceil(55.5) => 56
	["0.555", "0.56", 2, FDecimal.RoundMode.Ceil, [operation]],

	//Math.ceil(-55.5) => -55
	["-0.555", "-0.55", 2, FDecimal.RoundMode.Ceil, [operation]],

	// Math.floor(55.5) => 55
	["0.555", "0.55", 2, FDecimal.RoundMode.Floor, [operation]],

	// Math.floor(-55.5) => -56
	["-0.555", "-0.56", 2, FDecimal.RoundMode.Floor, [operation]],

	["0.555", "0.55", 2, FDecimal.RoundMode.Trunc, [operation]],
	["-0.555", "-0.55", 2, FDecimal.RoundMode.Trunc, [operation]],


	// Math.round(0.99) => 1
	["0.099", "0.1", 2, FDecimal.RoundMode.Round, [operation]],

	// Math.round(-0.99) => -1
	["-0.099", "-0.1", 2, FDecimal.RoundMode.Round, [operation]],

	// Math.ceil(0.99) => 1
	["0.099", "0.1", 2, FDecimal.RoundMode.Ceil, [operation]],

	//Math.ceil(-0.99) => 0
	["-0.099", "-0.09", 2, FDecimal.RoundMode.Ceil, [operation]],

	// Math.floor(0.99) => 0
	["0.099", "0.09", 2, FDecimal.RoundMode.Floor, [operation]],

	// Math.floor(-0.99) => -1
	["-0.099", "-0.1", 2, FDecimal.RoundMode.Floor, [operation]],

	["0.099", "0.09", 2, FDecimal.RoundMode.Trunc, [operation]],
	["-0.099", "-0.09", 2, FDecimal.RoundMode.Trunc, [operation]],


	// Math.round(0.11) => 0
	["0.011", "0.01", 2, FDecimal.RoundMode.Round, [operation]],

	// Math.round(-0.11) => -0
	["-0.011", "-0.01", 2, FDecimal.RoundMode.Round, [operation]],

	// Math.ceil(0.11) => 1
	["0.011", "0.02", 2, FDecimal.RoundMode.Ceil, [operation]],

	// Math.ceil(-0.11) => -0
	["-0.011", "-0.01", 2, FDecimal.RoundMode.Ceil, [operation]],

	// Math.floor(0.11) => 0
	["0.011", "0.01", 2, FDecimal.RoundMode.Floor, [operation]],

	// Math.floor(-0.11) => -1
	["-0.011", "-0.02", 2, FDecimal.RoundMode.Floor, [operation]],

	["0.011", "0.01", 2, FDecimal.RoundMode.Trunc, [operation]],
	["-0.011", "-0.01", 2, FDecimal.RoundMode.Trunc, [operation]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [value, expectedResult, fractionalDigits, roundMode, backends] = testCase;

	backends.forEach(function (financial: FDecimal.Backend) {

		// tslint:disable-next-line: max-line-length
		describe.skip(`round with roundMode: ${roundMode}, fractionalDigits: ${fractionalDigits} should be ${value} => ${expectedResult}`, function () {

			it("financial.round(value: FDecimal, fractionDigits: FDecimal.FractionDigits): FDecimal", function () {
				const friendlyValue: FDecimal = financial.parse(value);
				const result: FDecimal = financial.round(friendlyValue, fractionalDigits);
				assert.equal(result.toString(), expectedResult);
			});

			it("value.round(fractionalDigits: Financial.FractionDigits): FDecimal", function () {
				const friendlyValue: FDecimal = financial.parse(value);
				const result: FDecimal = friendlyValue.round(fractionalDigits, roundMode);
				assert.equal(result.toString(), expectedResult);
			});
		});
	});
});
