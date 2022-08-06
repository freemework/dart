import { FExecutionContext } from "../execution_context/FExecutionContext";

import { FSqlProvider } from "./FSqlProvider";

export interface FSqlProviderFactory {
	create(executionContext: FExecutionContext): Promise<FSqlProvider>;
	usingProvider<T>(
		executionContext: FExecutionContext, worker: (sqlProvder: FSqlProvider) => Promise<T>
	): Promise<T>;
	usingProviderWithTransaction<T>(
		executionContext: FExecutionContext, worker: (sqlProvder: FSqlProvider) => Promise<T>
	): Promise<T>;
}
