import { FCancellationToken } from "../cancellation/FCancellationToken";
import { FDisposable } from "../lifecycle";

export namespace FLimit {
	export type Weight = number;

	export interface Opts {
		perSecond?: Weight;
		perMinute?: Weight;
		perHour?: Weight;
		perTimespan?: {
			delay: number;
			count: Weight;
		};
		parallel?: Weight;
	}

	export interface Token {
		rollback(): void;
		commit(): void;
	}

	export type TokenLazyCallback = (err: any, limitToken?: Token) => void;

	export function isLimitOpts(probablyOpts: any): probablyOpts is Opts {
		if (probablyOpts !== undefined && probablyOpts !== null) {
			if (typeof probablyOpts === "object") {
				let hasAnyFriendlyField = false;
				if ("perSecond" in probablyOpts) {
					if (!(probablyOpts.perSecond !== undefined && Number.isInteger(probablyOpts.perSecond))) {
						return false;
					}
					hasAnyFriendlyField = true;
				}
				if ("perMinute" in probablyOpts) {
					if (!(probablyOpts.perMinute !== undefined && Number.isInteger(probablyOpts.perMinute))) {
						return false;
					}
					hasAnyFriendlyField = true;
				}
				if ("perHour" in probablyOpts) {
					if (!(probablyOpts.perHour !== undefined && Number.isInteger(probablyOpts.perHour))) {
						return false;
					}
					hasAnyFriendlyField = true;
				}
				if ("perTimespan" in probablyOpts) {
					if (!(
						probablyOpts.perTimespan !== undefined
						&& Number.isInteger(probablyOpts.perTimespan.count)
						&& Number.isInteger(probablyOpts.perTimespan.delay))
					) {
						return false;
					}
					hasAnyFriendlyField = true;
				}
				if ("parallel" in probablyOpts) {
					if (!(probablyOpts.parallel !== undefined && Number.isInteger(probablyOpts.parallel))) {
						return false;
					}
					hasAnyFriendlyField = true;
				}
				if (hasAnyFriendlyField) {
					return true;
				}
			}
		}

		return false;
	}

	export function ensureLimitOpts(probablyOpts: any): Opts {
		if (isLimitOpts(probablyOpts)) {
			return probablyOpts;
		}
		throw new Error("Wrong argument for FLimit Opts");
	}
}

export interface FLimit extends FDisposable {
	readonly availableWeight: number;
	readonly maxWeight: number;

	/**
	 * @param tokenWeight default: 1
	 */
	accrueTokenImmediately(): FLimit.Token;
	accrueTokenImmediately(tokenWeight?: FLimit.Weight): FLimit.Token;

	accrueTokenLazy(timeout: number): Promise<FLimit.Token>;	// 1
	accrueTokenLazy(cancellationToken: FCancellationToken): Promise<FLimit.Token>; // 2

	accrueTokenLazy(timeout: number, cb: FLimit.TokenLazyCallback): void; // 3
	accrueTokenLazy(cancellationToken: FCancellationToken, cb: FLimit.TokenLazyCallback): void; // 4
	accrueTokenLazy(timeout: number, cancellationToken: FCancellationToken): Promise<FLimit.Token>; // 5
	accrueTokenLazy(tokenWeight: FLimit.Weight, timeout: number): Promise<FLimit.Token>; // 6

	accrueTokenLazy(timeout: number, cancellationToken: FCancellationToken, cb: FLimit.TokenLazyCallback): void; // 7
	accrueTokenLazy(tokenWeight: FLimit.Weight, timeout: number, cb: FLimit.TokenLazyCallback): void; // 8
	accrueTokenLazy(tokenWeight: FLimit.Weight, timeout: number, cancellationToken: FCancellationToken): Promise<FLimit.Token>; // 9

	accrueTokenLazy(tokenWeight: FLimit.Weight, timeout: number, cancellationToken: FCancellationToken, cb: FLimit.TokenLazyCallback): void; // 10
}
