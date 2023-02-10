import { FExecutionContext } from "../execution_context/f_execution_context";

import { FSqlConnection } from "./f_sql_connection";

export interface FSqlConnectionFactory {
	create(executionContext: FExecutionContext): Promise<FSqlConnection>;
	usingProvider<T>(
		executionContext: FExecutionContext, worker: (sqlProvder: FSqlConnection) => Promise<T>
	): Promise<T>;
	usingProviderWithTransaction<T>(
		executionContext: FExecutionContext, worker: (sqlProvder: FSqlConnection) => Promise<T>
	): Promise<T>;
}
