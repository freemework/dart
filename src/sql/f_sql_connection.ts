import { FExecutionContext } from "../execution_context/f_execution_context";
import { FDisposable } from "../lifecycle/f_disposable";
import { FSqlStatement } from "./f_sql_statement";
import { FSqlTemporaryTable } from "./f_sql_temporary_table";

export interface FSqlConnection extends FDisposable {
	statement(sql: string): FSqlStatement;
	createTempTable(
		executionContext: FExecutionContext, tableName: string, columnsDefinitions: string
	): Promise<FSqlTemporaryTable>;
}
