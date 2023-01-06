import { FException } from "../exception";
import { FExecutionContext } from "../execution_context";
import { FLogger } from "./FLogger";
import { FLoggerBase } from "./FLoggerBase";
import { FLoggerLabels } from "./FLoggerLabels";
import { FLoggerLevel } from "./FLoggerLevel";

export class FLoggerDummy extends FLoggerBase {
	private static _instance: FLoggerDummy | null = null;

	/**
	 * Factory constructor
	 */
	public static create(loggerName?: string): FLogger {

		// Lazy singleton

		if (FLoggerDummy._instance === null) {
			FLoggerDummy._instance = new FLoggerDummy();
		}

		return FLoggerDummy._instance;
	}

	protected isLevelEnabled(level: FLoggerLevel): boolean { return false; }
	protected log(level: FLoggerLevel, loggerLabels: FLoggerLabels, message: string, exception?: FException): void { }

	private constructor() { super(); }
}
