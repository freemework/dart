import { FLimit } from "../f_limit.js";
import { FLimitException } from "../f_limit_exception.js";
import { FInternalLimitSyncBase } from "./f_internal_limit_sync_base.js";
import { FInternalLimitTokenDeferred } from "./f_internal_limit_token_deferred.js";

type FLimitTokenDeferred = FInternalLimitTokenDeferred & { finalize: () => void, finalizing: boolean };

export class FLimitInternalTimeSpanLimit extends FInternalLimitSyncBase {
	private readonly _maxTokens: number;
	private _activeTokenDefers: Array<FLimitTokenDeferred>;
	private readonly _delay: number;
	private readonly _clearTimeoutFunc: (handle?: number) => void;
	private readonly _setTimeoutFunc: (handler: TimerHandler, timeout?: number) => number;
	private readonly _timers: Array<number> = [];

	public constructor(delay: number, hitCount: number,
		stubs: {
			clearTimeoutFunc: (handle?: number) => void,
			setTimeoutFunc: (handler: TimerHandler, timeout?: number) => number
		}
			= {
				clearTimeoutFunc: (...args) => clearTimeout(...args),
				setTimeoutFunc: (...args) => setTimeout(...args)
			}
	) {
		super();
		this._maxTokens = hitCount;
		this._delay = delay;
		this._clearTimeoutFunc = stubs.clearTimeoutFunc;
		this._setTimeoutFunc = stubs.setTimeoutFunc;
		this._activeTokenDefers = [];
	}

	public get availableWeight(): number {
		if (super.disposed) { throw new Error("Wrong operation on disposed object"); }
		return this._maxTokens - this._activeTokenDefers.reduce((p, c) => p + c.weight, 0);
	}

	public get maxWeight(): number {
		if (super.disposed) { throw new Error("Wrong operation on disposed object"); }
		return this._maxTokens;
	}

	public accrueToken(weight: FLimit.Weight): FLimit.Token {
		super.verifyNotDisposed();
		if (this.availableWeight < weight) { throw new FLimitException("No any available tokens"); }

		let defer: FLimitTokenDeferred | null = null;
		{ // local scope
			const realDefer: FLimitTokenDeferred = {
				...FInternalLimitTokenDeferred.create<void>(weight),
				finalize: () => {
					realDefer.resolve();
					const index = this._activeTokenDefers.indexOf(realDefer);
					this._activeTokenDefers.splice(index, 1);
					this.raiseReleaseToken();
				},
				finalizing: false
			};
			this._activeTokenDefers.push(realDefer);
			defer = realDefer;
		}

		const token: FLimit.Token = {
			commit: () => {
				if (defer !== null) {
					const selfDefer = defer;
					defer = null;
					selfDefer.finalizing = true;
					if (!super.disposing) {
						const timer = this._setTimeoutFunc(() => {
							const timerIndex = this._timers.indexOf(timer);
							if (timerIndex !== -1) { this._timers.splice(timerIndex, 1); }
							selfDefer.finalize();
						}, this._delay);
						this._timers.push(timer);
					} else {
						selfDefer.finalize();
					}
				}
			},
			rollback: () => {
				if (defer !== null) {
					const selfDefer = defer;
					defer = null;
					selfDefer.finalizing = true;
					selfDefer.finalize();
				}
			}
		};
		return token as FLimit.Token;
	}

	protected async onDispose(): Promise<void> {
		this._timers.slice().forEach(timer => {
			this._clearTimeoutFunc(timer);
			const timerIndex = this._timers.indexOf(timer);
			if (timerIndex !== -1) { this._timers.splice(timerIndex, 1); }
		});
		this._activeTokenDefers.filter(w => w.finalizing).forEach(d => d.finalize());
		await Promise.all(this._activeTokenDefers.map(d => d.promise));
	}
}
