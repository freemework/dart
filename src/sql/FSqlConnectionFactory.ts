import { FExecutionContext } from "../execution_context/FExecutionContext";

import { FSqlConnection } from "./FSqlConnection";

export interface FSqlConnectionFactory {
	create(executionContext: FExecutionContext): Promise<FSqlConnection>;
	usingProvider<T>(
		executionContext: FExecutionContext, worker: (sqlProvder: FSqlConnection) => Promise<T>
	): Promise<T>;
	usingProviderWithTransaction<T>(
		executionContext: FExecutionContext, worker: (sqlProvder: FSqlConnection) => Promise<T>
	): Promise<T>;
}
