import { FExecutionContext } from "../execution_context/f_execution_context.js";

import { FSqlConnection } from "./f_sql_connection.js";

export interface FSqlConnectionFactory {
	create(executionContext: FExecutionContext): Promise<FSqlConnection>;
	usingProvider<T>(
		executionContext: FExecutionContext,
		worker: (sqlConnection: FSqlConnection) => Promise<T>
	): Promise<T>;
	usingProviderWithTransaction<T>(
		executionContext: FExecutionContext,
		worker: (sqlConnection: FSqlConnection) => Promise<T>
	): Promise<T>;
}
