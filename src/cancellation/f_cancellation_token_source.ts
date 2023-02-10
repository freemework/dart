import { FCancellationToken } from "./f_cancellation_token";

export interface FCancellationTokenSource {
	readonly isCancellationRequested: boolean;
	readonly token: FCancellationToken;
	cancel(): void;
}
