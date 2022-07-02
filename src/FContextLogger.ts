// import { FException } from "./FException";

// export interface FContextLoggerProperty {
// 	readonly name: string;
// 	readonly value: number | string | boolean;
// }

// export interface FContextLoggerProperties {
// 	readonly [name: string]: number | string | boolean;
// }

// export interface FContextLogger {
// 	readonly isTraceEnabled: boolean;
// 	readonly isDebugEnabled: boolean;
// 	readonly isInfoEnabled: boolean;
// 	readonly isWarnEnabled: boolean;
// 	readonly isErrorEnabled: boolean;
// 	readonly isFatalEnabled: boolean;

// 	trace(loggerProperties: FContextLoggerProperties, message: string, ex?: FException): void;
// 	debug(loggerProperties: FContextLoggerProperties, message: string, ex?: FException): void;
// 	info(loggerProperties: FContextLoggerProperties, message: string): void;
// 	warn(loggerProperties: FContextLoggerProperties, message: string): void;
// 	error(loggerProperties: FContextLoggerProperties, message: string): void;
// 	fatal(loggerProperties: FContextLoggerProperties, message: string): void;

// 	/**
// 	 * Get sub-logger that belong to this logger
// 	 * @param name Sub-logger name
// 	 */
// 	getLogger(name: string): FContextLogger;
// }


// class _FConsoleLogger implements FContextLogger {
// 	private _loggerName: string | null;

// 	public constructor(loggerName?: string) {
// 		this._loggerName = loggerName !== undefined ? loggerName : null;
// 	}

// 	public get isTraceEnabled(): boolean { return true; }
// 	public get isDebugEnabled(): boolean { return true; }
// 	public get isInfoEnabled(): boolean { return true; }
// 	public get isWarnEnabled(): boolean { return true; }
// 	public get isErrorEnabled(): boolean { return true; }
// 	public get isFatalEnabled(): boolean { return true; }

// 	public trace(loggerContext: FContextLoggerProperties, message: string, ex?: FException): void {
// 		const msg: string = this._formatMessage(loggerContext, message);
// 		if (ex !== undefined) {
// 			console.trace(msg, ex);
// 		} else {
// 			console.trace(msg);
// 		}
// 	}
// 	public debug(loggerContext: FContextLoggerProperties, message: string, ex?: FException): void {
// 		const msg: string = this._formatMessage(loggerContext, message);
// 		if (ex !== undefined) {
// 			console.debug(msg, ex);
// 		} else {
// 			console.debug(msg);
// 		}
// 	}
// 	public info(loggerContext: FContextLoggerProperties, message: string): void {
// 		console.info(this._formatMessage(loggerContext, message));
// 	}
// 	public warn(loggerContext: FContextLoggerProperties, message: string): void {
// 		console.warn(this._formatMessage(loggerContext, message));
// 	}
// 	public error(loggerContext: FContextLoggerProperties, message: string): void {
// 		console.error(this._formatMessage(loggerContext, message));
// 	}
// 	public fatal(loggerContext: FContextLoggerProperties, message: string): void {
// 		console.error(this._formatMessage(loggerContext, message));
// 	}

// 	public getLogger(name: string): FContextLogger {
// 		const loggerName: string = this._loggerName !== null
// 			? `${this._loggerName}.${name}`
// 			: name;

// 		return new _FConsoleLogger(loggerName);
// 	}

// 	private _formatMessage(loggerContext: FContextLoggerProperties, message: string): string {
// 		const loggerName: string = this._loggerName !== null ? this._loggerName : "Unnamed Logger";
// 		const ctx: string = JSON.stringify({ ...loggerContext });
// 		const msg: string = `[${loggerName}] ${ctx}: ${message}`;
// 		return msg;
// 	}
// }

// export namespace FLoggerExt {
// 	export const None: FContextLogger = Object.freeze({
// 		get isTraceEnabled(): boolean { return false; },
// 		get isDebugEnabled(): boolean { return false; },
// 		get isInfoEnabled(): boolean { return false; },
// 		get isWarnEnabled(): boolean { return false; },
// 		get isErrorEnabled(): boolean { return false; },
// 		get isFatalEnabled(): boolean { return false; },

// 		trace(loggerContext: FContextLoggerProperties, message: string, ex?: FException): void { },
// 		debug(loggerContext: FContextLoggerProperties, message: string, ex?: FException): void { },
// 		info(loggerContext: FContextLoggerProperties, message: string): void { },
// 		warn(loggerContext: FContextLoggerProperties, message: string): void { },
// 		error(loggerContext: FContextLoggerProperties, message: string): void { },
// 		fatal(loggerContext: FContextLoggerProperties, message: string): void { },

// 		getLogger(name: string): FContextLogger { return FLoggerExt.None; }
// 	});

// 	export const Console: FContextLogger = new _FConsoleLogger();
// }
