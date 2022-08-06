import { FExecutionContext } from "../execution_context/FExecutionContext";
import { FDisposable } from "../lifecycle/FDisposable";
import { FSqlStatement } from "./FSqlStatement";
import { FSqlTemporaryTable } from "./FSqlTemporaryTable";

export interface FSqlProvider extends FDisposable {
	statement(sql: string): FSqlStatement;
	createTempTable(
		executionContext: FExecutionContext, tableName: string, columnsDefinitions: string
	): Promise<FSqlTemporaryTable>;
}
