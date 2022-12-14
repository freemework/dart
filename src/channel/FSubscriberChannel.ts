import { FException } from "../exception";
import { FExecutionContext } from "../execution_context";

/** Define some kind of Publish-Subscribe pattern. See https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern */
export interface FSubscriberChannel<
	TData,
	TEvent extends FSubscriberChannel.Event<TData> = FSubscriberChannel.Event<TData>
> {
	addHandler(cb: FSubscriberChannel.Callback<TData, TEvent>): void;
	removeHandler(cb: FSubscriberChannel.Callback<TData, TEvent>): void;
}
export namespace FSubscriberChannel {
	export interface Event<TData> {
		readonly data: TData;
	}
	export interface Callback<TData, TEvent extends Event<TData> = Event<TData>> {
		(executionContext: FExecutionContext, event: TEvent | FException): Promise<void>;
	}
}
