import { assert } from "chai";

import { FDecimal, FDecimalBackendNumber } from "../../../src";


const fractionalDigits = 10;
const roundMode = FDecimal.RoundMode.Round;
const operation: FDecimal.Backend = new FDecimalBackendNumber(fractionalDigits, roundMode);

type TestCases = Array<[
	/*left: */string,
	/*right: */string,
	/*expectedResult: */string,
	/*fractionalDigits: */number,
	/*roundMode: */FDecimal.RoundMode,
	/*backends: */Array<FDecimal.Backend>
]>;

const testCases: TestCases = [
	["0.5", "3.3333333333", "1.6666666667", 10, FDecimal.RoundMode.Round, [operation]],
	["-0.5", "3.3333333333", "-1.6666666666", 10, FDecimal.RoundMode.Round, [operation]],
	["-0.5", "-3.3333333333", "1.6666666667", 10, FDecimal.RoundMode.Round, [operation]],
	["0.5", "-3.3333333333", "-1.6666666666", 10, FDecimal.RoundMode.Round, [operation]],
	["0.5", "3.3333333333", "1.6666666667", 10, FDecimal.RoundMode.Ceil, [operation]],
	["-0.5", "3.3333333333", "-1.6666666666", 10, FDecimal.RoundMode.Ceil, [operation]],
	["-0.5", "-3.3333333333", "1.6666666667", 10, FDecimal.RoundMode.Ceil, [operation]],
	["0.5", "-3.3333333333", "-1.6666666666", 10, FDecimal.RoundMode.Ceil, [operation]],
	["0.5", "3.3333333333", "1.6666666666", 10, FDecimal.RoundMode.Floor, [operation]],
	["-0.5", "3.3333333333", "-1.6666666667", 10, FDecimal.RoundMode.Floor, [operation]],
	["-0.5", "-3.3333333333", "1.6666666666", 10, FDecimal.RoundMode.Floor, [operation]],
	["0.5", "-3.3333333333", "-1.6666666667", 10, FDecimal.RoundMode.Floor, [operation]],
	["0.5", "3.3333333333", "1.6666666666", 10, FDecimal.RoundMode.Trunc, [operation]],
	["-0.5", "3.3333333333", "-1.6666666666", 10, FDecimal.RoundMode.Trunc, [operation]],
	["-0.5", "-3.3333333333", "1.6666666666", 10, FDecimal.RoundMode.Trunc, [operation]],
	["0.5", "-3.3333333333", "-1.6666666666", 10, FDecimal.RoundMode.Trunc, [operation]],

	["0.5000000001", "3.3333333333", "1.666666667", 10, FDecimal.RoundMode.Round, [operation]],
	["-0.5000000001", "3.3333333333", "-1.666666667", 10, FDecimal.RoundMode.Round, [operation]],
	["-0.5000000001", "-3.3333333333", "1.666666667", 10, FDecimal.RoundMode.Round, [operation]],
	["0.5000000001", "-3.3333333333", "-1.666666667", 10, FDecimal.RoundMode.Round, [operation]],
	["0.5000000001", "3.3333333333", "1.666666667", 10, FDecimal.RoundMode.Ceil, [operation]],
	["-0.5000000001", "3.3333333333", "-1.6666666669", 10, FDecimal.RoundMode.Ceil, [operation]],
	["-0.5000000001", "-3.3333333333", "1.666666667", 10, FDecimal.RoundMode.Ceil, [operation]],
	["0.5000000001", "-3.3333333333", "-1.6666666669", 10, FDecimal.RoundMode.Ceil, [operation]],
	["0.5000000001", "3.3333333333", "1.6666666669", 10, FDecimal.RoundMode.Floor, [operation]],
	["-0.5000000001", "3.3333333333", "-1.666666667", 10, FDecimal.RoundMode.Floor, [operation]],
	["-0.5000000001", "-3.3333333333", "1.6666666669", 10, FDecimal.RoundMode.Floor, [operation]],
	["0.5000000001", "-3.3333333333", "-1.666666667", 10, FDecimal.RoundMode.Floor, [operation]],
	["0.5000000001", "3.3333333333", "1.6666666669", 10, FDecimal.RoundMode.Trunc, [operation]],
	["-0.5000000001", "3.3333333333", "-1.6666666669", 10, FDecimal.RoundMode.Trunc, [operation]],
	["-0.5000000001", "-3.3333333333", "1.6666666669", 10, FDecimal.RoundMode.Trunc, [operation]],
	["0.5000000001", "-3.3333333333", "-1.6666666669", 10, FDecimal.RoundMode.Trunc, [operation]]
];

testCases.forEach(function (testCase) {
	// Unwrap test case data
	const [left, right, expectedResult, fractionalDigits, roundMode, backends] = testCase;

	backends.forEach(function (financial: FDecimal.Backend) {

		// tslint:disable-next-line: max-line-length
		describe.skip(`multiply with roundMode: ${roundMode}, fractionalDigits: ${fractionalDigits} should be ${left} * ${right} = ${expectedResult}`, function () {

			it("financial.multiply(left: FDecimal, right: FDecimal): FDecimal", function () {
				const friendlyLeft: FDecimal = financial.parse(left);
				const friendlyRight: FDecimal = financial.parse(right);
				const result: FDecimal = financial.multiply(friendlyLeft, friendlyRight);
				assert.equal(result.toString(), expectedResult);
			});

			it("value.multiply(value: FDecimal): FDecimal", function () {
				const friendlyLeft: FDecimal = financial.parse(left);
				const friendlyRight: FDecimal = financial.parse(right);
				const result: FDecimal = friendlyLeft.multiply(friendlyRight);
				assert.equal(result.toString(), expectedResult);
			});
		});
	});
});


describe.skip(`multiply custom tests`, function () {
	it("0.011 * 0.011 = 0.000121 (fractionalDigits: 6)", function () {
		const amount: FDecimal = new FDecimalBackendNumber(3, FDecimal.RoundMode.Round)
			.parse("0.011");
		const price: FDecimal = new FDecimalBackendNumber(3, FDecimal.RoundMode.Round)
			.parse("0.011");

		const result: string = new FDecimalBackendNumber(6, FDecimal.RoundMode.Floor).multiply(amount, price).toString();

		assert.isString(result);
		assert.equal(result, "0.000121");
	});

	it("0.011 * 0.01 = 0.0002 (fractionalDigits: 4 + RoundMode.Ceil)", function () {
		const amount: FDecimal = new FDecimalBackendNumber(3, FDecimal.RoundMode.Round)
			.parse("0.011");
		const price: FDecimal = new FDecimalBackendNumber(3, FDecimal.RoundMode.Round)
			.parse("0.01");

		const result: string = amount.multiply(price, FDecimal.RoundMode.Ceil).toString();

		assert.isString(result);
		assert.equal(result, "0.0002");
	});
});
