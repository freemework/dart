import { FExecutionContext } from "../execution_context/f_execution_context.js";
import { FDisposable } from "../lifecycle/f_disposable.js";
import { FSqlStatementParam } from "./f_sql_statement.js";

export interface FSqlTemporaryTable extends FDisposable {
	bulkInsert(
		executionContext: FExecutionContext,
		bulkValues: ReadonlyArray<ReadonlyArray<FSqlStatementParam>>
	): Promise<void>;

	clear(
		executionContext: FExecutionContext
	): Promise<void>;

	insert(
		executionContext: FExecutionContext,
		values: ReadonlyArray<FSqlStatementParam>
	): Promise<void>;
}
