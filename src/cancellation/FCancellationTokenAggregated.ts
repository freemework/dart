import { FAggregateException } from "../FAggregateException";
import { FException } from "../FException";
import { FCancellationToken } from "./FCancellationToken";

/**
 * Wrap several tokens as FCancellationToken
 */
export class FCancellationTokenAggregated implements FCancellationToken {
	private readonly _innerTokens: Array<FCancellationToken>;
	private readonly _cancelListeners: Array<Function> = [];

	private _isCancellationRequested: boolean;

	public constructor(...tokens: Array<FCancellationToken>) {
		this._innerTokens = tokens;
		this._isCancellationRequested = false;

		const listener = () => {
			for (const innerToken of tokens) {
				innerToken.removeCancelListener(listener);
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
				throw new FAggregateException(errors);
			}
		};
		for (const innerToken of tokens) {
			innerToken.addCancelListener(listener);
		}
	}

	/**
	 * Returns `true` if any of inner tokens requested cancellation
	 */
	public get isCancellationRequested(): boolean {
		return this._isCancellationRequested;
	}

	public addCancelListener(cb: Function): void {
		this._cancelListeners.push(cb);
	}

	public removeCancelListener(cb: Function): void {
		const cbIndex = this._cancelListeners.indexOf(cb);
		if (cbIndex !== -1) {
			this._cancelListeners.splice(cbIndex, 1);
		}
	}

	public throwIfCancellationRequested(): void {
		for (const innerToken of this._innerTokens) {
			innerToken.throwIfCancellationRequested();
		}
	}
}
