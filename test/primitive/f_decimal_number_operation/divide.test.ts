import { assert } from "chai";

import { FDecimal, FDecimalBackend, FDecimalBackendNumber, FDecimalRoundMode } from "../../../src";


type TestCases = Array<[
	/*left: */string,
	/*right: */string,
	/*expectedResult: */string,
	/*fractionalDigits: */number,
	/*roundMode: */FDecimalRoundMode,
	/*backends: */Array<FDecimalBackend>
]>;

const fractionalDigits = 10;
const roundMode = FDecimalRoundMode.Round;
const operation: FDecimalBackend = new FDecimalBackendNumber(fractionalDigits, roundMode);

const testCases: TestCases = [
	["10", "3", "3.3333333333", 10, FDecimalRoundMode.Round, [operation]],
	["-10", "-3", "3.3333333333", 10, FDecimalRoundMode.Round, [operation]],
	["10", "-3", "-3.3333333333", 10, FDecimalRoundMode.Round, [operation]],
	["-10", "3", "-3.3333333333", 10, FDecimalRoundMode.Round, [operation]],
	["10", "3", "3.3333333334", 10, FDecimalRoundMode.Ceil, [operation]],
	["-10", "-3", "3.3333333334", 10, FDecimalRoundMode.Ceil, [operation]],
	["10", "-3", "-3.3333333333", 10, FDecimalRoundMode.Ceil, [operation]],
	["-10", "3", "-3.3333333333", 10, FDecimalRoundMode.Ceil, [operation]],
	["10", "3", "3.3333333333", 10, FDecimalRoundMode.Floor, [operation]],
	["-10", "-3", "3.3333333333", 10, FDecimalRoundMode.Floor, [operation]],
	["10", "-3", "-3.3333333334", 10, FDecimalRoundMode.Floor, [operation]],
	["-10", "3", "-3.3333333334", 10, FDecimalRoundMode.Floor, [operation]],
	["10", "3", "3.3333333333", 10, FDecimalRoundMode.Trunc, [operation]],
	["-10", "-3", "3.3333333333", 10, FDecimalRoundMode.Trunc, [operation]],
	["10", "-3", "-3.3333333333", 10, FDecimalRoundMode.Trunc, [operation]],
	["-10", "3", "-3.3333333333", 10, FDecimalRoundMode.Trunc, [operation]],

	["1331234.3000100011", "21.02", "63331.7935304472", 10, FDecimalRoundMode.Round, [operation]],
	["-1331234.3000100011", "-21.02", "63331.7935304472", 10, FDecimalRoundMode.Round, [operation]],
	["1331234.3000100011", "-21.02", "-63331.7935304472", 10, FDecimalRoundMode.Round, [operation]],
	["-1331234.3000100011", "21.02", "-63331.7935304472", 10, FDecimalRoundMode.Round, [operation]],
	["1331234.3000100011", "21.02", "63331.7935304473", 10, FDecimalRoundMode.Ceil, [operation]],
	["-1331234.3000100011", "-21.02", "63331.7935304473", 10, FDecimalRoundMode.Ceil, [operation]],
	["1331234.3000100011", "-21.02", "-63331.7935304472", 10, FDecimalRoundMode.Ceil, [operation]],
	["-1331234.3000100011", "21.02", "-63331.7935304472", 10, FDecimalRoundMode.Ceil, [operation]],
	["1331234.3000100011", "21.02", "63331.7935304472", 10, FDecimalRoundMode.Floor, [operation]],
	["-1331234.3000100011", "-21.02", "63331.7935304472", 10, FDecimalRoundMode.Floor, [operation]],
	["1331234.3000100011", "-21.02", "-63331.7935304473", 10, FDecimalRoundMode.Floor, [operation]],
	["-1331234.3000100011", "21.02", "-63331.7935304473", 10, FDecimalRoundMode.Floor, [operation]],
	["1331234.3000100011", "21.02", "63331.7935304472", 10, FDecimalRoundMode.Trunc, [operation]],
	["-1331234.3000100011", "-21.02", "63331.7935304472", 10, FDecimalRoundMode.Trunc, [operation]],
	["1331234.3000100011", "-21.02", "-63331.7935304472", 10, FDecimalRoundMode.Trunc, [operation]],
	["-1331234.3000100011", "21.02", "-63331.7935304472", 10, FDecimalRoundMode.Trunc, [operation]],

	["1331234.3000100011", "21.01", "63361.9371732509", 10, FDecimalRoundMode.Round, [operation]],
	["-1331234.3000100011", "-21.01", "63361.9371732509", 10, FDecimalRoundMode.Round, [operation]],
	["1331234.3000100011", "-21.01", "-63361.9371732509", 10, FDecimalRoundMode.Round, [operation]],
	["-1331234.3000100011", "21.01", "-63361.9371732509", 10, FDecimalRoundMode.Round, [operation]],
	["1331234.3000100011", "21.01", "63361.9371732509", 10, FDecimalRoundMode.Ceil, [operation]],
	["-1331234.3000100011", "-21.01", "63361.9371732509", 10, FDecimalRoundMode.Ceil, [operation]],
	["1331234.3000100011", "-21.01", "-63361.9371732508", 10, FDecimalRoundMode.Ceil, [operation]],
	["-1331234.3000100011", "21.01", "-63361.9371732508", 10, FDecimalRoundMode.Ceil, [operation]],
	["1331234.3000100011", "21.01", "63361.9371732508", 10, FDecimalRoundMode.Floor, [operation]],
	["-1331234.3000100011", "-21.01", "63361.9371732508", 10, FDecimalRoundMode.Floor, [operation]],
	["1331234.3000100011", "-21.01", "-63361.9371732509", 10, FDecimalRoundMode.Floor, [operation]],
	["-1331234.3000100011", "21.01", "-63361.9371732509", 10, FDecimalRoundMode.Floor, [operation]],
	["1331234.3000100011", "21.01", "63361.9371732508", 10, FDecimalRoundMode.Trunc, [operation]],
	["-1331234.3000100011", "-21.01", "63361.9371732508", 10, FDecimalRoundMode.Trunc, [operation]],
	["1331234.3000100011", "-21.01", "-63361.9371732508", 10, FDecimalRoundMode.Trunc, [operation]],
	["-1331234.3000100011", "21.01", "-63361.9371732508", 10, FDecimalRoundMode.Trunc, [operation]],

	// Test-case: 24.2644184325 BTC need to divive to BCN price 0.00000017 should be equal 142731873.1323529411 BCN
	["24.2644184325", "0.00000017", "142731873.1323529411", 10, FDecimalRoundMode.Trunc, [operation]],
	["24.2644184325", "0.00000017", "142731873.1323529412", 10, FDecimalRoundMode.Round, [operation]],
	["24.2644184325", "0.00000017", "142731873.1323529412", 10, FDecimalRoundMode.Ceil, [operation]],
	["24.2644184325", "0.00000017", "142731873.1323529411", 10, FDecimalRoundMode.Floor, [operation]],

	// Test-case: 0 BTC need to divide to BCN price 0.00000017 should be equal 0.0
	["0", "0.00000017", "0", 10, FDecimalRoundMode.Trunc, [operation]],

	["1333.5", "21.000001", "63.49999697", 8, FDecimalRoundMode.Trunc, [operation]],

	["1333", "21.000001", "63.47618745", 8, FDecimalRoundMode.Trunc, [operation]],
	["1333", "21.000001", "63.47618746", 8, FDecimalRoundMode.Ceil, [operation]],
	["1333", "21.000001", "63.47618745", 8, FDecimalRoundMode.Round, [operation]],
	["1333", "21.000001", "63.47618745", 8, FDecimalRoundMode.Floor, [operation]],

	["324234234234.23423456", "234.34", "1383606017.89807217", 8, FDecimalRoundMode.Trunc, [operation]],
	// tslint:disable-next-line: max-line-length
	["123456789012345123456789012345", "212345678", "581395346376417058306.16911517", 8, FDecimalRoundMode.Trunc, [operation]],

	["11.230707245", "1", "11.230707245", 10, FDecimalRoundMode.Trunc, [operation]],
	["11.230707245", "1", "11.230707245", 10, FDecimalRoundMode.Ceil, [operation]],
	["11.230707245", "1", "11.230707245", 10, FDecimalRoundMode.Round, [operation]],
	["11.230707245", "1", "11.230707245", 10, FDecimalRoundMode.Floor, [operation]],

	["1333", "21.0001", "63.47588821", 8, FDecimalRoundMode.Trunc, [operation]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [left, right, expectedResult, fractionalDigits, roundMode, backends] = testCase;

	backends.forEach(function (financial: FDecimalBackend) {

		// tslint:disable-next-line: max-line-length
		describe.skip(`divide with roundMode: ${roundMode}, fractionalDigits: ${fractionalDigits} should be ${left} / ${right} = ${expectedResult}`, function () {
			it("financial.divide(left: FDecimal, right: FDecimal): FDecimal", function () {
				const friendlyLeft: FDecimal = financial.parse(left);
				const friendlyRight: FDecimal = financial.parse(right);
				const result: FDecimal = financial.divide(friendlyLeft, friendlyRight);
				assert.equal(result.toString(), expectedResult);
			});

			it("value.divide(value: FDecimal): FDecimal", function () {
				const friendlyLeft: FDecimal = financial.parse(left);
				const friendlyRight: FDecimal = financial.parse(right);
				const result: FDecimal = friendlyLeft.divide(friendlyRight, roundMode);
				assert.equal(result.toString(), expectedResult);
			});
		});
	});
});


describe.skip(`divide custom tests`, function () {
	it("150.42 / 9812.22 = 0.01532987 (fractionalDigits: 8)", function () {
		const amount: FDecimal = new FDecimalBackendNumber(2, FDecimalRoundMode.Round)
			.parse("150.42");
		const price: FDecimal = new FDecimalBackendNumber(2, FDecimalRoundMode.Round)
			.parse("9812.22");

		const result: string = new FDecimalBackendNumber(8, FDecimalRoundMode.Ceil)
			.divide(amount, price).toString();

		assert.isString(result);
		assert.equal(result, "0.01532987");
	});
});
