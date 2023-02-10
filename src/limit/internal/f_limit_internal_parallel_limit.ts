import { FLimit } from "../f_limit";
import { FLimitException } from "../f_limit_exception";
import { FInternalLimitSyncBase } from "./f_internal_limit_sync_base";
import { FIntrenalLimitTokenDeferred } from "./f_intrenal_limit_token_deferred";

type FLimitTokenDeferred = FIntrenalLimitTokenDeferred & { finalize: () => void };

export class FLimitInternalParallelLimit extends FInternalLimitSyncBase {
	private readonly _maxWeight: number;
	private _activeTokenDefers: Array<FIntrenalLimitTokenDeferred>;

	public constructor(totalWeight: FLimit.Weight) {
		super();
		this._maxWeight = totalWeight;
		this._activeTokenDefers = [];
	}

	public get availableWeight(): number {
		if (super.disposed) { throw new Error("Wrong operation on disposed object"); }
		return this._maxWeight - this._activeTokenDefers.reduce((p, c) => p + c.weight, 0);
	}

	public get maxWeight(): number {
		if (super.disposed) { throw new Error("Wrong operation on disposed object"); }
		return this._maxWeight;
	}

	public accrueToken(weight: FLimit.Weight): FLimit.Token {
		super.verifyNotDisposed();
		if (this.availableWeight < weight) { throw new FLimitException("No any available tokens"); }

		let defer: FLimitTokenDeferred | null = null;
		{ // local scope
			const realDefer: FLimitTokenDeferred = {
				...FIntrenalLimitTokenDeferred.create<void>(weight),
				finalize: () => {
					realDefer.resolve();
					const index = this._activeTokenDefers.indexOf(realDefer);
					this._activeTokenDefers.splice(index, 1);
					this.raiseReleaseToken();
				}
			};
			this._activeTokenDefers.push(realDefer);
			defer = realDefer;
		}

		const token: FLimit.Token = {
			commit: () => {
				if (defer !== null) {
					defer.finalize();
				}
			},
			rollback: () => {
				if (defer !== null) {
					defer.finalize();
				}
			}
		};
		return token as FLimit.Token;
	}

	protected async onDispose(): Promise<void> {
		await Promise.all(this._activeTokenDefers.map(d => d.promise));
	}
}
