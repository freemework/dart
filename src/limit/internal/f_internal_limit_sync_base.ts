import { FDisposableBase } from "../../lifecycle/f_disposable.js";
import { FLimit } from "../f_limit.js";
import { FInternalLimit } from "./f_internal_limit.js";

export abstract class FInternalLimitSyncBase extends FDisposableBase implements FInternalLimit {
	private readonly _listeners: Array<(remainTokens: number) => void> = [];
	public abstract get availableWeight(): number;
	public abstract get maxWeight(): number;
	public abstract accrueToken(weight: FLimit.Weight): FLimit.Token;
	public addReleaseTokenListener(cb: (availableTokens: number) => void): void { this._listeners.push(cb); }
	public removeReleaseTokenListener(cb: (availableTokens: number) => void): void {
		const cbIndex = this._listeners.indexOf(cb);
		if (cbIndex !== -1) { this._listeners.splice(cbIndex, 1); }
	}
	protected raiseReleaseToken() {
		const availableTokens = this.availableWeight;
		if (this.availableWeight > 0) {
			this._listeners.forEach(listener => listener(availableTokens));
		}
	}
}
