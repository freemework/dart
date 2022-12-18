import { FException } from "../exception";
import { FExecutionContext } from "../execution_context";

/** Define some kind of Publish-Subscribe pattern. See https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern */
export interface FChannelSubscriber<
	TData,
	TEvent extends FChannelSubscriber.Event<TData> = FChannelSubscriber.Event<TData>
> {
	addHandler(cb: FChannelSubscriber.Callback<TData, TEvent>): void;
	removeHandler(cb: FChannelSubscriber.Callback<TData, TEvent>): void;
}
export namespace FChannelSubscriber {
	export interface Event<TData> {
		readonly data: TData;
	}
	export interface Callback<TData, TEvent extends Event<TData> = Event<TData>> {
		(executionContext: FExecutionContext, event: TEvent | FException): Promise<void>;
	}
}
