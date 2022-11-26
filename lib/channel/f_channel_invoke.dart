import "../execution_context/f_execution_context.dart" show FExecutionContext;

///
/// Define some kind of a transport for RPC implementations
///
abstract class FChannelInvoke<TIn, TOut> {
  Future<TOut> invoke(FExecutionContext executionContext, TIn args);
}
