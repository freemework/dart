import { FExecutionContext } from "../execution_context";

/** Define some kind of a transport for RPC implementations */
export interface FInvokeChannel<TIn, TOut> {
	invoke(executionContext: FExecutionContext, args: TIn): Promise<TOut>;
}
