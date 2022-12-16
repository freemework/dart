import { FExceptionInvalidOperation } from "../exception";
import { FException } from "../exception/FException";
import { FExecutionContext } from "../execution_context/FExecutionContext";
import { FLoggerProperties } from "./FLoggerProperties";

export interface LoggerFactory {
	(loggerName?: string): FLogger;
}

let _consoleLogger: FLogger;
let _noneLogger: FLogger;

export abstract class FLogger {
	private static _loggerFactory: LoggerFactory | null = null;

	public static get Console(): FLogger { return _consoleLogger; }
	public static get None(): FLogger { return _noneLogger; }

	/**
	 * Factory constructor
	 */
	public static create(loggerName: string): FLogger {
		return FLogger.loggerFactory(loggerName);
	}

	public static setLoggerFactory(factory: LoggerFactory) {
		if (FLogger._loggerFactory !== null) {
			throw new FExceptionInvalidOperation("Cannot call setLoggerFactory() twice (by design).");
		}
		FLogger._loggerFactory = factory;
	}

	private static get loggerFactory(): LoggerFactory {
		if (this._loggerFactory === null) {
			throw new FExceptionInvalidOperation("Cannot use logging subsystem before call setLoggerFactory() (by design).");
		}
		return this._loggerFactory;
	}

	public abstract get isTraceEnabled(): boolean;
	public abstract get isDebugEnabled(): boolean;
	public abstract get isInfoEnabled(): boolean;
	public abstract get isWarnEnabled(): boolean;
	public abstract get isErrorEnabled(): boolean;
	public abstract get isFatalEnabled(): boolean;

	public abstract get name(): string;

	public abstract trace(
		executionContext: FExecutionContext,
		message: string,
		ex?: FException,
	): void;
	public abstract trace(
		loggerProperties: FLoggerProperties,
		message: string,
		ex?: FException,
	): void;

	public abstract debug(
		executionContext: FExecutionContext,
		message: string,
		ex?: FException,
	): void;
	public abstract debug(
		loggerProperties: FLoggerProperties,
		message: string,
		ex?: FException,
	): void;

	public abstract info(
		executionContext: FExecutionContext,
		message: string,
	): void;
	public abstract info(
		loggerProperties: FLoggerProperties,
		message: string,
	): void;

	public abstract warn(
		executionContext: FExecutionContext,
		message: string,
	): void;
	public abstract warn(
		loggerProperties: FLoggerProperties,
		message: string,
	): void;

	public abstract error(
		executionContext: FExecutionContext,
		message: string,
	): void;
	public abstract error(
		loggerProperties: FLoggerProperties,
		message: string,
	): void;

	public abstract fatal(
		executionContext: FExecutionContext,
		message: string,
	): void;
	public abstract fatal(
		loggerProperties: FLoggerProperties,
		message: string,
	): void;
	/**
	 * Get sub-logger
	 */
	public abstract getLogger(loggerName: string): FLogger;
}

class _NoneLogger implements FLogger {
	public get isTraceEnabled(): boolean { return false; }
	public get isDebugEnabled(): boolean { return false; }
	public get isInfoEnabled(): boolean { return false; }
	public get isWarnEnabled(): boolean { return false; }
	public get isErrorEnabled(): boolean { return false; }
	public get isFatalEnabled(): boolean { return false; }
	public get name(): string { return "None"; }
	public trace(variant: FExecutionContext | FLoggerProperties, message: string, ex?: FException | undefined): void { }
	public debug(executionContext: FExecutionContext | FLoggerProperties, message: string, ex?: FException | undefined): void { }
	public info(executionContext: FExecutionContext | FLoggerProperties, message: string): void { }
	public warn(executionContext: FExecutionContext | FLoggerProperties, message: string): void { }
	public error(executionContext: FExecutionContext | FLoggerProperties, message: string): void { }
	public fatal(executionContext: FExecutionContext | FLoggerProperties, message: string): void { }
	public getLogger(loggerName: string): FLogger { return this; }
}
_noneLogger = new _NoneLogger();

import { FLoggerConsole } from './FLoggerConsole'; // Yes, here cyclic dependencies
_consoleLogger = FLoggerConsole.Default;
