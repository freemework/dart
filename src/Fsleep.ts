import { FCancellationToken } from "./cancellation";
import { FExceptionCancelled } from "./exception";
import { FExecutionContext, FExecutionContextCancellation } from "./execution_context";

/**
 * Provide a "sleeping" `Promise` that completes via timeout or cancellationToken
 * @param cancellationToken The cancellation token to cancel "sleeping"
 * @param ms Timeout delay in milliseconds. If ommited, the "sleeping" `Promise` will sleep infinitely and wait for cancellation token activation
 * @example
 * await Fsleep(FCancellationToken.None, 25); // Suspend execution for 25 milliseconds
 * @example
 * const cancellationTokenSource = new FCancellationTokenSourceManual();
 * ...
 * await Fsleep(cancellationTokenSource.token, 25); // Suspend execution for 25 milliseconds or cancel if cancellationTokenSource activates
 * @example
 * const cancellationTokenSource = new FCancellationTokenSourceManual();
 * ...
 * await Fsleep(cancellationTokenSource.token); // Suspend infinitely while cancellationTokenSource activates
 * @example
 * const executionContext: FExecutionContext = ...;
 * ...
 * await Fsleep(executionContext); // Cancellation token will extracted from execution context
 */
export function Fsleep(cancellationToken: FCancellationToken, ms?: number): Promise<void>;
export function Fsleep(executionContext: FExecutionContext, ms?: number): Promise<void>;
export function Fsleep(data: FExecutionContext | FCancellationToken, ms?: number): Promise<void> {
	const cancellationToken: FCancellationToken = data instanceof FExecutionContext
		? FExecutionContextCancellation.of(data).cancellationToken
		: data;

	return new Promise<void>((resolve, reject) => {
		if (cancellationToken.isCancellationRequested) {
			return reject(new FExceptionCancelled());
		}

		let timeout: NodeJS.Timeout | null = null;

		if (ms !== undefined) {
			function timeoutCallback() {
				cancellationToken.removeCancelListener(cancelCallback);
				return resolve();
			}
			timeout = setTimeout(timeoutCallback, ms);
		}

		function cancelCallback() {
			cancellationToken.removeCancelListener(cancelCallback);
			if (timeout !== null) {
				clearTimeout(timeout);
			}
			return reject(new FExceptionCancelled());
		}

		cancellationToken.addCancelListener(cancelCallback);
	});
}
