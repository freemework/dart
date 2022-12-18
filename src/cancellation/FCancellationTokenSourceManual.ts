import { FException, FExceptionAggregate } from "../exception";

import { FCancellationException } from "./FCancellationException";
import { FCancellationToken } from "./FCancellationToken";
import { FCancellationTokenSource } from "./FCancellationTokenSource";

export class FCancellationTokenSourceManual implements FCancellationTokenSource {
	private readonly _token: FCancellationToken;
	private readonly _cancelListeners: Array<Function> = [];
	private _isCancellationRequested: boolean;

	public constructor() {
		this._isCancellationRequested = false;
		const self = this;
		this._token = {
			get isCancellationRequested() { return self.isCancellationRequested; },
			addCancelListener(cb) { self.addCancelListener(cb); },
			removeCancelListener(cb) { self.removeCancelListener(cb); },
			throwIfCancellationRequested() { self.throwIfCancellationRequested(); }
		};
	}

	public get token(): FCancellationToken { return this._token; }
	public get isCancellationRequested(): boolean { return this._isCancellationRequested; }

	public cancel(): void {
		if (this._isCancellationRequested) {
			// Prevent to call listeners twice
			return;
		}
		this._isCancellationRequested = true;
		const errors: Array<FException> = [];
		if (this._cancelListeners.length > 0) {
			// Release callback. We do not need its anymore
			const cancelListeners = this._cancelListeners.splice(0);
			cancelListeners.forEach(cancelListener => {
				try {
					cancelListener();
				} catch (e) {
					errors.push(FException.wrapIfNeeded(e));
				}
			});
		}
		if (errors.length > 0) {
			throw new FExceptionAggregate(errors);
		}
	}

	private addCancelListener(cb: Function): void {
		this._cancelListeners.push(cb);
	}

	private removeCancelListener(cb: Function): void {
		const cbIndex = this._cancelListeners.indexOf(cb);
		if (cbIndex !== -1) {
			this._cancelListeners.splice(cbIndex, 1);
		}
	}

	private throwIfCancellationRequested(): void {
		if (this.isCancellationRequested) {
			throw new FCancellationException();
		}
	}
}
