import { FExceptionInvalidOperation } from "../exception";
import { FException } from "../exception/FException";
import { FExecutionContext } from "../execution_context/FExecutionContext";
import { FLoggerLabels } from "./FLoggerLabels";

export interface LoggerFactory {
	create(loggerName?: string): FLogger;
}

export abstract class FLogger {
	private static _loggerFactory: LoggerFactory | null = null;

	/**
	 * Factory constructor
	 */
	public static create(loggerName?: string): FLogger {
		return FLogger.loggerFactory.create(loggerName);
	}

	public static setLoggerFactory(factory: LoggerFactory) {
		if (FLogger._loggerFactory !== null) {
			throw new FExceptionInvalidOperation("Cannot redefine logger factory by call setLoggerFactory(). Logger factory already set.");
		}
		FLogger._loggerFactory = factory;
	}

	private static get loggerFactory(): LoggerFactory {
		if (this._loggerFactory === null) {
			console.error("Logging subsystem used before call FLogger.setLoggerFactory(). Use FLoggerConsole as default logger. Please, consider to call FLogger.setLoggerFactory() at bootstrap phase.");
			this._loggerFactory = FLoggerConsole;
		}
		return this._loggerFactory;
	}

	public abstract get isTraceEnabled(): boolean;
	public abstract get isDebugEnabled(): boolean;
	public abstract get isInfoEnabled(): boolean;
	public abstract get isWarnEnabled(): boolean;
	public abstract get isErrorEnabled(): boolean;
	public abstract get isFatalEnabled(): boolean;

	public abstract get name(): string | null;

	public abstract trace(
		executionContext: FExecutionContext,
		message: string,
		ex?: FException,
	): void;
	public abstract trace(
		labels: FLoggerLabels,
		message: string,
		ex?: FException,
	): void;

	public abstract debug(
		executionContext: FExecutionContext,
		message: string,
		ex?: FException,
	): void;
	public abstract debug(
		labels: FLoggerLabels,
		message: string,
		ex?: FException,
	): void;

	public abstract info(
		executionContext: FExecutionContext,
		message: string,
	): void;
	public abstract info(
		labels: FLoggerLabels,
		message: string,
	): void;

	public abstract warn(
		executionContext: FExecutionContext,
		message: string,
	): void;
	public abstract warn(
		labels: FLoggerLabels,
		message: string,
	): void;

	public abstract error(
		executionContext: FExecutionContext,
		message: string,
	): void;
	public abstract error(
		labels: FLoggerLabels,
		message: string,
	): void;

	public abstract fatal(
		executionContext: FExecutionContext,
		message: string,
	): void;
	public abstract fatal(
		labels: FLoggerLabels,
		message: string,
	): void;
}

import { FLoggerConsole } from "./FLoggerConsole"; // import here due to circular dependencies
