// This module provide a wrapper over https://www.npmjs.com/package/bignumber.js

import {
	FDecimal, FDecimalBase,
	FDecimalBackend,
	FDecimalRoundMode,
	FDecimalSettings,
	FException,
	FExceptionArgument,
	FExceptionInvalidOperation,
	FDecimalFractionDigits
} from "@freemework/common";

import { BigNumber } from "bignumber.js";

// See https://mikemcl.github.io/bignumber.js/#decimal-places
const DECIMAL_PLACES_MAP = new Map<BigNumber.Config["DECIMAL_PLACES"], typeof BigNumber>();
function getBigNumberImpl(DECIMAL_PLACES: BigNumber.Config["DECIMAL_PLACES"]): typeof BigNumber {
	const existentBN = DECIMAL_PLACES_MAP.get(DECIMAL_PLACES);
	if (existentBN !== undefined) { return existentBN; }
	const newBN = BigNumber.clone();
	newBN.config({ DECIMAL_PLACES });
	DECIMAL_PLACES_MAP.set(DECIMAL_PLACES, newBN);
	return newBN;
}

class _FDecimalBigNumber extends FDecimalBase<BigNumber, FDecimalBackendBigNumber> {
	public get backend(): FDecimalBackendBigNumber { return super.backend; }
}

export class FDecimalBackendBigNumber implements FDecimalBackend {
	private static verifyText(test: string): void {
		if (!FDecimal.REGEXP.test(test)) {
			throw new FExceptionArgument(`Bad FDecimal value: ${test}`);
		}
	}

	private verifyInstance(test: FDecimal): asserts test is _FDecimalBigNumber {
		if (test instanceof _FDecimalBigNumber && test.backend === this) { return; }
		throw new FExceptionInvalidOperation(`Mixed '${FDecimal.name}' implementations detected.`);
	}

	public readonly settings: FDecimalSettings;

	/**
	 * 
	 * @param roundMode Default value is FDecimalRoundMode.Round
	 */
	public constructor(fractionalDigits: number, roundMode: FDecimalRoundMode) {
		if (fractionalDigits < 0 || fractionalDigits > 32) {
			throw new FExceptionArgument("Range 0..32 overflow", "fractionalDigits");
		}
		this.settings = {
			decimalSeparator: ".",
			fractionalDigits,
			roundMode
		};
	}

	public abs(value: FDecimal): FDecimal {
		this.verifyInstance(value);
		const unwrapValue: BigNumber = value.instance;
		const result: BigNumber = unwrapValue.abs();
		return new _FDecimalBigNumber(result, this);
	}

	public add(left: FDecimal, right: FDecimal): FDecimal {
		this.verifyInstance(left);
		this.verifyInstance(right);
		const unwrapLeftValue: BigNumber = left.instance;
		const unwrapRightValue: BigNumber = right.instance;
		const result: BigNumber = unwrapLeftValue.plus(unwrapRightValue);
		return new _FDecimalBigNumber(result, this);
	}

	public divide(left: FDecimal, right: FDecimal, roundMode?: FDecimalRoundMode): FDecimal {
		this.verifyInstance(left);
		this.verifyInstance(right);
		const unwrapLeftValue: BigNumber = left.instance;
		const unwrapRightValue: BigNumber = right.instance;

		const BN = getBigNumberImpl(this.settings.fractionalDigits + 2); // Why +2 ?

		if (roundMode === undefined) {
			roundMode = this.settings.roundMode;
		}

		const result: BigNumber = new BN(unwrapLeftValue).div(unwrapRightValue);

		const bigNumberRoundMode = FDecimalBackendBigNumber.convertRoundMode(roundMode, result.isPositive());

		const roundedResult: BigNumber = result.decimalPlaces(this.settings.fractionalDigits, bigNumberRoundMode);

		return new _FDecimalBigNumber(roundedResult, this);
	}

	public equals(left: FDecimal, right: FDecimal): boolean {
		this.verifyInstance(left);
		this.verifyInstance(right);
		const unwrapLeftValue: BigNumber = left.instance;
		const unwrapRightValue: BigNumber = right.instance;
		const result: boolean = unwrapLeftValue.isEqualTo(unwrapRightValue);
		return result;
	}

	public fromFloat(value: number, roundMode?: FDecimalRoundMode): FDecimal {

		const fractionalDigits: FDecimalFractionDigits = this.settings.fractionalDigits;

		const BN = getBigNumberImpl(fractionalDigits);
		const raw = new BN(value);

		if (fractionalDigits < raw.decimalPlaces()!) {
			let rawRoundMode: BigNumber.RoundingMode;
			const roundMode: FDecimalRoundMode = this.settings.roundMode;
			switch (roundMode) {
				case FDecimalRoundMode.Ceil:
					rawRoundMode = BigNumber.ROUND_CEIL;
					break;
				case FDecimalRoundMode.Floor:
					rawRoundMode = BigNumber.ROUND_FLOOR;
					break;
				case FDecimalRoundMode.Round:
					rawRoundMode = BigNumber.ROUND_HALF_EVEN;
					break;
				case FDecimalRoundMode.Trunc:
					rawRoundMode = BigNumber.ROUND_DOWN;
					break;
				default:
					throw new FDecimalBackendBigNumber.UnreachableRoundMode(roundMode);
			}
			const correctedRaw: BigNumber = raw.decimalPlaces(fractionalDigits, rawRoundMode);
			return new _FDecimalBigNumber(correctedRaw, this);
		}

		return new _FDecimalBigNumber(raw, this);
	}

	public fromInt(value: number): FDecimal {

		if (!Number.isSafeInteger(value)) {
			throw new FExceptionArgument(`Wrong value ${value}. Expected safe integer.`, "value");
		}

		const CustomBigNumber = getBigNumberImpl(this.settings.fractionalDigits);
		const raw: BigNumber = new CustomBigNumber(value);

		return new _FDecimalBigNumber(raw, this);
	}

	public gt(left: FDecimal, right: FDecimal): boolean {
		this.verifyInstance(left);
		this.verifyInstance(right);
		const unwrapLeftValue: BigNumber = left.instance;
		const unwrapRightValue: BigNumber = right.instance;
		const result: boolean = unwrapLeftValue.gt(unwrapRightValue);
		return result;
	}

	public gte(left: FDecimal, right: FDecimal): boolean {
		this.verifyInstance(left);
		this.verifyInstance(right);
		const unwrapLeftValue: BigNumber = left.instance;
		const unwrapRightValue: BigNumber = right.instance;
		const result: boolean = unwrapLeftValue.gte(unwrapRightValue);
		return result;
	}

	public inverse(value: FDecimal): FDecimal {
		this.verifyInstance(value);
		const unwrapValue: BigNumber = value.instance;
		const result: BigNumber = unwrapValue.negated();
		return new _FDecimalBigNumber(result, this);
	}

	public isDecimal(test: any): test is FDecimal {
		return test instanceof _FDecimalBigNumber;
	}

	public isNegative(test: FDecimal): boolean {
		this.verifyInstance(test);
		const unwrapValue: BigNumber = test.instance;
		const result: boolean = unwrapValue.isNegative() && !unwrapValue.isZero();
		return result;
	}

	public isPositive(test: FDecimal): boolean {
		this.verifyInstance(test);
		const unwrapValue: BigNumber = test.instance;
		const result: boolean = unwrapValue.isPositive() && !unwrapValue.isZero();
		return result;
	}

	public isZero(test: FDecimal): boolean {
		this.verifyInstance(test);
		const unwrapValue: BigNumber = test.instance;
		const result: boolean = unwrapValue.isZero();
		return result;
	}

	public lt(left: FDecimal, right: FDecimal): boolean {
		this.verifyInstance(left);
		this.verifyInstance(right);
		const unwrapLeftValue: BigNumber = left.instance;
		const unwrapRightValue: BigNumber = right.instance;
		const result: boolean = unwrapLeftValue.lt(unwrapRightValue);
		return result;
	}

	public lte(left: FDecimal, right: FDecimal): boolean {
		this.verifyInstance(left);
		this.verifyInstance(right);
		const unwrapLeftValue: BigNumber = left.instance;
		const unwrapRightValue: BigNumber = right.instance;
		const result: boolean = unwrapLeftValue.lte(unwrapRightValue);
		return result;
	}

	public max(left: FDecimal, right: FDecimal): FDecimal {
		this.verifyInstance(left);
		this.verifyInstance(right);
		const unwrapLeftValue: BigNumber = left.instance;
		const unwrapRightValue: BigNumber = right.instance;
		const result: BigNumber = BigNumber.max(unwrapLeftValue, unwrapRightValue);
		return new _FDecimalBigNumber(result, this);
	}

	public min(left: FDecimal, right: FDecimal): FDecimal {
		this.verifyInstance(left);
		this.verifyInstance(right);
		const unwrapLeftValue: BigNumber = left.instance;
		const unwrapRightValue: BigNumber = right.instance;
		const result: BigNumber = BigNumber.min(unwrapLeftValue, unwrapRightValue);
		return new _FDecimalBigNumber(result, this);
	}

	public mod(left: FDecimal, right: FDecimal, roundMode?: FDecimalRoundMode): FDecimal {
		this.verifyInstance(left);
		this.verifyInstance(right);
		const unwrapLeftValue: BigNumber = left.instance;
		const unwrapRightValue: BigNumber = right.instance;

		const BN = getBigNumberImpl(this.settings.fractionalDigits + 2); // Why +2 ?

		if (roundMode === undefined) {
			roundMode = this.settings.roundMode;
		}

		const result: BigNumber = new BN(unwrapLeftValue).mod(unwrapRightValue);

		const bigNumberRoundMode = FDecimalBackendBigNumber.convertRoundMode(roundMode, result.isPositive());

		const roundedResult: BigNumber = result.decimalPlaces(this.settings.fractionalDigits, bigNumberRoundMode);

		return new _FDecimalBigNumber(roundedResult, this);
	}

	public multiply(left: FDecimal, right: FDecimal, roundMode?: FDecimalRoundMode): FDecimal {
		this.verifyInstance(left);
		this.verifyInstance(right);
		const unwrapLeftValue: BigNumber = left.instance;
		const unwrapRightValue: BigNumber = right.instance;

		const BN = getBigNumberImpl(unwrapLeftValue.decimalPlaces()! + unwrapRightValue.decimalPlaces()!);

		if (roundMode === undefined) {
			roundMode = this.settings.roundMode;
		}

		const result: BigNumber = new BN(unwrapLeftValue).multipliedBy(unwrapRightValue);

		const bigNumberRoundMode = FDecimalBackendBigNumber.convertRoundMode(roundMode, result.isPositive());

		const roundedResult: BigNumber = result.decimalPlaces(this.settings.fractionalDigits, bigNumberRoundMode);

		return new _FDecimalBigNumber(roundedResult, this);
	}

	public parse(value: string): FDecimal {
		FDecimalBackendBigNumber.verifyText(value); // raise error if wrong value

		const fractionalDigits = this.settings.fractionalDigits;

		const CustomBigNumber = getBigNumberImpl(fractionalDigits);
		const raw: BigNumber = new CustomBigNumber(value);

		const decimalPlaces: number = raw.decimalPlaces()!;
		if (fractionalDigits < decimalPlaces) {

			const bigNumberRoundMode = FDecimalBackendBigNumber.convertRoundMode(this.settings.roundMode, raw.isPositive());
			const roundedRaw = raw.decimalPlaces(fractionalDigits, bigNumberRoundMode);
			return new _FDecimalBigNumber(roundedRaw, this);

		} else {

			let rawStr = raw.toString(10);
			if (rawStr.length < value.length) {
				if (decimalPlaces > 0) {
					// Workaround for X.XXX00000
					rawStr = rawStr.padEnd(value.length, "0");
				} else if (decimalPlaces === 0 && (rawStr.length + 1) < value.length) {
					// Workaround for X.00000
					rawStr += ".";
					rawStr = rawStr.padEnd(value.length, "0");
				}
			}
			if (rawStr !== value) {
				throw new FExceptionArgument(`The value '${value}' cannot be represented in backend '${FDecimalBackendBigNumber.name}'`);
			}

			return new _FDecimalBigNumber(raw, this);
		}
	}

	public round(value: FDecimal, fractionDigits: number, roundMode?: FDecimalRoundMode): FDecimal {
		FractionDigitsGuard.verifyFraction(fractionDigits);
		this.verifyInstance(value);

		const unwrapValue: BigNumber = value.instance;

		if (fractionDigits < unwrapValue.decimalPlaces()!) {
			if (roundMode === undefined) {
				roundMode = this.settings.roundMode;
			}
			const bigNumberRoundMode = FDecimalBackendBigNumber.convertRoundMode(roundMode, unwrapValue.isPositive());
			const roundedResult = unwrapValue.decimalPlaces(fractionDigits, bigNumberRoundMode);
			return new _FDecimalBigNumber(roundedResult, this);
		} else {
			return value;
		}
	}

	public subtract(left: FDecimal, right: FDecimal): FDecimal {
		this.verifyInstance(left);
		this.verifyInstance(right);
		const unwrapLeftValue: BigNumber = left.instance;
		const unwrapRightValue: BigNumber = right.instance;
		const result: BigNumber = unwrapLeftValue.minus(unwrapRightValue);
		return new _FDecimalBigNumber(result, this);
	}

	public toNumber(value: FDecimal): number {
		this.verifyInstance(value);
		const unwrapValue: BigNumber = value.instance;
		const result: number = unwrapValue.toNumber();
		return result;
	}

	public toString(value: FDecimal): string {
		this.verifyInstance(value);
		const unwrapValue: BigNumber = value.instance;
		const result: string = unwrapValue.toString(10);
		return result;
	}

	private static convertRoundMode(roundMode: FDecimalRoundMode, isPositive: boolean): BigNumber.RoundingMode {
		switch (roundMode) {
			case FDecimalRoundMode.Ceil: return isPositive === true ? BigNumber.ROUND_UP : BigNumber.ROUND_DOWN;
			case FDecimalRoundMode.Floor: return isPositive === true ? BigNumber.ROUND_DOWN : BigNumber.ROUND_UP;
			case FDecimalRoundMode.Round: return isPositive === true ? BigNumber.ROUND_HALF_UP : BigNumber.ROUND_HALF_DOWN;
			case FDecimalRoundMode.Trunc: return BigNumber.ROUND_DOWN;
			default:
				throw new FDecimalBackendBigNumber.UnreachableRoundMode(roundMode);
		}
	}
}

export namespace FDecimalBackendBigNumber {
	export class UnreachableRoundMode extends FException {
		public constructor(roundMode: never) {
			super(`Unsupported round mode: ${roundMode}`);
		}
	}
}

namespace FractionDigitsGuard {
	export function isFraction(test: number): test is FDecimalFractionDigits {
		return Number.isSafeInteger(test) && test >= 0;
	}
	export function verifyFraction(test: FDecimalFractionDigits): asserts test is FDecimalFractionDigits {
		if (!isFraction(test)) {
			throw new FExceptionArgument("Wrong argument fraction. Expected integer >= 0");
		}
	}
}
