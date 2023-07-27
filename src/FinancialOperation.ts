// import { FDecimalBackendNumber } from "@freemework/common";
// import { Settings } from "./Settings";

// export interface FinancialOperation {
// 	readonly settings: Settings;

// 	/**
// 	 * Analog of Math​.abs()
// 	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/abs
// 	 */
// 	abs(value: string): string;
// 	/**
// 	 * Analog of Math​.abs()
// 	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/abs
// 	 */
// 	abs(value: FDecimal): FDecimal;

// 	add(left: string, right: string): string;
// 	add(left: FDecimal, right: FDecimal): FDecimal;

// 	divide(left: string, right: string, roundMode?: FDecimalRoundMode): string;
// 	divide(left: FDecimal, right: FDecimal, roundMode?: FDecimalRoundMode): FDecimal;

// 	equals(left: string, right: string): boolean;
// 	equals(left: FDecimal, right: FDecimal): boolean;

// 	ensure(value: FDecimal, errorMessage?: string): FDecimal;
// 	ensureNullable(value: FDecimal | null, errorMessage?: string): FDecimal | null;

// 	fromFloat(value: number, roundMode?: FDecimalRoundMode): FDecimal;

// 	fromInt(value: number): FDecimal;

// 	gt(left: string, right: string): boolean;
// 	gt(left: FDecimal, right: FDecimal): boolean;

// 	gte(left: string, right: string): boolean;
// 	gte(left: FDecimal, right: FDecimal): boolean;

// 	inverse(value: string): string;
// 	inverse(value: FDecimal): FDecimal;

// 	isFinancial(test: any): test is FDecimal;

// 	isNegative(test: string): boolean;
// 	isNegative(test: FDecimal): boolean;

// 	isPositive(test: string): boolean;
// 	isPositive(test: FDecimal): boolean;

// 	isZero(test: string): boolean;
// 	isZero(test: FDecimal): boolean;

// 	lt(left: string, right: string): boolean;
// 	lt(left: FDecimal, right: FDecimal): boolean;

// 	lte(left: string, right: string): boolean;
// 	lte(left: FDecimal, right: FDecimal): boolean;

// 	/**
// 	 * Analog of Math.max()
// 	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max
// 	 */
// 	max(left: string, right: string): string;
// 	/**
// 	 * Analog of Math.max()
// 	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max
// 	 */
// 	max(left: FDecimal, right: FDecimal): FDecimal;

// 	/**
// 	 * Analog of Math.min()
// 	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/min
// 	 */
// 	min(left: string, right: string): string;
// 	/**
// 	 * Analog of Math.min()
// 	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/min
// 	 */
// 	min(left: FDecimal, right: FDecimal): FDecimal;

// 	mod(left: string, right: string): string;
// 	mod(left: FDecimal, right: FDecimal): FDecimal;

// 	multiply(left: string, right: string, roundMode?: FDecimalRoundMode): string;
// 	multiply(left: FDecimal, right: FDecimal, roundMode?: FDecimalRoundMode): FDecimal;

// 	parse(value: string): FDecimal;

// 	round(value: string, fractionDigits: FDecimalFraction, roundMode?: FDecimalRoundMode): string;
// 	round(value: FDecimal, fractionDigits: FDecimalFraction, roundMode?: FDecimalRoundMode): FDecimal;

// 	subtract(left: string, right: string): string;
// 	subtract(left: FDecimal, right: FDecimal): FDecimal;

// 	toFloat(value: FDecimal): number;
// 	toInt(value: FDecimal): number;
// }
