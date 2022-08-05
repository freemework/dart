import { FExecutionContext } from "../execution_context";

/** Define some kind of Publish-Subscribe pattern. See https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern */
export interface PublisherChannel<TData = Uint8Array> {
	send(executionContext: FExecutionContext, data: TData): Promise<void>;
}
