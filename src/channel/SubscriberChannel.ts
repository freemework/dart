/** Define some kind of Publish-Subscribe pattern. See https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern */
export interface SubscriberChannel<TData = Uint8Array, TEvent extends SubscriberChannel.Event<TData> = SubscriberChannel.Event<TData>> {
	addHandler(cb: SubscriberChannel.Callback<TData, TEvent>): void;
	removeHandler(cb: SubscriberChannel.Callback<TData, TEvent>): void;
}
export namespace SubscriberChannel {
	export interface Event<TData> {
		readonly data: TData;
	}
	export interface Callback<TData, TEvent extends Event<TData> = Event<TData>> {
		(event: TEvent | Error): void | Promise<void>;
	}
}
