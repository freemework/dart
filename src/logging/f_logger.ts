import { FException } from "../exception/f_exception.js";
import { FExceptionInvalidOperation } from "../exception/f_exception_invalid_operation.js";

import { FLoggerLevel } from "./f_logger_level.js";

import { FExecutionContext } from "../execution_context/f_execution_context.js";
import { FLoggerLabels } from "./f_logger_labels.js";
import { FUtilUnReadonly } from "../util/index.js";
import { FLoggerLabelsExecutionContext } from "./f_logger_labels_execution_context.js";

export interface LoggerFactory { (loggerName: string): FLogger; }

export interface FLoggerMessageFactory { (): string; }


export abstract class FLogger {
	private static _loggerFactory: LoggerFactory | null = null;
	private static get loggerFactory(): LoggerFactory {
		if (this._loggerFactory === null) {
			console.error(
				"Logging subsystem used before call FLogger.setLoggerFactory(). Use FLoggerConsole as default logger. Please, consider to call FLogger.setLoggerFactory() at bootstrap phase."
			);
			this._loggerFactory = (loggerName: string) => FLoggerConsole.create(loggerName, { level: FLoggerLevel.TRACE });
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
	public static create(loggerName: string): FLogger {
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

export abstract class FLoggerBase extends FLogger {
	public get isTraceEnabled(): boolean { return this.isLevelEnabled(FLoggerLevel.TRACE); }
	public get isDebugEnabled(): boolean { return this.isLevelEnabled(FLoggerLevel.DEBUG); }
	public get isInfoEnabled(): boolean { return this.isLevelEnabled(FLoggerLevel.INFO); }
	public get isWarnEnabled(): boolean { return this.isLevelEnabled(FLoggerLevel.WARN); }
	public get isErrorEnabled(): boolean { return this.isLevelEnabled(FLoggerLevel.ERROR); }
	public get isFatalEnabled(): boolean { return this.isLevelEnabled(FLoggerLevel.FATAL); }

	public get name(): string { return this._name; }

	public trace(
		variant: FExecutionContext | FLoggerLabels,
		messageOrMessageFactory: string | FLoggerMessageFactory,
		ex?: FException,
	): void {
		if (!this.isTraceEnabled) {
			return;
		}

		const loggerLabels: FLoggerLabels = FLoggerBase._resolveLoggerLabels(variant);
		const message: string = FLoggerBase._resolveMessage(messageOrMessageFactory);

		this.log(FLoggerLevel.TRACE, loggerLabels, message, ex);
	}

	public debug(
		variant: FExecutionContext | FLoggerLabels,
		messageOrMessageFactory: string | FLoggerMessageFactory,
		ex?: FException,
	): void {
		if (!this.isDebugEnabled) {
			return;
		}

		const loggerLabels: FLoggerLabels =
			FLoggerBase._resolveLoggerLabels(variant);
		const message: string = FLoggerBase._resolveMessage(messageOrMessageFactory);
		this.log(FLoggerLevel.DEBUG, loggerLabels, message, ex);
	}

	public info(
		variant: FExecutionContext | FLoggerLabels,
		messageOrMessageFactory: string | FLoggerMessageFactory,
	): void {
		if (!this.isInfoEnabled) {
			return;
		}

		const loggerLabels: FLoggerLabels =
			FLoggerBase._resolveLoggerLabels(variant);
		const message: string = FLoggerBase._resolveMessage(messageOrMessageFactory);
		this.log(FLoggerLevel.INFO, loggerLabels, message);
	}

	public warn(
		variant: FExecutionContext | FLoggerLabels,
		messageOrMessageFactory: string | FLoggerMessageFactory,
	): void {
		if (!this.isWarnEnabled) {
			return;
		}

		const loggerLabels: FLoggerLabels =
			FLoggerBase._resolveLoggerLabels(variant);
		const message: string = FLoggerBase._resolveMessage(messageOrMessageFactory);
		this.log(FLoggerLevel.WARN, loggerLabels, message);
	}

	public error(
		variant: FExecutionContext | FLoggerLabels,
		messageOrMessageFactory: string | FLoggerMessageFactory,
	): void {
		if (!this.isErrorEnabled) {
			return;
		}

		const loggerLabels: FLoggerLabels =
			FLoggerBase._resolveLoggerLabels(variant);
		const message: string = FLoggerBase._resolveMessage(messageOrMessageFactory);
		this.log(FLoggerLevel.ERROR, loggerLabels, message);
	}

	public fatal(
		variant: FExecutionContext | FLoggerLabels,
		messageOrMessageFactory: string | FLoggerMessageFactory,
	): void {
		if (!this.isFatalEnabled) {
			return;
		}

		const loggerLabels: FLoggerLabels =
			FLoggerBase._resolveLoggerLabels(variant);
		const message: string = FLoggerBase._resolveMessage(messageOrMessageFactory);
		this.log(FLoggerLevel.FATAL, loggerLabels, message);
	}

	protected constructor(loggerName: string) {
		super();

		this._name = loggerName;
	}

	protected abstract isLevelEnabled(level: FLoggerLevel): boolean;

	///
	/// Override this method to implement custom logger
	///
	protected abstract log(
		level: FLoggerLevel,
		labels: FLoggerLabels,
		message: string,
		exception?: FException,
	): void;

	private readonly _name: string;

	private static _resolveLoggerLabels(
		variant: FExecutionContext | FLoggerLabels,
	): FLoggerLabels {
		if (variant === null || variant === undefined) {
			// Sometime users pass undefined/null value.
			// It is contract violation, but not a reason to crash in logger
			return FLoggerBase._emptyLabels;
		} else if (variant instanceof FExecutionContext) {
			const executionElement = FLoggerLabelsExecutionContext
				.of(variant);
			if (executionElement !== null) {
				return Object.freeze({ ...executionElement.loggerLabels });
			} else {
				return FLoggerBase._emptyLabels; // No any logger properties on excecution context chain
			}
		} else {
			return variant;
		}
	}

	private static _resolveMessage(messageOrMessageFactory: string | FLoggerMessageFactory): string {
		if (typeof messageOrMessageFactory === "function") {
			try {
				messageOrMessageFactory = messageOrMessageFactory();
				if (typeof messageOrMessageFactory !== "string") {
					messageOrMessageFactory = `FLoggerMessageFactory contract violation detected: Non-string result. Force stringify message: ${messageOrMessageFactory}`;
				}
			} catch (e) {
				messageOrMessageFactory = "FLoggerMessageFactory contract violation detected: Exception was raised."
			}
		} else {
			if (typeof messageOrMessageFactory !== "string") {
				messageOrMessageFactory = `FLogger contract violation detected: Non-string message passed. Force stringify message: ${messageOrMessageFactory}`;
			}
		}

		return messageOrMessageFactory;
	}

	private static readonly _emptyLabels: FLoggerLabels = Object.freeze({});
}


export abstract class FLoggerBaseWithLevel extends FLoggerBase {
	public static buildLoggerLevelsMap(level: FLoggerLevel | null): Map<FLoggerLevel, boolean> {
		const levels: Map<FLoggerLevel, boolean> = new Map();
		levels.set(FLoggerLevel.FATAL, level != null && level >= FLoggerLevel.FATAL);
		levels.set(FLoggerLevel.ERROR, level != null && level >= FLoggerLevel.ERROR);
		levels.set(FLoggerLevel.WARN, level != null && level >= FLoggerLevel.WARN);
		levels.set(FLoggerLevel.INFO, level != null && level >= FLoggerLevel.INFO);
		levels.set(FLoggerLevel.DEBUG, level != null && level >= FLoggerLevel.DEBUG);
		levels.set(FLoggerLevel.TRACE, level != null && level >= FLoggerLevel.TRACE);
		return levels;
	}

	public constructor(loggerName: string, level: FLoggerLevel) {
		super(loggerName);

		// eslint-disable-next-line func-names
		const specificLogLevel: FLoggerLevel | null = (function () {
			const logLevelEnvironmentKey = `LOG_LEVEL_${loggerName}`;
			if (logLevelEnvironmentKey in process.env) {
				const specificLogLevelStr = process.env[logLevelEnvironmentKey];
				if (specificLogLevelStr !== undefined) {
					try {
						return FLoggerLevel.parse(specificLogLevelStr.toUpperCase());
					} catch (e) {
						console.error(`Unable to parse a value of environment variable '${logLevelEnvironmentKey}'.`);
					}
				}
			}
			return null;
		})();

		this.levels = FLoggerBaseWithLevel.buildLoggerLevelsMap(
			specificLogLevel !== null
				? specificLogLevel
				: level,
		);
	}

	protected isLevelEnabled(level: FLoggerLevel): boolean {
		const isEnabled: boolean | undefined = this.levels.get(level);
		return isEnabled === true;
	}

	private readonly levels: Map<FLoggerLevel, boolean>;
}


// import { FLoggerConsole } from "./f_logger_console.js";  // Yes, here cyclic dependencies. Import here due to circular dependencies
export abstract class FLoggerConsole extends FLoggerBaseWithLevel {
	/**
	 * Factory constructor
	 */
	public static override create(loggerName: string, opts?: {
		readonly level?: FLoggerLevel,
		readonly format?: FLoggerConsole.Format;
	}): FLogger {
		const level: FLoggerLevel = opts !== undefined && opts.level !== undefined ? opts.level : FLoggerLevel.TRACE;
		const format: FLoggerConsole.Format = opts !== undefined && opts.format !== undefined ? opts.format : "text";

		if (format === "json") {
			return new FLoggerConsoleJsonImpl(loggerName, level);
		} else {
			return new FLoggerConsoleTextImpl(loggerName, level);
		}
	}
}

export namespace FLoggerConsole {
	export type Format = "text" | "json";
}


class FLoggerConsoleTextImpl extends FLoggerConsole {
	protected log(
		level: FLoggerLevel,
		labels: FLoggerLabels,
		message: string,
		exception?: FException
	): void {
		let logMessageBuffer = `${new Date().toISOString()} ${this.name} [${level}]`;
		for (const [labelName, labelValue] of Object.entries(labels)) {
			logMessageBuffer += `(${labelName}:${labelValue})`;
		}

		logMessageBuffer += (" ");
		logMessageBuffer += message;
		logMessageBuffer += "\n";

		if (exception != undefined) {
			logMessageBuffer += exception.toString();
			logMessageBuffer += "\n";
		}

		switch (level) {
			case FLoggerLevel.TRACE:
			case FLoggerLevel.DEBUG:
				console.debug(logMessageBuffer);
				break;
			case FLoggerLevel.INFO:
				console.log(logMessageBuffer);
				break;
			case FLoggerLevel.WARN:
			case FLoggerLevel.ERROR:
			case FLoggerLevel.FATAL:
				console.error(logMessageBuffer);
				break;
			default:
				throw new FExceptionInvalidOperation(`Unsupported log level '${level}'.`);
		}
	}
}

interface FLoggerConsoleJsonLogEntryBase {
	readonly [label: string]: string;
	readonly name: string;
	readonly date: string;
	readonly level: string;
	readonly message: string;
}
interface FLoggerConsoleJsonLogEntryWithException extends FLoggerConsoleJsonLogEntryBase {
	readonly 'exception.name': string;
	readonly 'exception.message': string;
}
type FLoggerConsoleJsonLogEntry = FLoggerConsoleJsonLogEntryBase | FLoggerConsoleJsonLogEntryWithException;
class FLoggerConsoleJsonImpl extends FLoggerBaseWithLevel {
	public static formatLogMessage(
		loggerName: string,
		level: FLoggerLevel,
		labels: FLoggerLabels,
		message: string,
		exception?: FException | null,
	): string {
		const logEntryBase: Pick<FLoggerConsoleJsonLogEntry, 'name' | 'date' | 'level'> = {
			name: loggerName,
			date: new Date().toISOString(),
			level: level.toString(),
		};

		const labelsObj: Record<string, string> = {};
		for (const [labelName, labelValue] of Object.entries(labels)) {
			labelsObj[`label.${labelName}`] = labelValue;
		}

		const logEntry: FUtilUnReadonly<FLoggerConsoleJsonLogEntry> = {
			...logEntryBase,
			...labelsObj,
			message,
		};
		if (exception !== undefined && exception != null) {
			logEntry["exception.name"] = exception.name;
			logEntry["exception.message"] = exception.message;
			if (exception.stack !== undefined) {
				logEntry["exception.stack"] = exception.stack;
			}
		}

		const logMessage: string = JSON.stringify(logEntry);

		return logMessage;
	}

	protected log(level: FLoggerLevel, labels: FLoggerLabels, message: string, exception?: FException): void {
		const logMessage: string = FLoggerConsoleJsonImpl.formatLogMessage(
			this.name,
			level,
			labels,
			message,
			exception,
		);
		switch (level) {
			case FLoggerLevel.TRACE:
			case FLoggerLevel.DEBUG:
				console.debug(logMessage);
				break;
			case FLoggerLevel.INFO:
				console.log(logMessage);
				break;
			case FLoggerLevel.WARN:
			case FLoggerLevel.ERROR:
			case FLoggerLevel.FATAL:
				console.error(logMessage);
				break;
		}
	}
}
