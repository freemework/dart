// import { Financial as FDecimal } from "@zxteam/contract";


// export interface Settings {
// 	readonly decimalSeparator: string;
// 	readonly defaultRoundOpts: Settings.RoundOptions;
// }

// export namespace Settings {
// 	export const enum Backend {
// 		/**
// 		 * Implementation base on pure string's arbitrary-precision arithmetic
// 		 * https://en.wikipedia.org/wiki/Arbitrary-precision_arithmetic
// 		 */
// 		string = "string",

// 		/**
// 		 * Implementation based on BigInt
// 		 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
// 		 */
// 		bigint = "bigint",

// 		/**
// 		 * A wrapper over https://www.npmjs.com/package/bignumber.js
// 		 */
// 		bignumberjs = "bignumber.js",

// 		/**
// 		 * A wrapper over https://www.npmjs.com/package/decimal.js
// 		 */
// 		decimaljs = "decimal.js"
// 	}

// 	export interface RoundOptions {
// 		readonly fractionalDigits: number;
// 		readonly roundMode: FDecimalRoundMode;
// 	}
// }
