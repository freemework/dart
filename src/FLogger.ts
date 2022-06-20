import { FException } from "./FException";

export interface FLogger {
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

	public getLogger(name: string): FLogger {
		const loggerName: string = this._loggerName !== null
			? `${this._loggerName}.${name}`
			: name;

		return new _FConsoleLogger(loggerName);
	}

	private _formatMessage(message: string): string {
		const loggerName: string = this._loggerName !== null ? this._loggerName : "Unnamed Logger";
		const msg: string = `[${loggerName}]: ${message}`;
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

		trace(message: string, ex?: FException): void { },
		debug(message: string, ex?: FException): void { },
		info(message: string): void { },
		warn(message: string): void { },
		error(message: string): void { },
		fatal(message: string): void { },

		getLogger(name: string): FLogger { return FLogger.None; }
	});

	export const Console: FLogger = new _FConsoleLogger();
}
