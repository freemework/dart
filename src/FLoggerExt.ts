import { FException } from "./FException";

export interface FLoggerProperty {
	readonly name: string;
	readonly value: number | string | boolean;
}

export interface FLoggerProperties {
	readonly [name: string]: number | string | boolean;
}

export interface FLoggerExt {
	readonly isTraceEnabled: boolean;
	readonly isDebugEnabled: boolean;
	readonly isInfoEnabled: boolean;
	readonly isWarnEnabled: boolean;
	readonly isErrorEnabled: boolean;
	readonly isFatalEnabled: boolean;

	trace(loggerProperties: FLoggerProperties, message: string, ex?: FException): void;
	debug(loggerProperties: FLoggerProperties, message: string, ex?: FException): void;
	info(loggerProperties: FLoggerProperties, message: string): void;
	warn(loggerProperties: FLoggerProperties, message: string): void;
	error(loggerProperties: FLoggerProperties, message: string): void;
	fatal(loggerProperties: FLoggerProperties, message: string): void;

	/**
	 * Get sub-logger that belong to this logger
	 * @param name Sub-logger name
	 */
	getLogger(name: string): FLoggerExt;
}


class _FConsoleLogger implements FLoggerExt {
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

	public trace(loggerContext: FLoggerProperties, message: string, ex?: FException): void {
		const msg: string = this._formatMessage(loggerContext, message);
		if (ex !== undefined) {
			console.trace(msg, ex);
		} else {
			console.trace(msg);
		}
	}
	public debug(loggerContext: FLoggerProperties, message: string, ex?: FException): void {
		const msg: string = this._formatMessage(loggerContext, message);
		if (ex !== undefined) {
			console.debug(msg, ex);
		} else {
			console.debug(msg);
		}
	}
	public info(loggerContext: FLoggerProperties, message: string): void {
		console.info(this._formatMessage(loggerContext, message));
	}
	public warn(loggerContext: FLoggerProperties, message: string): void {
		console.warn(this._formatMessage(loggerContext, message));
	}
	public error(loggerContext: FLoggerProperties, message: string): void {
		console.error(this._formatMessage(loggerContext, message));
	}
	public fatal(loggerContext: FLoggerProperties, message: string): void {
		console.error(this._formatMessage(loggerContext, message));
	}

	public getLogger(name: string): FLoggerExt {
		const loggerName: string = this._loggerName !== null
			? `${this._loggerName}.${name}`
			: name;

		return new _FConsoleLogger(loggerName);
	}

	private _formatMessage(loggerContext: FLoggerProperties, message: string): string {
		const loggerName: string = this._loggerName !== null ? this._loggerName : "Unnamed Logger";
		const ctx: string = JSON.stringify({ ...loggerContext });
		const msg: string = `[${loggerName}] ${ctx}: ${message}`;
		return msg;
	}
}

export namespace FLoggerExt {
	export const None: FLoggerExt = Object.freeze({
		get isTraceEnabled(): boolean { return false; },
		get isDebugEnabled(): boolean { return false; },
		get isInfoEnabled(): boolean { return false; },
		get isWarnEnabled(): boolean { return false; },
		get isErrorEnabled(): boolean { return false; },
		get isFatalEnabled(): boolean { return false; },

		trace(loggerContext: FLoggerProperties, message: string, ex?: FException): void { },
		debug(loggerContext: FLoggerProperties, message: string, ex?: FException): void { },
		info(loggerContext: FLoggerProperties, message: string): void { },
		warn(loggerContext: FLoggerProperties, message: string): void { },
		error(loggerContext: FLoggerProperties, message: string): void { },
		fatal(loggerContext: FLoggerProperties, message: string): void { },

		getLogger(name: string): FLoggerExt { return FLoggerExt.None; }
	});

	export const Console: FLoggerExt = new _FConsoleLogger();
}
