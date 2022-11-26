// import { FExecutionContext } from "../execution_context";

import "../execution_context/f_execution_context.dart";

///
/// FChannelEvent provides a channel to handle events asynchronously.
///
/// This is very similar to FSubscriberChannel but callback signature
/// does not accept Exception.
///
/// In another words: FChannelEvent is unbreakable version of FSubscriberChannel.
///
abstract class FChannelEvent<TData, TEvent extends FChannelEventData<TData>> {
  void addHandler(FEventChannelCallback<TData, TEvent> cb);
  void removeHandler(FEventChannelCallback<TData, TEvent> cb);
}

abstract class FChannelEventData<TData> {
  TData get data;
}

typedef FEventChannelCallback<TData, TEvent extends FChannelEventData<TData>>
    = Future<void> Function(FExecutionContext executionContext, TEvent event);
