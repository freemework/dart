import { FLimit } from "../f_limit";

export interface FIntrenalLimitTokenDeferred<T = any> {
	weight: FLimit.Weight;
	resolve: (value?: T) => void;
	reject: (err: any) => void;
	promise: Promise<T>;
}

export namespace FIntrenalLimitTokenDeferred {
	export function create<T>(weight: FLimit.Weight): FIntrenalLimitTokenDeferred<T> {
		const deferred: any = { weight };
		deferred.promise = new Promise<void>((r, j) => {
			deferred.resolve = r;
			deferred.reject = j;
		});
		return deferred;
	}
}
