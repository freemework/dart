import { FExceptionCancelled } from "../exception/FExceptionCancelled";

export type FCancellationTokenCallback = (cancellationException: FExceptionCancelled) => void;

export abstract class FCancellationToken {
	public abstract get isCancellationRequested(): boolean;
	public abstract addCancelListener(cb: FCancellationTokenCallback): void;
	public abstract removeCancelListener(cb: FCancellationTokenCallback): void;
	public abstract throwIfCancellationRequested(): void;

	public static readonly Dummy: FCancellationToken = Object.freeze({
		get isCancellationRequested(): boolean { return false; },
		addCancelListener(cb: FCancellationTokenCallback): void {/* Dummy */ },
		removeCancelListener(cb: FCancellationTokenCallback): void {/* Dummy */ },
		throwIfCancellationRequested(): void {/* Dummy */ }
	});

}
