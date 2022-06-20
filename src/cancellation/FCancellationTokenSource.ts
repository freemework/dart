import { FCancellationToken } from "./FCancellationToken";

export interface FCancellationTokenSource {
	readonly isCancellationRequested: boolean;
	readonly token: FCancellationToken;
	cancel(): void;
}
