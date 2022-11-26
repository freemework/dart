import "../execution_context/f_execution_context.dart" show FExecutionContext;

///
/// Define some kind of Publish-Subscribe pattern.
///
/// See https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern
///
abstract class FChannelPublisher<TData> {
  Future<void> send(FExecutionContext executionContext, TData data);
}
