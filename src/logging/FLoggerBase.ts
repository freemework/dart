import { FException } from "../exception/FException";

import { FExecutionContext } from "../execution_context/FExecutionContext";
import { FExecutionContextLoggerProperties } from "../execution_context/FExecutionContextLoggerProperties";

import { FLogger } from "./FLogger";
import { FLoggerLevel } from "./FLoggerLevel";
import { FLoggerProperty } from "./FLoggerProperty";

export abstract class FLoggerBase extends FLogger {
	public get isTraceEnabled(): boolean { return this.isLevelEnabled(FLoggerLevel.TRACE); }
	public get isDebugEnabled(): boolean { return this.isLevelEnabled(FLoggerLevel.DEBUG); }
	public get isInfoEnabled(): boolean { return this.isLevelEnabled(FLoggerLevel.INFO); }
	public get isWarnEnabled(): boolean { return this.isLevelEnabled(FLoggerLevel.WARN); }
	public get isErrorEnabled(): boolean { return this.isLevelEnabled(FLoggerLevel.ERROR); }
	public get isFatalEnabled(): boolean { return this.isLevelEnabled(FLoggerLevel.FATAL); }

	public trace(
		variant: FExecutionContext | ReadonlyArray<FLoggerProperty>,
		message: string,
		ex?: FException,
	): void {
		if (!this.isTraceEnabled) {
			return;
		}

		const loggerProperties: ReadonlyArray<FLoggerProperty> = this._getLoggerProperties(variant);

		this.log(FLoggerLevel.TRACE, loggerProperties, message, ex);
	}

	public debug(
		variant: FExecutionContext | ReadonlyArray<FLoggerProperty>,
		message: string,
		ex?: FException,
	): void {
		if (!this.isDebugEnabled) {
			return;
		}

		const loggerProperties: ReadonlyArray<FLoggerProperty> =
			this._getLoggerProperties(variant);
		this.log(FLoggerLevel.DEBUG, loggerProperties, message, ex);
	}

	public info(
		variant: FExecutionContext | ReadonlyArray<FLoggerProperty>,
		message: string,
	): void {
		if (!this.isInfoEnabled) {
			return;
		}

		const loggerProperties: ReadonlyArray<FLoggerProperty> =
			this._getLoggerProperties(variant);
		this.log(FLoggerLevel.INFO, loggerProperties, message);
	}

	public warn(
		variant: FExecutionContext | ReadonlyArray<FLoggerProperty>,
		message: string,
	): void {
		if (!this.isWarnEnabled) {
			return;
		}

		const loggerProperties: ReadonlyArray<FLoggerProperty> =
			this._getLoggerProperties(variant);
		this.log(FLoggerLevel.WARN, loggerProperties, message);
	}

	public error(
		variant: FExecutionContext | ReadonlyArray<FLoggerProperty>,
		message: string,
	): void {
		if (!this.isErrorEnabled) {
			return;
		}

		const loggerProperties: ReadonlyArray<FLoggerProperty> =
			this._getLoggerProperties(variant);
		this.log(FLoggerLevel.ERROR, loggerProperties, message);
	}

	public fatal(
		variant: FExecutionContext | ReadonlyArray<FLoggerProperty>,
		message: string,
	): void {
		if (!this.isFatalEnabled) {
			return;
		}

		const loggerProperties: ReadonlyArray<FLoggerProperty> =
			this._getLoggerProperties(variant);
		this.log(FLoggerLevel.FATAL, loggerProperties, message);
	}

	protected abstract isLevelEnabled(level: FLoggerLevel): boolean;

	///
	/// Override this method to implement custom logger
	///
	protected abstract log(
		level: FLoggerLevel,
		loggerProperties: ReadonlyArray<FLoggerProperty>,
		message: string,
		exception?: FException,
	): void;

	private _getLoggerProperties(
		variant: FExecutionContext | ReadonlyArray<FLoggerProperty>,
	): ReadonlyArray<FLoggerProperty> {
		const loggerProperties: ReadonlyArray<FLoggerProperty> = variant instanceof FExecutionContext
			? Object.freeze([
				...FExecutionContextLoggerProperties
					.of(variant)
					.loggerProperties
			])
			: variant;

		return loggerProperties;
	}
}
