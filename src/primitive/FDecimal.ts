import { FExceptionArgument } from "../exception/FExceptionArgument";
import { FExceptionInvalidOperation } from "../exception/FExceptionInvalidOperation";

export abstract class FDecimal {
	private static _cfg: { readonly backend: FDecimal.Backend; readonly settings: FDecimal.Settings; } | null = null;
	private static get cfg(): { readonly backend: FDecimal.Backend; readonly settings: FDecimal.Settings; } {
		const cfg: { readonly backend: FDecimal.Backend; readonly settings: FDecimal.Settings; } | null = this._cfg;
		if (cfg !== null) {
			return cfg;
		}
		throw new FExceptionInvalidOperation(`${FDecimal.name} is not configured. Did you call ${FDecimal.name}.configure()?`);
	}
	private static get backend(): FDecimal.Backend { return FDecimal.cfg.backend; }
	public static get settings(): FDecimal.Settings { return FDecimal.cfg.settings; }

	public static configure(backend: FDecimal.Backend, settings: FDecimal.Settings): void {
		if (FDecimal._cfg !== null) {
			throw new FExceptionInvalidOperation(`Cannot ${FDecimal.name}.configure() twice. By design you have to call ${FDecimal.name}.configure() once.`);
		}
		this._cfg = Object.freeze({
			backend,
			settings: Object.freeze({
				...settings
			})
		});
	}

	/**
	 * Analog of Math​.abs()
	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/abs
	 */
	public static abs(value: FDecimal): FDecimal { return FDecimal.backend.abs(value); }
	public static add(left: FDecimal, right: FDecimal): FDecimal { return FDecimal.backend.add(left, right); }
	public static divide(left: FDecimal, right: FDecimal, roundMode?: FDecimal.RoundMode): FDecimal { return FDecimal.backend.divide(left, right, roundMode); }
	public static equals(left: FDecimal, right: FDecimal): boolean { return FDecimal.backend.equals(left, right); }
	public static fromFloat(value: number, roundMode?: FDecimal.RoundMode): FDecimal { return FDecimal.backend.fromFloat(value, roundMode); }
	public static fromInt(value: number): FDecimal { return FDecimal.backend.fromInt(value); }
	public static gt(left: FDecimal, right: FDecimal): boolean { return FDecimal.backend.gt(left, right); }
	public static gte(left: FDecimal, right: FDecimal): boolean { return FDecimal.backend.gte(left, right); }
	public static inverse(value: FDecimal): FDecimal { return FDecimal.backend.inverse(value); }
	public static isDecimal(test: any): test is FDecimal { return FDecimal.backend.isDecimal(test); }
	public static isNegative(test: FDecimal): boolean { return FDecimal.backend.isNegative(test); }
	public static isPositive(test: FDecimal): boolean { return FDecimal.backend.isPositive(test); }
	public static isZero(test: FDecimal): boolean { return FDecimal.backend.isZero(test); }
	public static lt(left: FDecimal, right: FDecimal): boolean { return FDecimal.backend.lt(left, right); }
	public static lte(left: FDecimal, right: FDecimal): boolean { return FDecimal.backend.lte(left, right); }
	/**
	 * Analog of Math.max()
	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max
	 */
	public static max(left: FDecimal, right: FDecimal): FDecimal { return FDecimal.backend.max(left, right); }
	/**
	 * Analog of Math.min()
	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/min
	 */
	public static min(left: FDecimal, right: FDecimal): FDecimal { return FDecimal.backend.min(left, right); }
	public static mod(left: FDecimal, right: FDecimal, roundMode?: FDecimal.RoundMode): FDecimal { return FDecimal.backend.mod(left, right, roundMode); }
	public static multiply(left: FDecimal, right: FDecimal, roundMode?: FDecimal.RoundMode): FDecimal { return FDecimal.backend.multiply(left, right, roundMode); }
	public static parse(value: string): FDecimal { return FDecimal.backend.parse(value); }
	public static round(value: FDecimal, fractionDigits: FDecimal.FractionDigits, roundMode?: FDecimal.RoundMode): FDecimal { return FDecimal.backend.round(value, fractionDigits, roundMode); }
	public static subtract(left: FDecimal, right: FDecimal): FDecimal { return FDecimal.backend.subtract(left, right); }

	public abstract abs(): FDecimal;
	public abstract add(value: FDecimal): FDecimal;
	public abstract divide(value: FDecimal, roundMode?: FDecimal.RoundMode): FDecimal;
	public abstract equals(value: FDecimal): boolean;
	public abstract inverse(): FDecimal;
	public abstract isNegative(): boolean;
	public abstract isPositive(): boolean;
	public abstract isZero(): boolean;
	public abstract mod(value: FDecimal, roundMode?: FDecimal.RoundMode): FDecimal;
	public abstract multiply(value: FDecimal, roundMode?: FDecimal.RoundMode): FDecimal;
	public abstract round(fractionDigits: FDecimal.FractionDigits, roundMode?: FDecimal.RoundMode): FDecimal;
	public abstract subtract(value: FDecimal): FDecimal;
	public abstract toNumber(): number;
	public abstract toString(): string;
	public abstract toJSON(): string;
}

export namespace FDecimal {
	export type FractionDigits = number;

	export interface Backend {
		readonly settings: FDecimal.Settings;

		/**
		 * Analog of Math​.abs()
		 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/abs
		 */
		abs(value: FDecimal): FDecimal;
		add(left: FDecimal, right: FDecimal): FDecimal;
		divide(left: FDecimal, right: FDecimal, roundMode?: FDecimal.RoundMode): FDecimal;
		equals(left: FDecimal, right: FDecimal): boolean;
		fromFloat(value: number, roundMode?: FDecimal.RoundMode): FDecimal;
		fromInt(value: number): FDecimal;
		gt(left: FDecimal, right: FDecimal): boolean;
		gte(left: FDecimal, right: FDecimal): boolean;
		inverse(value: FDecimal): FDecimal;
		isDecimal(test: any): test is FDecimal;
		isNegative(test: FDecimal): boolean;
		isPositive(test: FDecimal): boolean;
		isZero(test: FDecimal): boolean;
		lt(left: FDecimal, right: FDecimal): boolean;
		lte(left: FDecimal, right: FDecimal): boolean;

		/**
		 * Analog of Math.max()
		 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max
		 */
		max(left: FDecimal, right: FDecimal): FDecimal;
		/**
		 * Analog of Math.min()
		 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/min
		 */
		min(left: FDecimal, right: FDecimal): FDecimal;
		mod(left: FDecimal, right: FDecimal, roundMode?: FDecimal.RoundMode): FDecimal;
		multiply(left: FDecimal, right: FDecimal, roundMode?: FDecimal.RoundMode): FDecimal;
		parse(value: string): FDecimal;
		round(value: FDecimal, fractionDigits: FDecimal.FractionDigits, roundMode?: FDecimal.RoundMode): FDecimal;
		subtract(left: FDecimal, right: FDecimal): FDecimal;

		toNumber(value: FDecimal): number;
		toString(value: FDecimal): string;
	}

	export const enum RoundMode {
		/**
		 * Round to the smallest Financial greater than or equal to a given Financial.
		 * 
		 * In other words: Round UP
		 * 
		 * Example of Ceil to fraction:2 
		 * * 0.595 -> 0.60
		 * * 0.555 -> 0.56
		 * * 0.554 -> 0.56
		 * * -0.595 -> -0.59
		 * * -0.555 -> -0.55
		 * * -0.554 -> -0.55
		 */
		Ceil = "Ceil",

		/**
		 * Round to the largest Financial less than or equal to a given Financial.
		 * 
		 * In other words: Round DOWN
		 * 
		 * Example of Floor to fraction:2 
		 * * 0.595 -> 0.59
		 * * 0.555 -> 0.55
		 * * 0.554 -> 0.55
		 * * -0.595 -> -0.60
		 * * -0.555 -> -0.56
		 * * -0.554 -> -0.56
		 */
		Floor = "Floor",

		/**
		 * Round to the Financial rounded to the nearest Financial.
		 * 
		 * In other words: Round classic
		 * 
		 * Example of Round to fraction:2
		 * * 0.595 -> 0.60
		 * * 0.555 -> 0.56
		 * * 0.554 -> 0.55
		 * * -0.595 -> -0.60
		 * * -0.555 -> -0.55
		 * * -0.554 -> -0.55
		 */
		Round = "Round",

		/**
		 * Round to the Financial by removing fractional digits.
		 * 
		 * Works same as Floor in positive range.
		 * 
		 * Works same as Ceil in negative range
		 * 
		 * Example of Trunc to fraction:2 
		 * * 0.595 -> 0.59
		 * * 0.555 -> 0.55
		 * * 0.554 -> 0.55
		 * * -0.595 -> -0.59
		 * * -0.555 -> -0.55
		 * * -0.554 -> -0.55
		 */
		Trunc = "Trunc"
	}

	export interface Settings {
		readonly decimalSeparator: string;
		readonly fractionalDigits: number;
		readonly roundMode: FDecimal.RoundMode;
	}
}


export class FDecimalBase<TInstance> implements FDecimal {
	private readonly _instance: TInstance;
	private readonly _operation: FDecimal.Backend;

	public constructor(instance: TInstance, operation: FDecimal.Backend) {
		this._instance = instance;
		this._operation = operation;
	}

	public get instance(): TInstance {
		return this._instance;
	}

	public abs(): FDecimal {
		return this._operation.abs(this);
	}

	public add(value: FDecimal): FDecimal {
		return this._operation.add(this, value);
	}

	public divide(value: FDecimal, roundMode?: FDecimal.RoundMode): FDecimal {
		return this._operation.divide(this, value, roundMode);
	}

	public equals(value: FDecimal): boolean {
		return this._operation.equals(this, value);
	}

	public inverse(): FDecimal {
		return this._operation.inverse(this);
	}

	public isNegative(): boolean {
		return this._operation.isNegative(this);
	}

	public isPositive(): boolean {
		return this._operation.isPositive(this);
	}

	public isZero(): boolean {
		return this._operation.isZero(this);
	}

	public mod(value: FDecimal): FDecimal {
		return this._operation.mod(this, value);
	}

	public multiply(value: FDecimal, roundMode?: FDecimal.RoundMode): FDecimal {
		return this._operation.multiply(this, value, roundMode);
	}

	public round(fractionDigits: FDecimal.FractionDigits, roundMode?: FDecimal.RoundMode): FDecimal {
		return this._operation.round(this, fractionDigits, roundMode);
	}

	public subtract(value: FDecimal): FDecimal {
		return this._operation.subtract(this, value);
	}

	public toNumber(): number {
		return this._operation.toNumber(this);
	}

	public toString(): string {
		return this._operation.toString(this);
	}

	public toJSON(): string {
		return JSON.stringify(this._instance);
	}
}

export class FDecimalBackendNumber implements FDecimal.Backend {
	private static verifyFinancialFloat(test: FDecimal): asserts test is _FDecimalNumber {
		if (test instanceof _FDecimalNumber) { return; }
		throw new FExceptionInvalidOperation(`Mixed '${FDecimal.name}' implementations detected.`);
	}

	public readonly settings: FDecimal.Settings;

	/**
	 * 
	 * @param roundMode Default value is FDecimal.RoundMode.Round
	 */
	public constructor(fractionalDigits: number, roundMode: FDecimal.RoundMode) {
		if (fractionalDigits < 0 || fractionalDigits > 20) {
			throw new FExceptionArgument("Range 0..20 overflow", "fractionalDigits");
		}
		this.settings = {
			decimalSeparator: ".",
			fractionalDigits,
			roundMode
		};
	}

	public abs(value: FDecimal): FDecimal {
		FDecimalBackendNumber.verifyFinancialFloat(value);
		return new _FDecimalNumber(Math.abs(value.instance), this);
	}

	public add(left: FDecimal, right: FDecimal): FDecimal {
		FDecimalBackendNumber.verifyFinancialFloat(left);
		FDecimalBackendNumber.verifyFinancialFloat(right);
		return new _FDecimalNumber(left.instance + right.instance, this);
	}

	public divide(left: FDecimal, right: FDecimal, roundMode?: FDecimal.RoundMode | undefined): FDecimal {
		FDecimalBackendNumber.verifyFinancialFloat(left);
		FDecimalBackendNumber.verifyFinancialFloat(right);
		const divideValueInstance: number = left.instance / right.instance;
		const roundedDivideValueInstance = this._round(divideValueInstance, this.settings.fractionalDigits, roundMode);
		return new _FDecimalNumber(roundedDivideValueInstance, this);
	}

	public equals(left: FDecimal, right: FDecimal): boolean {
		FDecimalBackendNumber.verifyFinancialFloat(left);
		FDecimalBackendNumber.verifyFinancialFloat(right);
		return left.instance === right.instance;
	}

	public fromFloat(value: number, roundMode?: FDecimal.RoundMode | undefined): FDecimal {
		return new _FDecimalNumber(value, this);
	}

	public fromInt(value: number): FDecimal {
		return new _FDecimalNumber(value, this);
	}

	public gt(left: FDecimal, right: FDecimal): boolean {
		FDecimalBackendNumber.verifyFinancialFloat(left);
		FDecimalBackendNumber.verifyFinancialFloat(right);
		return left.instance > right.instance;
	}

	public gte(left: FDecimal, right: FDecimal): boolean {
		FDecimalBackendNumber.verifyFinancialFloat(left);
		FDecimalBackendNumber.verifyFinancialFloat(right);
		return left.instance >= right.instance;
	}

	public inverse(value: FDecimal): FDecimal {
		FDecimalBackendNumber.verifyFinancialFloat(value);
		return new _FDecimalNumber(value.instance * -1, this);
	}

	public isDecimal(test: any): test is FDecimal {
		return test instanceof _FDecimalNumber;
	}

	public isNegative(test: FDecimal): boolean {
		FDecimalBackendNumber.verifyFinancialFloat(test);
		return test.instance < 0;
	}

	public isPositive(test: FDecimal): boolean {
		FDecimalBackendNumber.verifyFinancialFloat(test);
		return test.instance > 0;
	}

	public isZero(test: FDecimal): boolean {
		FDecimalBackendNumber.verifyFinancialFloat(test);
		return test.instance == 0;
	}

	public lt(left: FDecimal, right: FDecimal): boolean {
		FDecimalBackendNumber.verifyFinancialFloat(left);
		FDecimalBackendNumber.verifyFinancialFloat(right);
		return left.instance < right.instance;
	}

	public lte(left: FDecimal, right: FDecimal): boolean {
		FDecimalBackendNumber.verifyFinancialFloat(left);
		FDecimalBackendNumber.verifyFinancialFloat(right);
		return left.instance <= right.instance;
	}

	public max(left: FDecimal, right: FDecimal): FDecimal {
		FDecimalBackendNumber.verifyFinancialFloat(left);
		FDecimalBackendNumber.verifyFinancialFloat(right);
		return new _FDecimalNumber(Math.max(left.instance, right.instance), this);
	}

	public min(left: FDecimal, right: FDecimal): FDecimal {
		FDecimalBackendNumber.verifyFinancialFloat(left);
		FDecimalBackendNumber.verifyFinancialFloat(right);
		return new _FDecimalNumber(Math.min(left.instance, right.instance), this);
	}

	public mod(left: FDecimal, right: FDecimal, roundMode?: FDecimal.RoundMode): FDecimal {
		FDecimalBackendNumber.verifyFinancialFloat(left);
		FDecimalBackendNumber.verifyFinancialFloat(right);
		const modValueInstance: number = left.instance % right.instance;
		const roundedModValueInstance = this._round(modValueInstance, this.settings.fractionalDigits, roundMode);
		return new _FDecimalNumber(roundedModValueInstance, this);
	}

	public multiply(left: FDecimal, right: FDecimal, roundMode?: FDecimal.RoundMode | undefined): FDecimal {
		FDecimalBackendNumber.verifyFinancialFloat(left);
		FDecimalBackendNumber.verifyFinancialFloat(right);
		const multiplyValueInstance: number = left.instance * right.instance;
		const roundedMultiplyValueInstance = this._round(multiplyValueInstance, this.settings.fractionalDigits, roundMode);
		return new _FDecimalNumber(roundedMultiplyValueInstance, this);
	}

	public parse(value: string): FDecimal {
		return new _FDecimalNumber(Number.parseFloat(value), this);
	}

	public round(value: FDecimal, fractionDigits: number, roundMode?: FDecimal.RoundMode | undefined): FDecimal {
		FDecimalBackendNumber.verifyFinancialFloat(value);

		const roundedValueInstance = this._round(value.instance, fractionDigits, roundMode);

		return new _FDecimalNumber(roundedValueInstance, this);
	}
	private _round(valueInstance: number, fractionDigits: number, roundMode?: FDecimal.RoundMode | undefined): number {
		class UnreachableRoundModeException extends FExceptionInvalidOperation {
			public constructor(_: never) { super(); }
		}

		if (roundMode === undefined) {
			roundMode = this.settings.roundMode;
		}

		const powValue = Math.pow(10, fractionDigits + 1);

		const powedValueInstance = valueInstance * powValue;

		let powedRoundedValueInstance: number;
		switch (roundMode) {
			case FDecimal.RoundMode.Ceil:
				powedRoundedValueInstance = Math.ceil(powedValueInstance); break;
			case FDecimal.RoundMode.Floor:
				powedRoundedValueInstance = Math.floor(powedValueInstance); break;
			case FDecimal.RoundMode.Round:
				powedRoundedValueInstance = Math.round(powedValueInstance); break;
			case FDecimal.RoundMode.Trunc:
				powedRoundedValueInstance = Math.trunc(powedValueInstance); break;
			default:
				throw new UnreachableRoundModeException(roundMode);
		}

		const roundedValueInstance: number = powedRoundedValueInstance / powValue;
		return roundedValueInstance;
	}

	public subtract(left: FDecimal, right: FDecimal): FDecimal {
		FDecimalBackendNumber.verifyFinancialFloat(left);
		FDecimalBackendNumber.verifyFinancialFloat(right);
		return new _FDecimalNumber(left.instance - right.instance, this);
	}

	public toNumber(value: FDecimal): number {
		FDecimalBackendNumber.verifyFinancialFloat(value);
		return value.instance;
	}

	public toString(value: FDecimal): string {
		FDecimalBackendNumber.verifyFinancialFloat(value);
		return value.instance.toFixed(this.settings.fractionalDigits);
	}
}

class _FDecimalNumber extends FDecimalBase<number> { }
