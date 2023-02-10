import { FException } from "../exception/f_exception";
import { FExceptionArgument } from "../exception/f_exception_argument";
import { FExecutionContext } from "../execution_context/f_execution_context";

import { FLogger, FLoggerMessageFactory } from "./f_logger";
import { FLoggerLabels } from "./f_logger_labels";
import { FLoggerLabelsExecutionContext } from "./f_logger_labels_execution_context";
import { FLoggerLevel } from "./f_logger_level";

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
