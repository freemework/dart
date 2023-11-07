import { FException } from "../exception/f_exception";
import { FExceptionInvalidOperation } from "../exception/f_exception_invalid_operation";
import { FUtilUnreadonly } from "../util";

import { FLogger } from "./f_logger";
import { FLoggerBaseWithLevel } from "./f_logger_base_with_level";
import { FLoggerLabels } from "./f_logger_labels";
import { FLoggerLevel } from "./f_logger_level";

export abstract class FLoggerConsole extends FLoggerBaseWithLevel {
	/**
	 * Factory constructor
	 */
	public static create(loggerName: string, opts?: {
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

		if (exception != null) {
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

	// public constructor(loggerName: string, level: FLoggerLevel) {
	// 	super(loggerName, level);
	// }
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

		const logEntry: FUtilUnreadonly<FLoggerConsoleJsonLogEntry> = {
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
