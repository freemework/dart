import { FException } from "../exception/f_exception";
import { FExceptionInvalidOperation } from "../exception/f_exception_invalid_operation";

import { FLoggerLevel } from "./f_logger_level";

import { FExecutionContext } from "../execution_context/f_execution_context";
// import { FLoggerLabels } from "./FLoggerLabels";

export interface LoggerFactory { (loggerName?: string): FLogger; }

export interface FLoggerMessageFactory { (): string; }


export abstract class FLogger {
	private static _loggerFactory: LoggerFactory | null = null;
	private static get loggerFactory(): LoggerFactory {
		if (this._loggerFactory === null) {
			console.error(
				"Logging subsystem used before call FLogger.setLoggerFactory(). Use FLoggerConsole as default logger. Please, consider to call FLogger.setLoggerFactory() at bootstrap phase."
			);
			this._loggerFactory = (loggerName?: string) => FLoggerConsole.create(loggerName, FLoggerLevel.TRACE);
		}
		return this._loggerFactory;
	}

	public static setLoggerFactory(factory: LoggerFactory) {
		if (FLogger._loggerFactory !== null) {
			throw new FExceptionInvalidOperation(
				"Cannot redefine logger factory by call setLoggerFactory(). Logger factory already set."
			);
		}
		FLogger._loggerFactory = factory;
	}

	/**
	 * Factory constructor
	 */
	public static create(loggerName?: string): FLogger {
		return FLogger.loggerFactory(loggerName);
	}

	public abstract get isTraceEnabled(): boolean;
	public abstract get isDebugEnabled(): boolean;
	public abstract get isInfoEnabled(): boolean;
	public abstract get isWarnEnabled(): boolean;
	public abstract get isErrorEnabled(): boolean;
	public abstract get isFatalEnabled(): boolean;

	public abstract get name(): string | null;

	public abstract trace(executionContext: FExecutionContext, message: string, ex?: FException): void;
	public abstract trace(executionContext: FExecutionContext, messageFactory: FLoggerMessageFactory, ex?: FException): void;

	public abstract debug(executionContext: FExecutionContext, message: string, ex?: FException): void;
	public abstract debug(executionContext: FExecutionContext, messageFactory: FLoggerMessageFactory, ex?: FException): void;
	// public abstract debug(
	// 	labels: FLoggerLabels,
	// 	message: string,
	// 	ex?: FException,
	// ): void;

	public abstract info(executionContext: FExecutionContext, message: string): void;
	public abstract info(executionContext: FExecutionContext, messageFactory: FLoggerMessageFactory): void;
	// public abstract info(
	// 	labels: FLoggerLabels,
	// 	message: string,
	// ): void;

	public abstract warn(executionContext: FExecutionContext, message: string): void;
	public abstract warn(executionContext: FExecutionContext, messageFactory: FLoggerMessageFactory): void;
	// public abstract warn(
	// 	labels: FLoggerLabels,
	// 	message: string,
	// ): void;

	public abstract error(executionContext: FExecutionContext, message: string): void;
	public abstract error(executionContext: FExecutionContext, messageFactory: FLoggerMessageFactory): void;
	// public abstract error(
	// 	labels: FLoggerLabels,
	// 	message: string,
	// ): void;

	public abstract fatal(executionContext: FExecutionContext, message: string): void;
	public abstract fatal(executionContext: FExecutionContext, messageFactory: FLoggerMessageFactory): void;
	// public abstract fatal(
	// 	labels: FLoggerLabels,
	// 	message: string,
	// ): void;
}

import { FLoggerConsole } from "./f_logger_console";  // Yes, here cyclic dependencies. Import here due to circular dependencies
