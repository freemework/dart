import { FException } from "./exception";

import * as _ from "lodash";

export class FEnsureException extends FException {
	public readonly data: any;
	public constructor(message: string, data: any) {
		super(message);
		this.data = data;
	}
}

export interface FEnsure {
	array<T = any>(data: Array<T>, errorMessage?: string): Array<T>;
	arrayBuffer(data: ArrayBuffer, errorMessage?: string): ArrayBuffer;
	boolean(data: boolean, errorMessage?: string): boolean;
	date(data: Date, errorMessage?: string): Date;
	defined<T = any>(data: T | null | undefined, errorMessage?: string): T;
	integer(data: number, errorMessage?: string): number;
	number(data: number, errorMessage?: string): number;
	string(data: string, errorMessage?: string): string;
	undefined(data: any, errorMessage?: string): undefined;
	arrayNullable<T>(data: Array<T> | null, errorMessage?: string): Array<T> | null;
	arrayBufferNullable(data: ArrayBuffer | null, errorMessage?: string): ArrayBuffer | null;
	booleanNullable(data: boolean | null, errorMessage?: string): boolean | null;
	dateNullable(data: Date | null, errorMessage?: string): Date | null;
	definedNullable<T>(data: T | null | undefined, errorMessage?: string): T | null;
	integerNullable(data: number | null, errorMessage?: string): number | null;
	numberNullable(data: number | null, errorMessage?: string): number | null;
	stringNullable(data: string | null, errorMessage?: string): string | null;
}

export namespace FEnsure {
	export function create(errorFactory?: (message: string, data: any) => never): FEnsure {

		function throwEnsureError(typeMsg: string, throwData: any, userErrorMessage?: string): never {
			const errorMessage = `Expected data to be "${typeMsg}".`;
			const message = userErrorMessage !== undefined ? `${userErrorMessage} ${errorMessage}` : errorMessage;
			if (errorFactory !== undefined) {
				errorFactory(message, throwData); // throws an user's error
			}
	
			throw new FEnsureException(message, throwData);
		}
		function Type<T>(data: T, checker: (v: T) => boolean, typeMsg: string, userErrorMessage?: string): T {
			if (!checker(data)) {
				throwEnsureError(typeMsg, data, userErrorMessage);
			}
			return data;
		}
		function NullableType<T>(data: T, checker: (v: T) => boolean, typeMsg: string, userErrorMessage?: string): T | null {
			if (data === undefined || (data !== null && !checker(data))) {
				throwEnsureError(typeMsg, data, userErrorMessage);
			}
			return data;
		}
	
		return {
			array: <T>(data: Array<T>, errorMessage?: string): Array<T> => {
				return Type(data, _.isArray, "Array", errorMessage);
			},
			arrayBuffer: (data: ArrayBuffer, errorMessage?: string): ArrayBuffer => {
				return Type(data, _.isArrayBuffer, "ArrayBuffer", errorMessage);
			},
			boolean: (data: boolean, errorMessage?: string): boolean => {
				return Type(data, _.isBoolean, "boolean", errorMessage);
			},
			date: (data: Date, errorMessage?: string): Date => {
				return Type(data, _.isDate, "Date", errorMessage);
			},
			defined: <T>(data: T | null | undefined, errorMessage?: string): T => {
				if (data === undefined || data === null) {
					const message = errorMessage !== undefined ? errorMessage : "Expected data to be defined";
					if (errorFactory !== undefined) {
						errorFactory(message, data); // throws an user's error
					}
					throw new FEnsureException(message, data);
				}
				return data;
			},
			integer: (data: number, errorMessage?: string): number => {
				return Type(data, _.isInteger, "integer", errorMessage);
			},
			number: (data: number, errorMessage?: string): number => {
				return Type(data, _.isNumber, "number", errorMessage);
			},
			string: (data: string, errorMessage?: string): string => {
				return Type(data, _.isString, "string", errorMessage);
			},
			undefined: (data: any, errorMessage?: string): undefined => {
				if (data !== undefined) {
					const message = errorMessage !== undefined ? errorMessage : "Expected data to be undefined";
					if (errorFactory !== undefined) {
						errorFactory(message, data); // throws an user's error
					}
					throw new FEnsureException(message, data);
				}
				return data;
			},
	
			arrayNullable: <T>(data: Array<T> | null, errorMessage?: string): Array<T> | null => {
				return NullableType(data, _.isArray, "Array", errorMessage);
			},
			arrayBufferNullable: (data: ArrayBuffer | null, errorMessage?: string): ArrayBuffer | null => {
				return NullableType(data, _.isArrayBuffer, "ArrayBuffer", errorMessage);
			},
			booleanNullable: (data: boolean | null, errorMessage?: string): boolean | null => {
				return NullableType(data, _.isBoolean, "boolean", errorMessage);
			},
			dateNullable: (data: Date | null, errorMessage?: string): Date | null => {
				return NullableType(data, _.isDate, "Date", errorMessage);
			},
			definedNullable: <T>(data?: T | null, errorMessage?: string): T | null => {
				if (data === undefined) {
					const message = errorMessage !== undefined ? errorMessage : "Expected data to be defined";
					if (errorFactory !== undefined) {
						errorFactory(message, data); // throws an user's error
					}
					throw new FEnsureException(message, data);
				}
				return data;
			},
			integerNullable: (data: number | null, errorMessage?: string): number | null => {
				return NullableType(data, _.isInteger, "integer", errorMessage);
			},
			numberNullable: (data: number | null, errorMessage?: string): number | null => {
				return NullableType(data, _.isNumber, "number", errorMessage);
			},
			stringNullable: (data: string | null, errorMessage?: string): string | null => {
				return NullableType(data, _.isString, "string", errorMessage);
			}
		};
	}
}
