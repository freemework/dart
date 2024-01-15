import { FExecutionContext } from "../execution_context/f_execution_context.js";
import { FDisposable } from "../lifecycle/f_disposable.js";
import { FSqlStatement } from "./f_sql_statement.js";
import { FSqlTemporaryTable } from "./f_sql_temporary_table.js";

export interface FSqlConnection extends FDisposable {
	statement(sql: string): FSqlStatement;
	createTempTable(
		executionContext: FExecutionContext, tableName: string, columnsDefinitions: string
	): Promise<FSqlTemporaryTable>;
}
