import { FExecutionContext } from "../execution_context";

/** Define some kind of a transport for RPC implementations */
export interface FInvokeChannel<TIn = Uint8Array, TOut = Uint8Array> {
	invoke(executionContext: FExecutionContext, args: TIn): Promise<TOut>;
}
