import { FExecutionContext } from "../execution_context";
import { FSqlProviderFactory } from "./FSqlProviderFactory";

export interface FSqlProviderEmbeddedFactory extends FSqlProviderFactory {
	/**
	 * Check if a Database exists
	 * @param cancellationToken Cancellation Token allows your to cancel execution process
	 */
	isDatabaseExists(executionContext: FExecutionContext): Promise<boolean>;

	/**
	 * Setup new database
	 * @param cancellationToken Cancellation Token allows your to cancel execution process
	 * @param location URL location to new database
	 * @param initScriptUrl URL location to init SQL script. Currently supported file:// and http(s):// schemas.
	 */
	newDatabase(executionContext: FExecutionContext, initScriptUrl?: URL): Promise<void>;
}
