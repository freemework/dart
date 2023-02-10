import { FException } from "../exception/f_exception";

import { FLogger } from "./f_logger";
import { FLoggerBase } from "./f_logger_base";
import { FLoggerLabels } from "./f_logger_labels";
import { FLoggerLevel } from "./f_logger_level";

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
