import { FException } from "./FException";

export interface FExecutionContextLogger {
	readonly isTraceEnabled: boolean;
	readonly isDebugEnabled: boolean;
	readonly isInfoEnabled: boolean;
	readonly isWarnEnabled: boolean;
	readonly isErrorEnabled: boolean;
	readonly isFatalEnabled: boolean;

	trace(message: string, ex?: FException): void;
	debug(message: string, ex?: FException): void;
	info(message: string): void;
	warn(message: string): void;
	error(message: string): void;
	fatal(message: string): void;

	/**
	 * Get sub-logger that belong to this logger
	 * @param name Sub-logger name
	 */
	getLogger(name: string): FExecutionContextLogger;
}
