import { FCancellationToken } from "../cancellation/f_cancellation_token";
import { FExceptionArgument, FExceptionInvalidOperation } from "../exception";
import { FDisposableBase } from "../lifecycle";
import { FLimit } from "./f_limit";
import { FLimitException } from "./f_limit_exception";
import { FInternalLimit } from "./internal/f_internal_limit";
import { FIntrenalLimitExceptionAssert } from "./internal/f_intrenal_limit_exception_assert";
import { FLimitInternalParallelLimit } from "./internal/f_limit_internal_parallel_limit";
import { FLimitInternalTimespanLimit } from "./internal/f_limit_internal_timespan_limit";

function buildInnerLimits(opts: FLimit.Opts): Array<FInternalLimit> {
	const innerLimits: Array<FInternalLimit> = [];

	if (opts.perHour) {
		let count = opts.perHour;
		if (count <= 0) {
			throw new FLimitException("perHour count value should be above zero integer");
		}
		innerLimits.push(new FLimitInternalTimespanLimit(1000 * 60 * 60/* 1 hour */, count));
	}
	if (opts.perMinute) {
		let count = opts.perMinute;
		if (count <= 0) {
			throw new FLimitException("perMinute count value should be above zero integer");
		}
		innerLimits.push(new FLimitInternalTimespanLimit(1000 * 60/* 1 minute */, count));
	}
	if (opts.perSecond) {
		const count = opts.perSecond;
		if (count <= 0) {
			throw new FLimitException("perSecond count value should be above zero integer");
		}
		innerLimits.push(new FLimitInternalTimespanLimit(1000/* 1 second */, count));
	}
	if (opts.perTimespan) {
		const count: number = opts.perTimespan.count;
		const delay: number = opts.perTimespan.delay;
		if (count <= 0) {
			throw new FLimitException("perTimespan count value should be above zero integer");
		}
		if (delay <= 0) {
			throw new FLimitException("perTimespan delay value should be above zero integer");
		}
		innerLimits.push(new FLimitInternalTimespanLimit(delay, count));
	}
	if (opts.parallel) {
		let count = opts.parallel;
		if (count <= 0) {
			throw new FLimitException("parallel count value should be above zero integer");
		}
		innerLimits.push(new FLimitInternalParallelLimit(count));
	}

	return innerLimits;
}

function isCancellationToken(ct: any): ct is FCancellationToken {
	if(ct instanceof FCancellationToken) {
		return true;
	}
	return typeof ct === "object" &&
		typeof ct.addCancelListener === "function" &&
		typeof ct.removeCancelListener === "function";
}

function limitFactory(opts: FLimit.Opts): FLimit {
	const innerLimits = buildInnerLimits(opts);
	const busyLimits: Array<FInternalLimit> = [];
	const waitForTokenCallbacks: Array<[FLimit.TokenLazyCallback, Function]> = [];
	let disposing = false;

	function onBusyLimitsReleased(weight: FLimit.Weight) {
		while (waitForTokenCallbacks.length > 0) {
			const token = _accrueAggregatedToken(weight);
			if (token === null) { break; }

			const tulpe = waitForTokenCallbacks.shift();
			if (!tulpe) {
				throw new FIntrenalLimitExceptionAssert();
			}
			const [cb, timerOrRemoveListener] = tulpe;
			if (typeof timerOrRemoveListener === "function") {
				timerOrRemoveListener();
			} else {
				clearTimeout(timerOrRemoveListener);
			}
			cb(undefined, token);
		}
	}

	function _accrueAggregatedToken(weight: FLimit.Weight): FLimit.Token | null {
		if (busyLimits.length > 0) { return null; }
		if (disposing) { return null; }
		const innerTokens: Array<FLimit.Token> = [];
		for (let innerLimitIndex = 0; innerLimitIndex < innerLimits.length; innerLimitIndex++) {
			const innerLimit = innerLimits[innerLimitIndex];
			if (innerLimit.availableWeight < weight) {
				busyLimits.push(innerLimit);
			} else {
				innerTokens.push(innerLimit.accrueToken(weight));
			}
		}
		if (innerLimits.length === innerTokens.length) {
			return {
				commit: () => { innerTokens.forEach(it => it.commit()); },
				rollback: () => { innerTokens.forEach(it => it.rollback()); }
			};
		} else {
			innerTokens.forEach(it => it.rollback());
			busyLimits.forEach(bl => {
				function onReleaseBusyLimit() {
					bl.removeReleaseTokenListener(onReleaseBusyLimit);
					const blIndex = busyLimits.indexOf(bl);
					busyLimits.splice(blIndex, 1);
					if (busyLimits.length === 0) {
						onBusyLimitsReleased(weight);
					}
				}
				bl.addReleaseTokenListener(onReleaseBusyLimit);
			});
			return null;
		}
	}

	function accrueTokenImmediately(weight?: FLimit.Weight): FLimit.Token {
		if (disposing) { throw new Error("Wrong operation on disposed object"); }
		const aggregatedToken = _accrueAggregatedToken(weight !== undefined ? weight : 1);
		if (aggregatedToken != null) {
			return aggregatedToken;
		}
		throw new FLimitException("No available tokens");
	}

	async function accrueTokenLazyWithCancellationTokenPromise(
		weight: FLimit.Weight, ct: FCancellationToken
	): Promise<FLimit.Token> {
		return new Promise<FLimit.Token>((resolve, reject) => {
			accrueTokenLazyWithCancellationTokenCallback(weight, ct, (err, token) => {
				if (err) {
					reject(err);
				} else {
					resolve(token!);
				}
			});
		});
	}
	async function accrueTokenLazyWithTimeoutPromise(
		weight: FLimit.Weight, timeout: number
	): Promise<FLimit.Token> {
		return new Promise<FLimit.Token>((resolve, reject) => {
			accrueTokenLazyWithTimeoutCallback(weight, timeout, (err, token) => {
				if (err) {
					reject(err);
				} else {
					resolve(token!);
				}
			});
		});
	}
	async function accrueTokenLazyPromise(
		weight: FLimit.Weight, timeout: number, ct: FCancellationToken
	): Promise<FLimit.Token> {
		return new Promise<FLimit.Token>((resolve, reject) => {
			accrueTokenLazyCallback(weight, timeout, ct, (err, token) => {
				if (err) {
					reject(err);
				} else {
					resolve(token!);
				}
			});
		});
	}

	// tslint:disable-next-line: max-line-length
	function accrueTokenLazyWithCancellationTokenCallback(
		weight: FLimit.Weight, ct: FCancellationToken, cb: FLimit.TokenLazyCallback
	): void {
		const token = _accrueAggregatedToken(weight);
		if (token !== null) {
			cb(undefined, token);
			return;
		}

		let tuple: [FLimit.TokenLazyCallback, Function];
		const cancelCallback = () => {
			const tupleIndex = waitForTokenCallbacks.indexOf(tuple);
			if (tupleIndex < 0) { throw new FIntrenalLimitExceptionAssert(); }
			waitForTokenCallbacks.splice(tupleIndex, 1);
			tuple[1]();
			try {
				ct.throwIfCancellationRequested(); // Token should raise error
				// Guard from invalid token implementation. Fallback to FLimitException.
				cb(new FLimitException(`Timeout: Token was not accrued due cancel request`));
			} catch (e) {
				cb(e);
			}
		};
		ct.addCancelListener(cancelCallback);
		const removeListener = () => ct.removeCancelListener(cancelCallback);
		tuple = [cb, removeListener];
		waitForTokenCallbacks.push(tuple);
	}
	function accrueTokenLazyWithTimeoutCallback(
		weight: FLimit.Weight, timeout: number, cb: FLimit.TokenLazyCallback
	): void {
		const token = _accrueAggregatedToken(weight);
		if (token !== null) {
			cb(undefined, token);
			return;
		}

		// Timeout
		let tuple: [FLimit.TokenLazyCallback, Function];
		const timer = setTimeout(() => {
			const tupleIndex = waitForTokenCallbacks.indexOf(tuple);
			if (tupleIndex < 0) { throw new FIntrenalLimitExceptionAssert(); }
			waitForTokenCallbacks.splice(tupleIndex, 1);
			cb(new FLimitException(`Timeout: Token was not accrued in ${timeout} ms`));
		}, timeout);
		const removeTimer = () => clearTimeout(timer);
		tuple = [cb, removeTimer];
		waitForTokenCallbacks.push(tuple);
	}
	function accrueTokenLazyCallback(
		weight: FLimit.Weight, timeout: number, ct: FCancellationToken, cb: FLimit.TokenLazyCallback
	): void {
		const token = _accrueAggregatedToken(weight);
		if (token !== null) {
			cb(undefined, token);
			return;
		}

		// Timeout
		let tuple: [FLimit.TokenLazyCallback, Function];
		const timer = setTimeout(() => {
			const tupleIndex = waitForTokenCallbacks.indexOf(tuple);
			if (tupleIndex < 0) { throw new FIntrenalLimitExceptionAssert(); }
			waitForTokenCallbacks.splice(tupleIndex, 1);
			cb(new FLimitException(`Timeout: Token was not accrued in ${timeout} ms`));
		}, timeout);

		// Callback
		const cancelCallback = () => {
			const tupleIndex = waitForTokenCallbacks.indexOf(tuple);
			if (tupleIndex < 0) { throw new FIntrenalLimitExceptionAssert(); }
			waitForTokenCallbacks.splice(tupleIndex, 1);
			tuple[1]();
			try {
				ct.throwIfCancellationRequested(); // Token should raise error
				// Guard from invalid token implementation. Fallback to FLimitException.
				cb(new FLimitException(`Timeout: Token was not accrued due cancel request`));
			} catch (e) {
				cb(e);
			}
		};
		ct.addCancelListener(cancelCallback);

		const removeListenerAndTimer = () => {
			clearTimeout(timer);
			ct.removeCancelListener(cancelCallback);
		};
		tuple = [cb, removeListenerAndTimer];
		waitForTokenCallbacks.push(tuple);
	}

	function accrueTokenLazyOverrides(...args: Array<any>): any {
		if (disposing) { throw new FExceptionInvalidOperation("Wrong operation on disposed object"); }
		if (args.length === 1) {
			const arg0 = args[0];
			if (typeof arg0 === "number") {
				const timeout: number = arg0;
				// CASE 1: accrueTokenLazy(timeout: number): Promise<FLimit.Token>
				return accrueTokenLazyWithTimeoutPromise(1/* weight */, timeout);
			}
			if (isCancellationToken(arg0)) {
				// CASE 2: accrueTokenLazy(cancellationToken: CancellationToken): Promise<FLimit.Token>
				const cancellationToken: FCancellationToken = arg0;
				return accrueTokenLazyWithCancellationTokenPromise(1/* weight */, cancellationToken);
			}
		} else if (args.length === 2) {
			const [arg0, arg1] = args;
			if (typeof arg0 === "number") {
				const possibleWeightOrTimeout = arg0;
				if (typeof arg1 === "function") {
					// CASE 3: accrueTokenLazy(timeout: number, cb: TokenLazyCallback): void
					const timeout = possibleWeightOrTimeout;
					const callback = arg1;
					return accrueTokenLazyWithTimeoutCallback(1/* weight */, timeout, callback);
				}
				if (typeof arg1 === "number") {
					// CASE 6: accrueTokenLazy(tokenWeight: FLimit.Weight, timeout: number): Promise<FLimit.Token>
					const tokenWeight = possibleWeightOrTimeout;
					const timeout = arg1;
					return accrueTokenLazyWithTimeoutPromise(tokenWeight, timeout);
				}
				if (isCancellationToken(arg1)) {
					// CASE 5: accrueTokenLazy(timeout: number, cancellationToken: CancellationToken): Promise<FLimit.Token>
					const timeout = possibleWeightOrTimeout;
					const cancellationToken = arg1;
					return accrueTokenLazyPromise(1/* weight */, timeout, cancellationToken);
				}
			} else if (isCancellationToken(arg0)) {
				if (typeof arg1 === "function") {
					const cancellationToken = arg0;
					const callback = arg1;
					// CASE 4: accrueTokenLazy(cancellationToken: CancellationToken, cb: TokenLazyCallback): void
					return accrueTokenLazyWithCancellationTokenCallback(1/* weight */, cancellationToken, callback);
				}
			}
		} else if (args.length === 3) {
			const [arg0, arg1, arg2] = args;
			if (typeof arg0 === "number") {
				if (isCancellationToken(arg1) && typeof arg2 === "function") {
					// CASE 7: accrueTokenLazy(timeout: number, cancellationToken: CancellationToken, cb: TokenLazyCallback): void
					const timeout = arg0;
					const cancellationToken = arg1;
					const callback = arg2;
					return accrueTokenLazyCallback(1/* weight */, timeout, cancellationToken, callback);
				}
				if (typeof arg1 === "number") {
					if (typeof arg2 === "function") {
						// CASE 8: accrueTokenLazy(tokenWeight: FLimit.Weight, timeout: number, cb: TokenLazyCallback): void
						const tokenWeight = arg0;
						const timeout = arg1;
						const callback = arg2;
						return accrueTokenLazyWithTimeoutCallback(tokenWeight, timeout, callback);
					}
					if (isCancellationToken(arg2)) {
						// CASE 9: accrueTokenLazy(tokenWeight: FLimit.Weight, timeout: number, cancellationToken: CancellationToken): Promise<FLimit.Token>
						const tokenWeight = arg0;
						const timeout = arg1;
						const cancellationToken = arg2;
						return accrueTokenLazyPromise(tokenWeight, timeout, cancellationToken);
					}
				}
			}
		} else if (args.length === 4) {
			const [arg0, arg1, arg2, arg3] = args;
			if (typeof arg0 === "number" && typeof arg1 === "number" && isCancellationToken(arg2) && typeof arg3 === "function") {
				// tslint:disable-next-line:max-line-length
				// CASE 10: accrueTokenLazy(tokenWeight: FLimit.Weight, timeout: number, cancellationToken: CancellationToken, cb: TokenLazyCallback): void
				const tokenWeight = arg0;
				const timeout = arg1;
				const cancellationToken = arg2;
				const callback = arg3;
				return accrueTokenLazyCallback(tokenWeight, timeout, cancellationToken, callback);
			}

		}
		throw new FExceptionArgument("Wrong arguments");
	}

	function dispose(): Promise<void> {
		disposing = true;
		waitForTokenCallbacks.slice().forEach(waitForTokenCallback => {
			const tupleIndex = waitForTokenCallbacks.indexOf(waitForTokenCallback);
			if (tupleIndex !== -1) { waitForTokenCallbacks.splice(tupleIndex, 1); }
			const [cb, timerOrRemoveListener] = waitForTokenCallback;
			if (typeof timerOrRemoveListener === "function") {
				timerOrRemoveListener();
			} else {
				clearTimeout(timerOrRemoveListener);
			}
			cb(new FLimitException(`Timeout: Token was not accrued due disposing`));
		});
		return Promise.resolve().then(async () => {
			await Promise.all(innerLimits.map(il => il.dispose()));
		});
	}

	return {
		get maxWeight() {
			return Math.min(...innerLimits.map(f => f.maxWeight));
		},
		get availableWeight() {
			return Math.min(...innerLimits.map(f => f.availableWeight));
		},
		accrueTokenImmediately,
		accrueTokenLazy: accrueTokenLazyOverrides,
		dispose,
		[Symbol.asyncDispose]() { return dispose(); },
	};
}

export class FLimitInMemory extends FDisposableBase implements FLimit {
	private readonly _wrap: FLimit;

	public constructor(opts: FLimit.Opts) {
		super();
		this._wrap = limitFactory(opts);
	}

	public get availableWeight(): number { return this._wrap.availableWeight; }
	public get maxWeight(): number { return this._wrap.maxWeight; }

	public accrueTokenImmediately(): FLimit.Token;
	public accrueTokenImmediately(tokenWeight?: number): FLimit.Token;
	public accrueTokenImmediately(tokenWeight?: number): FLimit.Token { return this._wrap.accrueTokenImmediately(tokenWeight); }

	public accrueTokenLazy(timeout: number): Promise<FLimit.Token>;
	public accrueTokenLazy(cancellationToken: FCancellationToken): Promise<FLimit.Token>;
	public accrueTokenLazy(timeout: number, cb: FLimit.TokenLazyCallback): void;
	public accrueTokenLazy(cancellationToken: FCancellationToken, cb: FLimit.TokenLazyCallback): void;
	public accrueTokenLazy(timeout: number, cancellationToken: FCancellationToken): Promise<FLimit.Token>;
	public accrueTokenLazy(tokenWeight: number, timeout: number): Promise<FLimit.Token>;
	public accrueTokenLazy(timeout: number, cancellationToken: FCancellationToken, cb: FLimit.TokenLazyCallback): void;
	public accrueTokenLazy(tokenWeight: number, timeout: number, cb: FLimit.TokenLazyCallback): void;
	public accrueTokenLazy(tokenWeight: number, timeout: number, cancellationToken: FCancellationToken): Promise<FLimit.Token>;
	public accrueTokenLazy(tokenWeight: number, timeout: number, cancellationToken: FCancellationToken, cb: FLimit.TokenLazyCallback): void;
	public accrueTokenLazy(...args: Array<any>): void | Promise<FLimit.Token> {
		if (args.length > 3) {
			return this._wrap.accrueTokenLazy(args[0], args[1], args[2], args[3]);
		} else if (args.length > 2) {
			return this._wrap.accrueTokenLazy(args[0], args[1], args[2]);
		} else if (args.length > 1) {
			return this._wrap.accrueTokenLazy(args[0], args[1]);
		} else {
			return this._wrap.accrueTokenLazy(args[0]);
		}
	}

	protected onDispose(): Promise<void> { return this._wrap.dispose(); }
}
