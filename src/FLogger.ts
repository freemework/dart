import { FArgumentException } from "./FArgumentException";
import { FException } from "./FException";

export interface FLogger {
	readonly context: FLogger.Context;

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
	getLogger(name: string): FLogger;

	/**
	 * Get sub-logger that belong to this logger
	 * @param name Sub-logger name
	 * @param context Sub-logger context
	 */
	getLogger(name: string, context: FLogger.Context): FLogger;

	/**
	 * Get sub-logger that belong to this logger
	 * @param context Sub-logger context
	 */
	getLogger(context: FLogger.Context): FLogger;
}

export abstract class FLoggerContainer implements FLogger {
	protected readonly _loggerName: string | null;
	protected readonly _context: FLogger.Context;

	public constructor(loggerName: string | null, context: FLogger.Context) {
		this._loggerName = loggerName;
		this._context = Object.freeze({ ...context });
	}

	public get context(): FLogger.Context { return this._context; }

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

	public getLogger(...args: Array<any>): FLogger {
		if (args.length === 1) {
			const arg0 = args[0]
			if (typeof arg0 === "string") {
				// getLogger(name: string): FLogger;
				const name: string = arg0;
				const loggerName: string = this._loggerName !== null
					? `${this._loggerName}.${name}`
					: name;
				return this.createSubLogger(loggerName, this._context);
			} else {
				// getLogger(context: FLogger.Context): FLogger;
				const context: FLogger.Context = arg0;
				return this.createSubLogger(this._loggerName, { ...this._context, ...context });
			}
		} else if (args.length === 2) {
			const arg0 = args[0]
			const arg1 = args[1]
			// getLogger(name: string, context: FLogger.Context): FLogger;
			const name: string = arg0;
			const context: FLogger.Context = arg1;
			const loggerName: string = this._loggerName !== null
				? `${this._loggerName}.${name}`
				: name;
			return this.createSubLogger(loggerName, { ...this._context, ...context });
		} else {
			throw new FArgumentException();
		}
	}

	protected abstract createSubLogger(loggerName: string | null, context: FLogger.Context): FLogger;
}

class _FConsoleLogger extends FLoggerContainer {
	public constructor(loggerName: string | null, context: FLogger.Context) {
		super(loggerName, context);
	}

	public get isTraceEnabled(): boolean { return true; }
	public get isDebugEnabled(): boolean { return true; }
	public get isInfoEnabled(): boolean { return true; }
	public get isWarnEnabled(): boolean { return true; }
	public get isErrorEnabled(): boolean { return true; }
	public get isFatalEnabled(): boolean { return true; }

	public trace(message: string, ex?: FException): void {
		const msg: string = this._formatMessage(message);
		if (ex !== undefined) {
			console.trace(msg, ex);
		} else {
			console.trace(msg);
		}
	}
	public debug(message: string, ex?: FException): void {
		const msg: string = this._formatMessage(message);
		if (ex !== undefined) {
			console.debug(msg, ex);
		} else {
			console.debug(msg);
		}
	}
	public info(message: string): void {
		console.info(this._formatMessage(message));
	}
	public warn(message: string): void {
		console.warn(this._formatMessage(message));
	}
	public error(message: string): void {
		console.error(this._formatMessage(message));
	}
	public fatal(message: string): void {
		console.error(this._formatMessage(message));
	}

	protected createSubLogger(loggerName: string, context: FLogger.Context): FLogger {
		return new _FConsoleLogger(loggerName, context);
	}

	private _formatMessage(message: string): string {
		const loggerName: string = this._loggerName !== null ? this._loggerName : "Unnamed Logger";
		const ctx: string = JSON.stringify({ ...this._context });
		const msg: string = `[${loggerName}] ${ctx}: ${message}`;
		return msg;
	}
}

class _FNoneLogger extends FLoggerContainer {
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

	protected createSubLogger(loggerName: string | null, context: FLogger.Context): FLogger {
		return new _FNoneLogger(loggerName, context);
	}
}

export namespace FLogger {
	export interface Context {
		readonly [name: string]: number | string | boolean;
	}
	export const None: FLogger = new _FNoneLogger(null, {});
	export const Console: FLogger = new _FConsoleLogger(null, {});
}
