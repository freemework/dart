import { FExecutionContext } from "../execution_context/f_execution_context.js";
import { FDecimal } from "../primitive/f_decimal.js";
import { FSqlData } from "./f_sql_data.js";

export type FSqlStatementParam =
null | boolean | string | number
| FDecimal | Date | Uint8Array
| ReadonlyArray<string> | ReadonlyArray<number>
| ReadonlyArray<FDecimal> | ReadonlyArray<Date>
| ReadonlyArray<Uint8Array>;

export interface FSqlResultRecord {
	get(name: string): FSqlData;
	get(index: number): FSqlData;
}

export interface FSqlStatement {
	/**
	 * Execute query and ignore any output
	 */
	execute(executionContext: FExecutionContext, ...values: Array<FSqlStatementParam>): Promise<void>;

	executeQuery(
		executionContext: FExecutionContext, ...values: Array<FSqlStatementParam>
	): Promise<ReadonlyArray<FSqlResultRecord>>;

	executeQueryMultiSets(
		executionContext: FExecutionContext, ...values: Array<FSqlStatementParam>
	): Promise<ReadonlyArray<ReadonlyArray<FSqlResultRecord>>>;

	executeScalar(
		executionContext: FExecutionContext, ...values: Array<FSqlStatementParam>
	): Promise<FSqlData>;

	executeScalarOrNull(
		executionContext: FExecutionContext, ...values: Array<FSqlStatementParam>
	): Promise<FSqlData | null>;

	/**
	 * Execute query with expectation of single line result
	 */
	executeSingle(
		executionContext: FExecutionContext, ...values: Array<FSqlStatementParam>
	): Promise<FSqlResultRecord>;

	/**
	 * Execute query with expectation of single line result or no any record
	 */
	executeSingleOrNull(
		executionContext: FExecutionContext, ...values: Array<FSqlStatementParam>
	): Promise<FSqlResultRecord | null>;

}
