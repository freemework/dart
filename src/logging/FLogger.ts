import { FExceptionInvalidOperation } from "../exception";
import { FException } from "../exception/FException";
import { FExecutionContext } from "../execution_context/FExecutionContext";
import { FLoggerLabels } from "./FLoggerLabels";

export interface LoggerFactory {
	(loggerName?: string): FLogger;
}

let _consoleLogger: FLogger;
let _dummyLogger: FLogger;

export abstract class FLogger {
	private static _loggerFactory: LoggerFactory | null = null;

	public static get Console(): FLogger { return _consoleLogger; }
	public static get Dummy(): FLogger { return _dummyLogger; }

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
		loggerProperties: FLoggerLabels,
		message: string,
		ex?: FException,
	): void;

	public abstract debug(
		executionContext: FExecutionContext,
		message: string,
		ex?: FException,
	): void;
	public abstract debug(
		loggerProperties: FLoggerLabels,
		message: string,
		ex?: FException,
	): void;

	public abstract info(
		executionContext: FExecutionContext,
		message: string,
	): void;
	public abstract info(
		loggerProperties: FLoggerLabels,
		message: string,
	): void;

	public abstract warn(
		executionContext: FExecutionContext,
		message: string,
	): void;
	public abstract warn(
		loggerProperties: FLoggerLabels,
		message: string,
	): void;

	public abstract error(
		executionContext: FExecutionContext,
		message: string,
	): void;
	public abstract error(
		loggerProperties: FLoggerLabels,
		message: string,
	): void;

	public abstract fatal(
		executionContext: FExecutionContext,
		message: string,
	): void;
	public abstract fatal(
		loggerProperties: FLoggerLabels,
		message: string,
	): void;
	/**
	 * Get sub-logger
	 */
	public abstract getLogger(loggerName: string): FLogger;
}

class _DummyLogger implements FLogger {
	public get isTraceEnabled(): boolean { return false; }
	public get isDebugEnabled(): boolean { return false; }
	public get isInfoEnabled(): boolean { return false; }
	public get isWarnEnabled(): boolean { return false; }
	public get isErrorEnabled(): boolean { return false; }
	public get isFatalEnabled(): boolean { return false; }
	public get name(): string { return "None"; }
	public trace(variant: FExecutionContext | FLoggerLabels, message: string, ex?: FException | undefined): void { }
	public debug(executionContext: FExecutionContext | FLoggerLabels, message: string, ex?: FException | undefined): void { }
	public info(executionContext: FExecutionContext | FLoggerLabels, message: string): void { }
	public warn(executionContext: FExecutionContext | FLoggerLabels, message: string): void { }
	public error(executionContext: FExecutionContext | FLoggerLabels, message: string): void { }
	public fatal(executionContext: FExecutionContext | FLoggerLabels, message: string): void { }
	public getLogger(loggerName: string): FLogger { return this; }
}
_dummyLogger = new _DummyLogger();

import { FLoggerConsole } from './FLoggerConsole'; // Yes, here cyclic dependencies
_consoleLogger = FLoggerConsole.Default;
