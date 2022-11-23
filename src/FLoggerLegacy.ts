import { FException, FExceptionArgument } from "./exception";

export interface FLoggerLegacy {
	readonly context: FLoggerLegacy.Context;

	readonly isTraceEnabled: boolean;
	readonly isDebugEnabled: boolean;
	readonly isInfoEnabled: boolean;
	readonly isWarnEnabled: boolean;
	readonly isErrorEnabled: boolean;
	readonly isFatalEnabled: boolean;

	trace(message: string, ex?: FException): void;
	debug(message: string, ex?: FException): void;
	info(message: string): void;
	warn(message: string): void;
	error(message: string): void;
	fatal(message: string): void;

	/**
	 * Get sub-logger that belong to this logger
	 * @param name Sub-logger name
	 */
	getLogger(name: string): FLoggerLegacy;

	/**
	 * Get sub-logger that belong to this logger
	 * @param name Sub-logger name
	 * @param context Sub-logger context
	 */
	getLogger(name: string, context: FLoggerLegacy.Context): FLoggerLegacy;

	/**
	 * Get sub-logger that belong to this logger
	 * @param context Sub-logger context
	 */
	getLogger(context: FLoggerLegacy.Context): FLoggerLegacy;
}

export abstract class FLoggerLegacyContainer implements FLoggerLegacy {
	protected readonly _loggerName: string | null;
	protected readonly _context: FLoggerLegacy.Context;

	public constructor(loggerName: string | null, context: FLoggerLegacy.Context) {
		this._loggerName = loggerName;
		this._context = Object.freeze({ ...context });
	}

	public get context(): FLoggerLegacy.Context { return this._context; }

	public abstract get isTraceEnabled(): boolean;
	public abstract get isDebugEnabled(): boolean;
	public abstract get isInfoEnabled(): boolean;
	public abstract get isWarnEnabled(): boolean;
	public abstract get isErrorEnabled(): boolean;
	public abstract get isFatalEnabled(): boolean;

	public abstract trace(message: string, ex?: FException | undefined): void;
	public abstract debug(message: string, ex?: FException | undefined): void;
	public abstract info(message: string): void;
	public abstract warn(message: string): void;
	public abstract error(message: string): void;
	public abstract fatal(message: string): void;

	public getLogger(...args: Array<any>): FLoggerLegacy {
		if (args.length === 1) {
			const arg0 = args[0]
			if (typeof arg0 === "string") {
				// getLogger(name: string): FLoggerLegacy;
				const name: string = arg0;
				const loggerName: string = this._loggerName !== null
					? `${this._loggerName}.${name}`
					: name;
				return this.createSubLogger(loggerName, this._context);
			} else {
				// getLogger(context: FLoggerLegacy.Context): FLoggerLegacy;
				const context: FLoggerLegacy.Context = arg0;
				return this.createSubLogger(this._loggerName, { ...this._context, ...context });
			}
		} else if (args.length === 2) {
			const arg0 = args[0]
			const arg1 = args[1]
			// getLogger(name: string, context: FLoggerLegacy.Context): FLoggerLegacy;
			const name: string = arg0;
			const context: FLoggerLegacy.Context = arg1;
			const loggerName: string = this._loggerName !== null
				? `${this._loggerName}.${name}`
				: name;
			return this.createSubLogger(loggerName, { ...this._context, ...context });
		} else {
			throw new FExceptionArgument();
		}
	}

	protected abstract createSubLogger(loggerName: string | null, context: FLoggerLegacy.Context): FLoggerLegacy;
}

class _FConsoleLoggerLegacy extends FLoggerLegacyContainer {
	public constructor(loggerName: string | null, context: FLoggerLegacy.Context) {
		super(loggerName, context);
	}

	public get isTraceEnabled(): boolean { return true; }
	public get isDebugEnabled(): boolean { return true; }
	public get isInfoEnabled(): boolean { return true; }
	public get isWarnEnabled(): boolean { return true; }
	public get isErrorEnabled(): boolean { return true; }
	public get isFatalEnabled(): boolean { return true; }

	public trace(message: string, ex?: FException): void {
		const msg: string = this._formatMessage("trace", message, ex);
		console.log(msg);
	}
	public debug(message: string, ex?: FException): void {
		const msg: string = this._formatMessage("debug", message, ex);
		console.log(msg);
	}
	public info(message: string): void {
		console.info(this._formatMessage("info", message));
	}
	public warn(message: string): void {
		console.warn(this._formatMessage("warn", message));
	}
	public error(message: string): void {
		console.error(this._formatMessage("error", message));
	}
	public fatal(message: string): void {
		console.error(this._formatMessage("fatal", message));
	}

	protected createSubLogger(loggerName: string, context: FLoggerLegacy.Context): FLoggerLegacy {
		return new _FConsoleLoggerLegacy(loggerName, context);
	}

	private _formatMessage(loggerLevel: string, message: string, ex?: FException): string {
		const loggerName: string = this._loggerName !== null ? this._loggerName : "Unnamed LoggerLegacy";
		const messageData: any = { ...this._context, loggerLevel, loggerName, message, };
		if (ex !== undefined) {
			messageData["exceptionName"] = ex.name;
			let recursiveEx: FException | null = ex;
			let message: string | null = null;
			let stack: string | null = null;
			while (recursiveEx !== null && recursiveEx !== undefined && recursiveEx instanceof FException) {
				const currStack = recursiveEx.stack;
				if (currStack !== undefined) {
					if (stack === null) {
						stack = currStack;
					} else {
						stack += "\n" + currStack;
					}
				}

				if (message === null) {
					message = recursiveEx.message;
				} else {
					message += "\n" + recursiveEx.message;
				}

				recursiveEx = recursiveEx.innerException;
			}
			if (stack !== null) {
				messageData["exceptionStack"] = stack;
			}
			if (message !== null) {
				messageData["exceptionMessage"] = message;
			}
		}
		const msg: string = JSON.stringify(messageData);
		return msg;
	}
}

class _FNoneLoggerLegacy extends FLoggerLegacyContainer {
	public get isTraceEnabled(): boolean { return false; }
	public get isDebugEnabled(): boolean { return false; }
	public get isInfoEnabled(): boolean { return false; }
	public get isWarnEnabled(): boolean { return false; }
	public get isErrorEnabled(): boolean { return false; }
	public get isFatalEnabled(): boolean { return false; }

	public trace(message: string, ex?: FException): void { }
	public debug(message: string, ex?: FException): void { }
	public info(message: string): void { }
	public warn(message: string): void { }
	public error(message: string): void { }
	public fatal(message: string): void { }

	protected createSubLogger(loggerName: string | null, context: FLoggerLegacy.Context): FLoggerLegacy {
		return new _FNoneLoggerLegacy(loggerName, context);
	}
}

export namespace FLoggerLegacy {
	export interface Context {
		readonly [name: string]: number | string | boolean;
	}
	export const None: FLoggerLegacy = new _FNoneLoggerLegacy(null, {});
	export const Console: FLoggerLegacy = new _FConsoleLoggerLegacy(null, {});
}
