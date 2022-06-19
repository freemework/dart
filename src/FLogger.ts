import { FException } from "./FException";

export interface FLoggerProperty {
	readonly name: string;
	readonly value: number | string | boolean;
}

export interface FLoggerContext {
	readonly [name: string]: number | string | boolean;
}

export interface FLogger {
	readonly isTraceEnabled: boolean;
	readonly isDebugEnabled: boolean;
	readonly isInfoEnabled: boolean;
	readonly isWarnEnabled: boolean;
	readonly isErrorEnabled: boolean;
	readonly isFatalEnabled: boolean;

	trace(loggerContext: FLoggerContext, message: string, ex?: FException): void;
	debug(loggerContext: FLoggerContext, message: string, ex?: FException): void;
	info(loggerContext: FLoggerContext, message: string): void;
	warn(loggerContext: FLoggerContext, message: string): void;
	error(loggerContext: FLoggerContext, message: string): void;
	fatal(loggerContext: FLoggerContext, message: string): void;

	/**
	 * Get sub-logger that belong to this logger
	 * @param name Sub-logger name
	 */
	getLogger(name: string): FLogger;
}

class _FConsoleLogger implements FLogger {
	private _loggerName: string | null;

	public constructor(loggerName?: string) {
		this._loggerName = loggerName !== undefined ? loggerName : null;
	}

	public get isTraceEnabled(): boolean { return true; }
	public get isDebugEnabled(): boolean { return true; }
	public get isInfoEnabled(): boolean { return true; }
	public get isWarnEnabled(): boolean { return true; }
	public get isErrorEnabled(): boolean { return true; }
	public get isFatalEnabled(): boolean { return true; }

	public trace(loggerContext: FLoggerContext, message: string, ex?: FException): void {
		const msg: string = this._formatMessage(loggerContext, message);
		if (ex !== undefined) {
			console.trace(msg, ex);
		} else {
			console.trace(msg);
		}
	}
	public debug(loggerContext: FLoggerContext, message: string, ex?: FException): void {
		const msg: string = this._formatMessage(loggerContext, message);
		if (ex !== undefined) {
			console.debug(msg, ex);
		} else {
			console.debug(msg);
		}
	}
	public info(loggerContext: FLoggerContext, message: string): void {
		console.info(this._formatMessage(loggerContext, message));
	}
	public warn(loggerContext: FLoggerContext, message: string): void {
		console.warn(this._formatMessage(loggerContext, message));
	}
	public error(loggerContext: FLoggerContext, message: string): void {
		console.error(this._formatMessage(loggerContext, message));
	}
	public fatal(loggerContext: FLoggerContext, message: string): void {
		console.error(this._formatMessage(loggerContext, message));
	}

	public getLogger(name: string): FLogger {
		const loggerName: string = this._loggerName !== null
			? `${this._loggerName}.${name}`
			: name;

		return new _FConsoleLogger(loggerName);
	}

	private _formatMessage(loggerContext: FLoggerContext, message: string): string {
		const loggerName: string = this._loggerName !== null ? this._loggerName : "Unnamed Logger";
		const ctx: string = JSON.stringify({ ...loggerContext });
		const msg: string = `[${loggerName}] ${ctx}: ${message}`;
		return msg;
	}
}

export namespace FLogger {
	export const None: FLogger = Object.freeze({
		get isTraceEnabled(): boolean { return false; },
		get isDebugEnabled(): boolean { return false; },
		get isInfoEnabled(): boolean { return false; },
		get isWarnEnabled(): boolean { return false; },
		get isErrorEnabled(): boolean { return false; },
		get isFatalEnabled(): boolean { return false; },

		trace(loggerContext: FLoggerContext, message: string, ex?: FException): void { },
		debug(loggerContext: FLoggerContext, message: string, ex?: FException): void { },
		info(loggerContext: FLoggerContext, message: string): void { },
		warn(loggerContext: FLoggerContext, message: string): void { },
		error(loggerContext: FLoggerContext, message: string): void { },
		fatal(loggerContext: FLoggerContext, message: string): void { },

		getLogger(name: string): FLogger { return FLogger.None; }
	});

	export const Console: FLogger = new _FConsoleLogger();
}
