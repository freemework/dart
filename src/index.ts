export { FDecimalBackendBigNumber } from "./FDecimalBackendBigNumber";

// import { Financial as FDecimal } from "@zxteam/contract";

// import * as _ from "lodash";

// import { Settings } from "./Settings";
// import { FinancialOperation } from "./FinancialOperation";
// import { AbstractFinancial } from "./impl/AbstractFinancial";

// export * from "./FinancialOperation";
// export * from "./Settings";

// export function setup(backend: FDecimalBackend, settings: Settings): FinancialOperation {
// 	const backendClass = (function () {
// 		switch (backend) {
// 			case testBackend: {
// 				try {
// 					const { default: implClass } = require("./impl/BigNumberFinancial");
// 					return implClass;
// 				} catch (e) {
// 					console.error(e);
// 					throw new Error(`Cannot load backend: ${backend}. Check/install an optional package: npm install bignumber.js`);
// 				}
// 			}
// 			default: throw new Error(`Not supported backend: ${backend}`);
// 		}
// 	})();

// 	const instance: FinancialOperation = {
// 		get settings(): Settings { return settings; },

// 		abs(value: any): any {
// 			if (value instanceof backendClass) {
// 				return value.abs();
// 			} else if (_.isString(value)) {
// 				const friendlyValue = backendClass.parse(value, settings);
// 				return friendlyValue.abs().toString();
// 			}
// 			throw new Error("Wrong arguments passed");
// 		},

// 		add(left: any, right: any): any {
// 			if (left instanceof backendClass && right instanceof backendClass) {
// 				return left.add(right);
// 			} else if (_.isString(left) && _.isString(right)) {
// 				const friendlyLeft: FDecimal = backendClass.parse(left, settings);
// 				const friendlyRight: FDecimal  = backendClass.parse(right, settings);
// 				return friendlyLeft.add(friendlyRight).toString();
// 			}
// 			throw new Error("Wrong arguments passed");
// 		},

// 		divide(left: any, right: any, roundMode?: FDecimalRoundMode): any {
// 			if (left instanceof backendClass && right instanceof backendClass) {
// 				return left.divide(right, settings.defaultRoundOpts.fractionalDigits, settings.defaultRoundOpts.roundMode);
// 			} else if (_.isString(left) && _.isString(right)) {
// 				const friendlyLeft: FDecimal = backendClass.parse(left, settings);
// 				const friendlyRight: FDecimal  = backendClass.parse(right, settings);
// 				return friendlyLeft.divide(friendlyRight, settings.defaultRoundOpts.fractionalDigits, settings.defaultRoundOpts.roundMode)
// 					.toString();
// 			}
// 			throw new Error("Wrong arguments passed");
// 		},

// 		equals(left: any, right: any): any {
// 			if (left instanceof backendClass && right instanceof backendClass) {
// 				return left.equals(right);
// 			} else if (_.isString(left) && _.isString(right)) {
// 				const friendlyLeft: FDecimal = backendClass.parse(left, settings);
// 				const friendlyRight: FDecimal  = backendClass.parse(right, settings);
// 				return friendlyLeft.equals(friendlyRight);
// 			}
// 			throw new Error("Wrong arguments passed");
// 		},

// 		ensure(value: FDecimal, errorMessage?: string): FDecimal {
// 			return backendClass.ensure(value, errorMessage);
// 		},

// 		ensureNullable(value: FDecimal | null, errorMessage?: string): FDecimal | null {
// 			return backendClass.ensureNullable(value, errorMessage);
// 		},

// 		fromFloat(value: number, roundMode?: FDecimalRoundMode): FDecimal {
// 			if (roundMode !== undefined) {
// 				const overridenSettings: Settings = Object.freeze({
// 					decimalSeparator: settings.decimalSeparator,
// 					defaultRoundOpts: Object.freeze({
// 						fractionalDigits: settings.defaultRoundOpts.fractionalDigits,
// 						roundMode
// 					})
// 				});
// 				return backendClass.fromFloat(value, overridenSettings);
// 			}
// 			return backendClass.fromFloat(value, settings);
// 		},

// 		fromInt(value: number): FDecimal {
// 			return backendClass.fromInt(value, settings);
// 		},

// 		gt(left: any, right: any): boolean {
// 			if (left instanceof backendClass && right instanceof backendClass) {
// 				return left.gt(right);
// 			} else if (_.isString(left) && _.isString(right)) {
// 				const friendlyLeft: FDecimal = backendClass.parse(left, settings);
// 				const friendlyRight: FDecimal  = backendClass.parse(right, settings);
// 				return friendlyLeft.gt(friendlyRight);
// 			}
// 			throw new Error("Wrong arguments passed");
// 		},

// 		gte(left: any, right: any): boolean {
// 			if (left instanceof backendClass && right instanceof backendClass) {
// 				return left.gte(right);
// 			} else if (_.isString(left) && _.isString(right)) {
// 				const friendlyLeft: FDecimal = backendClass.parse(left, settings);
// 				const friendlyRight: FDecimal  = backendClass.parse(right, settings);
// 				return friendlyLeft.gte(friendlyRight);
// 			}
// 			throw new Error("Wrong arguments passed");
// 		},

// 		isFinancial(test: any): test is FDecimal {
// 			return test instanceof AbstractFinancial;
// 		},

// 		isNegative(test: any) {
// 			if (test instanceof backendClass) {
// 				return test.isNegative();
// 			} else if (_.isString(test)) {
// 				const friendlyTest = backendClass.parse(test, settings);
// 				return friendlyTest.isNegative();
// 			}
// 			throw new Error("Wrong arguments passed");
// 		},

// 		isPositive(test: any) {
// 			if (test instanceof backendClass) {
// 				return test.isPositive();
// 			} else if (_.isString(test)) {
// 				const friendlyTest = backendClass.parse(test, settings);
// 				return friendlyTest.isPositive();
// 			}
// 			throw new Error("Wrong arguments passed");
// 		},

// 		isZero(test: any): boolean {
// 			if (test instanceof backendClass) {
// 				return test.isZero();
// 			} else if (_.isString(test)) {
// 				const friendlyTest = backendClass.parse(test, settings);
// 				return friendlyTest.isZero();
// 			}
// 			throw new Error("Wrong arguments passed");
// 		},

// 		inverse(value: any): any {
// 			if (value instanceof backendClass) {
// 				return value.inverse();
// 			} else if (_.isString(value)) {
// 				const friendlyValue = backendClass.parse(value, settings);
// 				return friendlyValue.inverse().toString();
// 			}
// 			throw new Error("Wrong arguments passed");
// 		},

// 		lt(left: any, right: any): boolean {
// 			if (left instanceof backendClass && right instanceof backendClass) {
// 				return left.lt(right);
// 			} else if (_.isString(left) && _.isString(right)) {
// 				const friendlyLeft: FDecimal = backendClass.parse(left, settings);
// 				const friendlyRight: FDecimal  = backendClass.parse(right, settings);
// 				return friendlyLeft.lt(friendlyRight);
// 			}
// 			throw new Error("Wrong arguments passed");
// 		},

// 		lte(left: any, right: any): boolean {
// 			if (left instanceof backendClass && right instanceof backendClass) {
// 				return left.lte(right);
// 			} else if (_.isString(left) && _.isString(right)) {
// 				const friendlyLeft: FDecimal = backendClass.parse(left, settings);
// 				const friendlyRight: FDecimal  = backendClass.parse(right, settings);
// 				return friendlyLeft.lte(friendlyRight);
// 			}
// 			throw new Error("Wrong arguments passed");
// 		},

// 		max(left: any, right: any): any {
// 			if (left instanceof backendClass && right instanceof backendClass) {
// 				return left.max(right);
// 			} else if (_.isString(left) && _.isString(right)) {
// 				const friendlyLeft: FDecimal = backendClass.parse(left, settings);
// 				const friendlyRight: FDecimal  = backendClass.parse(right, settings);
// 				return friendlyLeft.max(friendlyRight).toString();
// 			}
// 			throw new Error("Wrong arguments passed");
// 		},

// 		min(left: any, right: any): any {
// 			if (left instanceof backendClass && right instanceof backendClass) {
// 				return left.min(right);
// 			} else if (_.isString(left) && _.isString(right)) {
// 				const friendlyLeft: FDecimal = backendClass.parse(left, settings);
// 				const friendlyRight: FDecimal  = backendClass.parse(right, settings);
// 				return friendlyLeft.min(friendlyRight).toString();
// 			}
// 			throw new Error("Wrong arguments passed");
// 		},

// 		mod(left: any, right: any, roundMode?: FDecimalRoundMode): any {
// 			if (left instanceof backendClass && right instanceof backendClass) {
// 				return left.mod(right, settings.defaultRoundOpts.fractionalDigits, settings.defaultRoundOpts.roundMode);
// 			} else if (_.isString(left) && _.isString(right)) {
// 				const friendlyLeft: FDecimal = backendClass.parse(left, settings);
// 				const friendlyRight: FDecimal  = backendClass.parse(right, settings);
// 				return friendlyLeft.mod(friendlyRight, settings.defaultRoundOpts.fractionalDigits, settings.defaultRoundOpts.roundMode).toString();
// 			}
// 			throw new Error("Wrong arguments passed");
// 		},

// 		multiply(left: any, right: any, roundMode?: FDecimalRoundMode): any {
// 			if (left instanceof backendClass && right instanceof backendClass) {
// 				return left.multiply(right, settings.defaultRoundOpts.fractionalDigits, settings.defaultRoundOpts.roundMode);
// 			} else if (_.isString(left) && _.isString(right)) {
// 				const friendlyLeft: FDecimal = backendClass.parse(left, settings);
// 				const friendlyRight: FDecimal  = backendClass.parse(right, settings);
// 				return friendlyLeft.multiply(friendlyRight, settings.defaultRoundOpts.fractionalDigits, settings.defaultRoundOpts.roundMode)
// 					.toString();
// 			}
// 			throw new Error("Wrong arguments passed");
// 		},

// 		parse(value: string): FDecimal {
// 			if (_.isString(value)) {
// 				return backendClass.parse(value, settings);
// 			}
// 			throw new Error("Wrong arguments passed");
// 		},

// 		round(value: any, fractionDigits: FDecimalFraction, roundMode?: FDecimalRoundMode): any {
// 			if (value instanceof backendClass) {
// 				return value.round(fractionDigits, roundMode || settings.defaultRoundOpts.roundMode);
// 			} else if (_.isString(value)) {
// 				const friendlyValue = backendClass.parse(value, settings);
// 				return friendlyValue.round(fractionDigits, roundMode || settings.defaultRoundOpts.roundMode).toString();
// 			}
// 			throw new Error("Wrong arguments passed");
// 		},

// 		subtract(left: any, right: any): any {
// 			if (left instanceof backendClass && right instanceof backendClass) {
// 				return left.subtract(right);
// 			} else if (_.isString(left) && _.isString(right)) {
// 				const friendlyLeft: FDecimal = backendClass.parse(left, settings);
// 				const friendlyRight: FDecimal  = backendClass.parse(right, settings);
// 				return friendlyLeft.subtract(friendlyRight).toString();
// 			}
// 			throw new Error("Wrong arguments passed");
// 		},

// 		toFloat(value: FDecimal): number {
// 			if (value instanceof backendClass) {
// 				return value.toFloat();
// 			} else if (_.isString(value)) {
// 				const friendlyValue = backendClass.parse(value, settings);
// 				return friendlyValue.toFloat();
// 			}
// 			throw new Error("Wrong arguments passed");
// 		},

// 		toInt(value: FDecimal): number {
// 			if (value instanceof backendClass) {
// 				return value.toInt();
// 			} else if (_.isString(value)) {
// 				const friendlyValue = backendClass.parse(value, settings);
// 				return friendlyValue.toInt();
// 			}
// 			throw new Error("Wrong arguments passed");
// 		}
// 	};

// 	return instance;
// }

// export const DEFAULT_SETTINGS: Settings = Object.freeze({
// 	decimalSeparator: ".",
// 	defaultRoundOpts: {
// 		fractionalDigits: 18,
// 		roundMode: FDecimalRoundMode.Round
// 	}
// });

// export const FDecimal: FinancialOperation = Object.freeze(setup(testBackend, DEFAULT_SETTINGS));

// export default FDecimal;
