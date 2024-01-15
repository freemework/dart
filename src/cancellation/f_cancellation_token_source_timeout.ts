import { FCancellationTokenSourceManual } from "./f_cancellation_token_source_manual.js";

export class FCancellationTokenSourceTimeout extends FCancellationTokenSourceManual {
	private _timeoutHandler: any;

	public constructor(timeout: number) {
		super();

		this._timeoutHandler = setTimeout(() => {
			if (this._timeoutHandler !== undefined) { delete this._timeoutHandler; }
			super.cancel();
		}, timeout);
	}

	public override cancel(): void {
		this.stopTimer();
		super.cancel();
	}

	/**
	 * After call this method, the instance behaves is as `FManualCancellationTokenSource`
	 */
	public stopTimer(): void {
		if (this._timeoutHandler !== undefined) {
			clearTimeout(this._timeoutHandler);
			delete this._timeoutHandler;
		}
	}
}
