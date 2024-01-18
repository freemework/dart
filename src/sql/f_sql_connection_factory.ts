import { FExecutionContext } from "../execution_context/f_execution_context.js";

import { FSqlConnection } from "./f_sql_connection.js";

export interface FSqlConnectionFactory {
	create(executionContext: FExecutionContext): Promise<FSqlConnection>;
	usingConnection<T>(
		executionContext: FExecutionContext,
		worker: FSqlConnectionFactory.Worker<T>,
	): Promise<T>;
	usingConnectionWithTransaction<T>(
		executionContext: FExecutionContext,
		worker: FSqlConnectionFactory.Worker<T>,
	): Promise<T>;
}
export namespace FSqlConnectionFactory {
	export type WorkerWithExecutionContext<T> = (executionContext: FExecutionContext, sqlConnection: FSqlConnection) => T | Promise<T>;
	export type WorkerWithoutExecutionContext<T> = (sqlConnection: FSqlConnection) => T | Promise<T>;
	export type Worker<T> = WorkerWithExecutionContext<T> | WorkerWithoutExecutionContext<T>;

}
