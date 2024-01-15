import { FDecimal, FDecimalBackend, FDecimalRoundMode } from "@freemework/common";

import { assert } from "chai";

import { FDecimalBackendBigNumber } from "../../src/index.js";

const fractionalDigits = 10;
const roundMode = FDecimalRoundMode.Round;
const testBackend = new FDecimalBackendBigNumber(fractionalDigits, roundMode);


type TestCases = Array<[
	/*value: */string,
	/*expectedResult: */string,
	/*fractionalDigits: */number,
	/*roundMode: */FDecimalRoundMode,
	/*backends: */Array<FDecimalBackend>,
]>;

const testCases: TestCases = [
	// Math.round(55.5) => 56
	["0.555", "0.56", 2, FDecimalRoundMode.Round, [testBackend]],

	// Math.round(-55.5) => -55
	["-0.555", "-0.55", 2, FDecimalRoundMode.Round, [testBackend]],

	// Math.ceil(55.5) => 56
	["0.555", "0.56", 2, FDecimalRoundMode.Ceil, [testBackend]],

	//Math.ceil(-55.5) => -55
	["-0.555", "-0.55", 2, FDecimalRoundMode.Ceil, [testBackend]],

	// Math.floor(55.5) => 55
	["0.555", "0.55", 2, FDecimalRoundMode.Floor, [testBackend]],

	// Math.floor(-55.5) => -56
	["-0.555", "-0.56", 2, FDecimalRoundMode.Floor, [testBackend]],

	["0.555", "0.55", 2, FDecimalRoundMode.Trunc, [testBackend]],
	["-0.555", "-0.55", 2, FDecimalRoundMode.Trunc, [testBackend]],


	// Math.round(0.99) => 1
	["0.099", "0.1", 2, FDecimalRoundMode.Round, [testBackend]],

	// Math.round(-0.99) => -1
	["-0.099", "-0.1", 2, FDecimalRoundMode.Round, [testBackend]],

	// Math.ceil(0.99) => 1
	["0.099", "0.1", 2, FDecimalRoundMode.Ceil, [testBackend]],

	//Math.ceil(-0.99) => 0
	["-0.099", "-0.09", 2, FDecimalRoundMode.Ceil, [testBackend]],

	// Math.floor(0.99) => 0
	["0.099", "0.09", 2, FDecimalRoundMode.Floor, [testBackend]],

	// Math.floor(-0.99) => -1
	["-0.099", "-0.1", 2, FDecimalRoundMode.Floor, [testBackend]],

	["0.099", "0.09", 2, FDecimalRoundMode.Trunc, [testBackend]],
	["-0.099", "-0.09", 2, FDecimalRoundMode.Trunc, [testBackend]],


	// Math.round(0.11) => 0
	["0.011", "0.01", 2, FDecimalRoundMode.Round, [testBackend]],

	// Math.round(-0.11) => -0
	["-0.011", "-0.01", 2, FDecimalRoundMode.Round, [testBackend]],

	// Math.ceil(0.11) => 1
	["0.011", "0.02", 2, FDecimalRoundMode.Ceil, [testBackend]],

	// Math.ceil(-0.11) => -0
	["-0.011", "-0.01", 2, FDecimalRoundMode.Ceil, [testBackend]],

	// Math.floor(0.11) => 0
	["0.011", "0.01", 2, FDecimalRoundMode.Floor, [testBackend]],

	// Math.floor(-0.11) => -1
	["-0.011", "-0.02", 2, FDecimalRoundMode.Floor, [testBackend]],

	["0.011", "0.01", 2, FDecimalRoundMode.Trunc, [testBackend]],
	["-0.011", "-0.01", 2, FDecimalRoundMode.Trunc, [testBackend]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [value, expectedResult, fractionalDigits, roundMode, backends] = testCase;

	backends.forEach(function (backend: FDecimalBackend) {
		// tslint:disable-next-line: max-line-length
		describe(`round with roundMode: ${roundMode}, fractionalDigits: ${fractionalDigits} should be ${value} => ${expectedResult}`, function () {
			before(() => { FDecimal.configure(backend); });
			after(() => { (FDecimal as any)._cfg = null; });

			it("FDecimal.round(value: FDecimal, fractionDigits: FDecimalFraction, roundMode: FDecimalRoundMode): FDecimal", function () {
				const friendlyValue: FDecimal = FDecimal.parse(value);
				const result: FDecimal = FDecimal.round(friendlyValue, fractionalDigits, roundMode);
				assert.equal(result.toString(), expectedResult);
			});

			it("value.round(fractionalDigits: Financial.FractionDigits, roundMode: FDecimalRoundMode): FDecimal", function () {
				const friendlyValue: FDecimal = FDecimal.parse(value);
				const result: FDecimal = friendlyValue.round(fractionalDigits, roundMode);
				assert.equal(result.toString(), expectedResult);
			});
		});
	});
});
