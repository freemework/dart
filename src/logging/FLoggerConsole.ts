import { FException } from "../exception/FException";

import { FLogger } from "./FLogger";
import { FLoggerBase } from "./FLoggerBase";
import { FLoggerLevel } from "./FLoggerLevel";
import { FLoggerLabels } from "./FLoggerLabels";

export class FLoggerConsole extends FLoggerBase {
	public static readonly Default: FLoggerConsole = new FLoggerConsole();

	/**
	 * Factory constructor
	 */
	public static create(loggerName?: string): FLogger {
		return new FLoggerConsole(loggerName);
	}

	protected isLevelEnabled(level: FLoggerLevel): boolean {
		return true;
	}

	protected log(
		level: string,
		labels: FLoggerLabels,
		message: string,
		exception?: FException
	): void {
		let name: string | null = this.name;
		if(name === null) {
			name = "Unnamed";
		}
		let logMessageBuffer = `${new Date().toISOString()} ${name} [$level]`;
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
			case "TRACE":
			case "DEBUG":
				console.debug(logMessageBuffer);
				break;
			case "WARN":
			case "ERROR":
			case "FATAL":
				console.error(logMessageBuffer);
				break;
			default:
				console.log(logMessageBuffer);
				break;
		}

	}

	private constructor(loggerName?: string) {
		super(loggerName);
	}
}
