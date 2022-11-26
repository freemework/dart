import "dart:async";

import "../cancellation/f_cancellation_exception.dart"
    show FCancellationException;
import "../cancellation/f_cancellation_execution_context.dart"
    show FCancellationExecutionContext;
import "../cancellation/f_cancellation_token.dart" show FCancellationToken;
import "../exception/f_exception_argument.dart" show FExceptionArgument;
import "../execution_context/f_execution_context.dart" show FExecutionContext;

///
/// Provide a "sleeping" `Promise` that completes via timeout or cancellationToken
/// @param cancellationToken The cancellation token to cancel "sleeping"
/// @param ms Timeout delay in milliseconds. If ommited, the "sleeping" `Promise` will sleep infinitely and wait for cancellation token activation
///
/// Without cancellation token
/// ```dart
/// await fsleep(FCancellationToken.dummy, 25); // Suspend execution for 25 milliseconds
/// ```
///
/// Usage with [FCancellationToken] and timeout
/// ```dart
/// final cancellationTokenSource = FCancellationTokenSourceManual();
/// ...
/// await fsleep(cancellationTokenSource.token, 25); // Suspend execution for 25 milliseconds or cancel if cancellationTokenSource activates
/// ```
///
/// Usage with [FCancellationToken] only
/// ```dart
/// final cancellationTokenSource = FCancellationTokenSourceManual();
/// ...
/// await fsleep(cancellationTokenSource.token); // Suspend infinitely while cancellationTokenSource activates
/// ```
///
/// Usage with [FExecutionContext] only
/// ```dart
/// final FExecutionContext executionContext = ...;
/// ...
/// await fsleep(executionContext); // Cancellation token will extracted from execution context
/// ```
///
Future<void> fsleep(
  dynamic cancellationTokenOrExecutionContext,
  Duration? duration,
) async {
  FCancellationToken cancellationToken;
  if (cancellationTokenOrExecutionContext is FExecutionContext) {
    cancellationToken =
        FCancellationExecutionContext.of(cancellationTokenOrExecutionContext)
            .cancellationToken;
  } else if (cancellationTokenOrExecutionContext is FCancellationToken) {
    cancellationToken = cancellationTokenOrExecutionContext;
  } else {
    throw FExceptionArgument(
      "Unexpected overloading",
      "cancellationTokenOrExecutionContext",
    );
  }

  final Completer<void> completer = Completer<void>.sync();

  Timer? timer;

  void cancelCallback(FCancellationException ex) {
    cancellationToken.removeCancelListener(cancelCallback);
    if (timer != null) {
      timer!.cancel();
      timer = null;
    }
    completer.completeError(ex);
  }

  void timeoutCallback() {
    cancellationToken.removeCancelListener(cancelCallback);
    timer = null;
    completer.complete();
  }

  cancellationToken.addCancelListener(cancelCallback);
  if (duration != null) {
    timer = Timer(duration, timeoutCallback);
  }

  return completer.future;
}
