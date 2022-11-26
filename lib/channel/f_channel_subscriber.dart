import "../execution_context/f_execution_context.dart" show FExecutionContext;

///
/// Define some kind of Publish-Subscribe pattern.
///
/// See https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern
///
abstract class FSubscriberChannel<TData,
    TEvent extends FChannelSubscriberEvent<TData>> {
  void addHandler(FSubscriberChannelCallback<TData, TEvent> cb);
  void removeHandler(FSubscriberChannelCallback<TData, TEvent> cb);
}

abstract class FChannelSubscriberEvent<TData> {
  TData get data;
}

///
/// event - TEvent or FException
///
typedef FSubscriberChannelCallback<TData,
        TEvent extends FChannelSubscriberEvent<TData>>
    = Future<void> Function(
  FExecutionContext executionContext,
  dynamic eventOrException,
);
