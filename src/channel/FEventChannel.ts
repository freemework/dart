import { FExecutionContext } from "../execution_context";

/**
 * FEventChannel provides a channel to handle events asynchroniosly.
 * 
 * This is very similar to FSubscriberChannel but callback signature
 * does not accept Exception.
 * In another words: FEventChannel is unbreakable channel version of FSubscriberChannel.
 */
export interface FEventChannel<TData, TEvent extends FEventChannel.Event<TData> = FEventChannel.Event<TData>> {
	addHandler(cb: FEventChannel.Callback<TData, TEvent>): void;
	removeHandler(cb: FEventChannel.Callback<TData, TEvent>): void;
}
export namespace FEventChannel {
	export interface Event<TData> {
		readonly data: TData;
	}
	export interface Callback<TData, TEvent extends Event<TData> = Event<TData>> {
		(executionContext: FExecutionContext, event: TEvent): Promise<void>;
	}
}
