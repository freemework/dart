import { FException } from "../exception/FException";

import { FLogger } from "./FLogger";
import { FLoggerContainer } from "./FLoggerContainer";
import { FLoggerLevel } from "./FLoggerLevel";
import { FLoggerProperties } from "./FLoggerProperties";

export class FLoggerConsole extends FLoggerContainer {
	public static readonly Default: FLoggerConsole = new FLoggerConsole();

	protected createChildLogger(childLoggerName: string): FLogger {
		return new FLoggerConsole(childLoggerName, this);
	}

	protected isLevelEnabled(level: FLoggerLevel): boolean {
		return true;
	}

	protected log(
		level: string,
		loggerProperties: FLoggerProperties,
		message: string,
		exception?: FException
	): void {
		let logMessageBuffer = `${new Date().toISOString()} ${this.name} [$level]`;
		for (const [name, value] of Object.entries(loggerProperties)) {
			logMessageBuffer += `(${name}:${value})`;
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

	private constructor(loggerName?: string, parent?: FLogger) {
		super(loggerName !== undefined ? loggerName : "Console", parent);
	}
}
