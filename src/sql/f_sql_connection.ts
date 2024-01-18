import { FExecutionContext } from "../execution_context/f_execution_context.js";
import { FDisposable } from "../lifecycle/f_disposable.js";
import { FSqlConnectionFactory } from "./f_sql_connection_factory.js";
import { FSqlStatement } from "./f_sql_statement.js";
import { FSqlTemporaryTable } from "./f_sql_temporary_table.js";

export interface FSqlConnection extends FDisposable {
	/**
	 * SQL Connection factory that produce current instance.
	 */
	readonly factory: FSqlConnectionFactory;

	/**
	 * Prepare SQL statement
	 * 
	 * @param sql Raw SQL query
	 */
	statement(sql: string): FSqlStatement;

	createTempTable(
		executionContext: FExecutionContext, tableName: string, columnsDefinitions: string
	): Promise<FSqlTemporaryTable>;
}
