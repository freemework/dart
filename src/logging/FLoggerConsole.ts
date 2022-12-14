import { FException } from "../exception/FException";

import { FLogger } from "./FLogger";
import { FLoggerContainer } from "./FLoggerContainer";
import { FLoggerLevel } from "./FLoggerLevel";
import { FLoggerProperty } from "./FLoggerProperty";

export class FLoggerConsole extends FLoggerContainer {
	public static readonly Default: FLoggerConsole = new FLoggerConsole();

	protected createInnerLogger(innerLoggerName: string): FLogger {
		return new FLoggerConsole(innerLoggerName, this);
	}

	protected isLevelEnabled(level: FLoggerLevel): boolean {
		return true;
	}

	protected log(
		level: string,
		loggerProperties: ReadonlyArray<FLoggerProperty>,
		message: string,
		exception?: FException
	): void {
		let logMessageBuffer = `${new Date().toISOString()} ${this.loggerName} [$level]`;
		for (const loggerProperty of loggerProperties) {
			logMessageBuffer += `(${loggerProperty.name}:${loggerProperty.value})`;
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
		super({ loggerName, parent });
	}
}
