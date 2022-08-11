import { FLimit } from "../FLimit";

export interface FInternalLimit {
	readonly availableWeight: number;
	readonly maxWeight: number;
	accrueToken(weight: FLimit.Weight): FLimit.Token;
	addReleaseTokenListener(cb: (availableTokens: number) => void): void;
	removeReleaseTokenListener(cb: (availableTokens: number) => void): void;
	dispose(): Promise<void>;
}
