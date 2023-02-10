import { FException } from "../exception/f_exception";
import { FExceptionInvalidOperation } from "../exception/f_exception_invalid_operation";

import { FLogger } from "./f_logger";
import { FLoggerBase } from "./f_logger_base";
import { FLoggerLabels } from "./f_logger_labels";
import { FLoggerLevel } from "./f_logger_level";

export class FLoggerConsole extends FLoggerBase {
	/**
	 * Factory constructor
	 */
	public static create(loggerName?: string, level?: FLoggerLevel): FLogger {
		const levels: Map<FLoggerLevel, boolean> = new Map();
		levels.set(FLoggerLevel.FATAL, level != null && level >= FLoggerLevel.FATAL);
		levels.set(FLoggerLevel.ERROR, level != null && level >= FLoggerLevel.ERROR);
		levels.set(FLoggerLevel.WARN, level != null && level >= FLoggerLevel.WARN);
		levels.set(FLoggerLevel.INFO, level != null && level >= FLoggerLevel.INFO);
		levels.set(FLoggerLevel.DEBUG, level != null && level >= FLoggerLevel.DEBUG);
		levels.set(FLoggerLevel.TRACE, level != null && level >= FLoggerLevel.TRACE);

		return new FLoggerConsole(loggerName, levels);
	}

	protected isLevelEnabled(level: FLoggerLevel): boolean {
		const isEnabled: boolean | undefined = this._levels.get(level);
		return isEnabled === true;
	}

	protected log(
		level: FLoggerLevel,
		labels: FLoggerLabels,
		message: string,
		exception?: FException
	): void {
		let name: string | null = this.name;
		if (name === null) {
			name = "Unnamed";
		}
		let logMessageBuffer = `${new Date().toISOString()} ${name} [${level}]`;
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

	private readonly _levels: Map<FLoggerLevel, boolean>;
	private constructor(loggerName: string | undefined, levels: Map<FLoggerLevel, boolean>) {
		super(loggerName);
		this._levels = levels;
	}
}
