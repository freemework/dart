export interface FCancellationToken {
	readonly isCancellationRequested: boolean;
	addCancelListener(cb: Function): void;
	removeCancelListener(cb: Function): void;
	throwIfCancellationRequested(): void;
}
export namespace FCancellationToken {
	export const None: FCancellationToken = Object.freeze({
		get isCancellationRequested(): boolean { return false; },
		addCancelListener(cb: Function): void {/* Dummy */ },
		removeCancelListener(cb: Function): void {/* Dummy */ },
		throwIfCancellationRequested(): void {/* Dummy */ }
	});
}
