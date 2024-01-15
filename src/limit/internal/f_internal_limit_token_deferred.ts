import { FLimit } from "../f_limit.js";

export interface FInternalLimitTokenDeferred<T = any> {
	weight: FLimit.Weight;
	resolve: (value?: T) => void;
	reject: (err: any) => void;
	promise: Promise<T>;
}

export namespace FInternalLimitTokenDeferred {
	export function create<T>(weight: FLimit.Weight): FInternalLimitTokenDeferred<T> {
		const deferred: any = { weight };
		deferred.promise = new Promise<void>((r, j) => {
			deferred.resolve = r;
			deferred.reject = j;
		});
		return deferred;
	}
}
