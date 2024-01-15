import { FCancellationToken } from "./f_cancellation_token.js";

export interface FCancellationTokenSource {
	readonly isCancellationRequested: boolean;
	readonly token: FCancellationToken;
	cancel(): void;
}
