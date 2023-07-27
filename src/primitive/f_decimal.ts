import { FException } from "../exception/f_exception";
import { FExceptionArgument } from "../exception/f_exception_argument";
import { FExceptionInvalidOperation } from "../exception/f_exception_invalid_operation";

export abstract class FDecimal {
	public static readonly REGEXP: RegExp = /^([+-]?)(0|[1-9][0-9]*)(\.([0-9]+))?$/;

	private static _cfg: { readonly backend: FDecimalBackend; readonly settings: FDecimalSettings; } | null = null;
	private static get cfg(): { readonly backend: FDecimalBackend; readonly settings: FDecimalSettings; } {
		const cfg: { readonly backend: FDecimalBackend; readonly settings: FDecimalSettings; } | null = this._cfg;
		if (cfg !== null) {
			return cfg;
		}
		throw new FExceptionInvalidOperation(`${FDecimal.name} is not configured. Did you call ${FDecimal.name}.configure()?`);
	}
	private static get backend(): FDecimalBackend { return FDecimal.cfg.backend; }
	public static get settings(): FDecimalSettings { return FDecimal.cfg.settings; }

	public static configure(backend: FDecimalBackend): void {
		if (FDecimal._cfg !== null) {
			throw new FExceptionInvalidOperation(`Cannot ${FDecimal.name}.configure() twice. By design you have to call ${FDecimal.name}.configure() once.`);
		}
		this._cfg = Object.freeze({
			backend,
			settings: Object.freeze({
				...backend.settings
			})
		});
	}

	/**
	 * Analog of Math​.abs()
	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/abs
	 */
	public static abs(value: FDecimal): FDecimal { return FDecimal.backend.abs(value); }
	public static add(left: FDecimal, right: FDecimal): FDecimal { return FDecimal.backend.add(left, right); }
	public static divide(left: FDecimal, right: FDecimal, roundMode?: FDecimalRoundMode): FDecimal { return FDecimal.backend.divide(left, right, roundMode); }
	public static equals(left: FDecimal, right: FDecimal): boolean { return FDecimal.backend.equals(left, right); }
	public static fromFloat(value: number, roundMode?: FDecimalRoundMode): FDecimal { return FDecimal.backend.fromFloat(value, roundMode); }
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
	public static mod(left: FDecimal, right: FDecimal, roundMode?: FDecimalRoundMode): FDecimal { return FDecimal.backend.mod(left, right, roundMode); }
	public static multiply(left: FDecimal, right: FDecimal, roundMode?: FDecimalRoundMode): FDecimal { return FDecimal.backend.multiply(left, right, roundMode); }
	public static parse(value: string): FDecimal { return FDecimal.backend.parse(value); }
	public static round(value: FDecimal, fractionDigits: FDecimalFractionDigits, roundMode?: FDecimalRoundMode): FDecimal { return FDecimal.backend.round(value, fractionDigits, roundMode); }
	public static subtract(left: FDecimal, right: FDecimal): FDecimal { return FDecimal.backend.subtract(left, right); }

	public abstract abs(): FDecimal;
	public abstract add(value: FDecimal): FDecimal;
	public abstract divide(value: FDecimal, roundMode?: FDecimalRoundMode): FDecimal;
	public abstract equals(value: FDecimal): boolean;
	public abstract inverse(): FDecimal;
	public abstract isNegative(): boolean;
	public abstract isPositive(): boolean;
	public abstract isZero(): boolean;
	public abstract mod(value: FDecimal, roundMode?: FDecimalRoundMode): FDecimal;
	public abstract multiply(value: FDecimal, roundMode?: FDecimalRoundMode): FDecimal;
	public abstract round(fractionDigits: FDecimalFractionDigits, roundMode?: FDecimalRoundMode): FDecimal;
	public abstract subtract(value: FDecimal): FDecimal;
	public abstract toNumber(): number;
	public abstract toString(): string;
	public abstract toJSON(): string;
}

export type FDecimalFractionDigits = number;
export function isDecimalFraction(test: number): test is FDecimalFractionDigits {
	return Number.isSafeInteger(test) && test >= 0;
}
export function verifyDecimalFraction(test: FDecimalFractionDigits): asserts test is FDecimalFractionDigits {
	if (!isDecimalFraction(test)) {
		throw new FExceptionArgument("Wrong argument fraction. Expected integer >= 0");
	}
}

export const enum FDecimalRoundMode {
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

export class FDecimalRoundModeUnreachableException extends FException {
	public constructor(roundMode: never) {
		super(`Unsupported round mode: ${roundMode}`);
	}
}

export interface FDecimalBackend {
	readonly settings: FDecimalSettings;

	/**
	 * Analog of Math​.abs()
	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/abs
	 */
	abs(value: FDecimal): FDecimal;
	add(left: FDecimal, right: FDecimal): FDecimal;
	divide(left: FDecimal, right: FDecimal, roundMode?: FDecimalRoundMode): FDecimal;
	equals(left: FDecimal, right: FDecimal): boolean;
	fromFloat(value: number, roundMode?: FDecimalRoundMode): FDecimal;
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
	mod(left: FDecimal, right: FDecimal, roundMode?: FDecimalRoundMode): FDecimal;
	multiply(left: FDecimal, right: FDecimal, roundMode?: FDecimalRoundMode): FDecimal;
	parse(value: string): FDecimal;
	round(value: FDecimal, fractionDigits: FDecimalFractionDigits, roundMode?: FDecimalRoundMode): FDecimal;
	subtract(left: FDecimal, right: FDecimal): FDecimal;

	toNumber(value: FDecimal): number;
	toString(value: FDecimal): string;
}

export interface FDecimalSettings {
	readonly decimalSeparator: string;
	readonly fractionalDigits: number;
	readonly roundMode: FDecimalRoundMode;
}

export namespace FDecimal {
	/**
	 * @deprecated Use FDecimalFraction instead
	 */
	export type FractionDigits = FDecimalFractionDigits;
	/**
	 * @deprecated Use FDecimalFraction instead
	 */
	export namespace FractionDigits {
		/**
		 * @deprecated Use isDecimalFraction instead
		 */
		export const isDecimalFractionDigits: (test: number) => test is FDecimalFractionDigits = isDecimalFraction;
		/**
		 * @deprecated Use verifyDecimalFraction instead
		 */
		export const verifyFraction: (test: FDecimalFractionDigits) => asserts test is FDecimalFractionDigits = verifyDecimalFraction;
	}

	/**
	 * @deprecated Use FDecimalBackend instead
	 */
	export type Backend = FDecimalBackend;

	/**
	 * @deprecated Use FDecimalRoundMode instead
	 */
	export type RoundMode = FDecimalRoundMode;

	/**
	 * Use FDecimalSettings instead
	 */
	export type Settings = FDecimalSettings;

	/**
	 * @deprecated Use FDecimalRoundModeUnreachableException instead
	 */
	export type UnreachableRoundMode = FDecimalRoundModeUnreachableException;
}


export class FDecimalBase<TInstance, TBackend extends FDecimalBackend> implements FDecimal {
	private readonly _instance: TInstance;
	private readonly _backend: TBackend;

	public constructor(instance: TInstance, backend: TBackend) {
		this._instance = instance;
		this._backend = backend;
	}

	public get instance(): TInstance {
		return this._instance;
	}

	public abs(): FDecimal {
		return this._backend.abs(this);
	}

	public add(value: FDecimal): FDecimal {
		return this._backend.add(this, value);
	}

	public divide(value: FDecimal, roundMode?: FDecimalRoundMode): FDecimal {
		return this._backend.divide(this, value, roundMode);
	}

	public equals(value: FDecimal): boolean {
		return this._backend.equals(this, value);
	}

	public inverse(): FDecimal {
		return this._backend.inverse(this);
	}

	public isNegative(): boolean {
		return this._backend.isNegative(this);
	}

	public isPositive(): boolean {
		return this._backend.isPositive(this);
	}

	public isZero(): boolean {
		return this._backend.isZero(this);
	}

	public mod(value: FDecimal): FDecimal {
		return this._backend.mod(this, value);
	}

	public multiply(value: FDecimal, roundMode?: FDecimalRoundMode): FDecimal {
		return this._backend.multiply(this, value, roundMode);
	}

	public round(fractionDigits: FDecimalFractionDigits, roundMode?: FDecimalRoundMode): FDecimal {
		return this._backend.round(this, fractionDigits, roundMode);
	}

	public subtract(value: FDecimal): FDecimal {
		return this._backend.subtract(this, value);
	}

	public toNumber(): number {
		return this._backend.toNumber(this);
	}

	public toString(): string {
		return this._backend.toString(this);
	}

	public toJSON(): string {
		return this.toString();
	}

	protected get backend(): TBackend { return this._backend; }
}

export class FDecimalBackendNumber implements FDecimalBackend {
	private static verifyInstance(test: FDecimal): asserts test is _FDecimalNumber {
		if (test instanceof _FDecimalNumber) { return; }
		throw new FExceptionInvalidOperation(`Mixed '${FDecimal.name}' implementations detected.`);
	}

	public readonly settings: FDecimalSettings;

	/**
	 * 
	 * @param roundMode Default value is FDecimalRoundMode.Round
	 */
	public constructor(fractionalDigits: number, roundMode: FDecimalRoundMode) {
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
		FDecimalBackendNumber.verifyInstance(value);
		return new _FDecimalNumber(Math.abs(value.instance), this);
	}

	public add(left: FDecimal, right: FDecimal): FDecimal {
		FDecimalBackendNumber.verifyInstance(left);
		FDecimalBackendNumber.verifyInstance(right);
		return new _FDecimalNumber(left.instance + right.instance, this);
	}

	public divide(left: FDecimal, right: FDecimal, roundMode?: FDecimalRoundMode | undefined): FDecimal {
		FDecimalBackendNumber.verifyInstance(left);
		FDecimalBackendNumber.verifyInstance(right);
		const divideValueInstance: number = left.instance / right.instance;
		const roundedDivideValueInstance = this._round(divideValueInstance, this.settings.fractionalDigits, roundMode);
		return new _FDecimalNumber(roundedDivideValueInstance, this);
	}

	public equals(left: FDecimal, right: FDecimal): boolean {
		FDecimalBackendNumber.verifyInstance(left);
		FDecimalBackendNumber.verifyInstance(right);
		return left.instance === right.instance;
	}

	public fromFloat(value: number, roundMode?: FDecimalRoundMode | undefined): FDecimal {
		return new _FDecimalNumber(value, this);
	}

	public fromInt(value: number): FDecimal {
		return new _FDecimalNumber(value, this);
	}

	public gt(left: FDecimal, right: FDecimal): boolean {
		FDecimalBackendNumber.verifyInstance(left);
		FDecimalBackendNumber.verifyInstance(right);
		return left.instance > right.instance;
	}

	public gte(left: FDecimal, right: FDecimal): boolean {
		FDecimalBackendNumber.verifyInstance(left);
		FDecimalBackendNumber.verifyInstance(right);
		return left.instance >= right.instance;
	}

	public inverse(value: FDecimal): FDecimal {
		FDecimalBackendNumber.verifyInstance(value);
		return new _FDecimalNumber(value.instance * -1, this);
	}

	public isDecimal(test: any): test is FDecimal {
		return test instanceof _FDecimalNumber;
	}

	public isNegative(test: FDecimal): boolean {
		FDecimalBackendNumber.verifyInstance(test);
		return test.instance < 0;
	}

	public isPositive(test: FDecimal): boolean {
		FDecimalBackendNumber.verifyInstance(test);
		return test.instance > 0;
	}

	public isZero(test: FDecimal): boolean {
		FDecimalBackendNumber.verifyInstance(test);
		return test.instance == 0;
	}

	public lt(left: FDecimal, right: FDecimal): boolean {
		FDecimalBackendNumber.verifyInstance(left);
		FDecimalBackendNumber.verifyInstance(right);
		return left.instance < right.instance;
	}

	public lte(left: FDecimal, right: FDecimal): boolean {
		FDecimalBackendNumber.verifyInstance(left);
		FDecimalBackendNumber.verifyInstance(right);
		return left.instance <= right.instance;
	}

	public max(left: FDecimal, right: FDecimal): FDecimal {
		FDecimalBackendNumber.verifyInstance(left);
		FDecimalBackendNumber.verifyInstance(right);
		return new _FDecimalNumber(Math.max(left.instance, right.instance), this);
	}

	public min(left: FDecimal, right: FDecimal): FDecimal {
		FDecimalBackendNumber.verifyInstance(left);
		FDecimalBackendNumber.verifyInstance(right);
		return new _FDecimalNumber(Math.min(left.instance, right.instance), this);
	}

	public mod(left: FDecimal, right: FDecimal, roundMode?: FDecimalRoundMode): FDecimal {
		FDecimalBackendNumber.verifyInstance(left);
		FDecimalBackendNumber.verifyInstance(right);
		const modValueInstance: number = left.instance % right.instance;
		const roundedModValueInstance = this._round(modValueInstance, this.settings.fractionalDigits, roundMode);
		return new _FDecimalNumber(roundedModValueInstance, this);
	}

	public multiply(left: FDecimal, right: FDecimal, roundMode?: FDecimalRoundMode | undefined): FDecimal {
		FDecimalBackendNumber.verifyInstance(left);
		FDecimalBackendNumber.verifyInstance(right);
		const multiplyValueInstance: number = left.instance * right.instance;
		const roundedMultiplyValueInstance = this._round(multiplyValueInstance, this.settings.fractionalDigits, roundMode);
		return new _FDecimalNumber(roundedMultiplyValueInstance, this);
	}

	public parse(value: string): FDecimal {
		return new _FDecimalNumber(Number.parseFloat(value), this);
	}

	public round(value: FDecimal, fractionDigits: number, roundMode?: FDecimalRoundMode | undefined): FDecimal {
		FDecimalBackendNumber.verifyInstance(value);

		const roundedValueInstance = this._round(value.instance, fractionDigits, roundMode);

		return new _FDecimalNumber(roundedValueInstance, this);
	}
	private _round(valueInstance: number, fractionDigits: number, roundMode?: FDecimalRoundMode | undefined): number {
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
			case FDecimalRoundMode.Ceil:
				powedRoundedValueInstance = Math.ceil(powedValueInstance); break;
			case FDecimalRoundMode.Floor:
				powedRoundedValueInstance = Math.floor(powedValueInstance); break;
			case FDecimalRoundMode.Round:
				powedRoundedValueInstance = Math.round(powedValueInstance); break;
			case FDecimalRoundMode.Trunc:
				powedRoundedValueInstance = Math.trunc(powedValueInstance); break;
			default:
				throw new UnreachableRoundModeException(roundMode);
		}

		const roundedValueInstance: number = powedRoundedValueInstance / powValue;
		return roundedValueInstance;
	}

	public subtract(left: FDecimal, right: FDecimal): FDecimal {
		FDecimalBackendNumber.verifyInstance(left);
		FDecimalBackendNumber.verifyInstance(right);
		return new _FDecimalNumber(left.instance - right.instance, this);
	}

	public toNumber(value: FDecimal): number {
		FDecimalBackendNumber.verifyInstance(value);
		return value.instance;
	}

	public toString(value: FDecimal): string {
		FDecimalBackendNumber.verifyInstance(value);
		return value.instance.toFixed(this.settings.fractionalDigits);
	}
}

class _FDecimalNumber extends FDecimalBase<number, FDecimalBackendNumber> { }
