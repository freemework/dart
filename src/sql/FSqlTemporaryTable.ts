import { FExecutionContext } from "../execution_context/FExecutionContext";
import { FDisposable } from "../lifecycle/FDisposable";
import { FSqlStatementParam } from "./FSqlStatement";

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
