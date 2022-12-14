import { FException } from "../exception/FException";
import { FExecutionContext } from "../execution_context/FExecutionContext";

let _consoleLogger: FLogger;
let _noneLogger: FLogger;

export abstract class FLogger {
	public static get Console(): FLogger { return _consoleLogger; }
	public static get None(): FLogger { return _noneLogger; }

	public abstract get isTraceEnabled(): boolean;
	public abstract get isDebugEnabled(): boolean;
	public abstract get isInfoEnabled(): boolean;
	public abstract get isWarnEnabled(): boolean;
	public abstract get isErrorEnabled(): boolean;
	public abstract get isFatalEnabled(): boolean;

	public abstract trace(
		executionContext: FExecutionContext,
		message: string,
		ex?: FException,
	): void;
	public abstract trace(
		loggerProperties: ReadonlyArray<FLoggerProperty>,
		message: string,
		ex?: FException,
	): void;

	public abstract debug(
		executionContext: FExecutionContext,
		message: string,
		ex?: FException,
	): void;
	public abstract debug(
		loggerProperties: ReadonlyArray<FLoggerProperty>,
		message: string,
		ex?: FException,
	): void;

	public abstract info(
		executionContext: FExecutionContext,
		message: string,
	): void;
	public abstract info(
		loggerProperties: ReadonlyArray<FLoggerProperty>,
		message: string,
	): void;

	public abstract warn(
		executionContext: FExecutionContext,
		message: string,
	): void;
	public abstract warn(
		loggerProperties: ReadonlyArray<FLoggerProperty>,
		message: string,
	): void;

	public abstract error(
		executionContext: FExecutionContext,
		message: string,
	): void;
	public abstract error(
		loggerProperties: ReadonlyArray<FLoggerProperty>,
		message: string,
	): void;

	public abstract fatal(
		executionContext: FExecutionContext,
		message: string,
	): void;
	public abstract fatal(
		loggerProperties: ReadonlyArray<FLoggerProperty>,
		message: string,
	): void;

	///
	/// Get inner that belong to this logger
	///
	public abstract getInnerLogger(innerLoggerName: string): FLogger;
}

class _NoneLogger extends FLogger {
	public get isTraceEnabled(): boolean { return false; }
	public get isDebugEnabled(): boolean { return false; }
	public get isInfoEnabled(): boolean { return false; }
	public get isWarnEnabled(): boolean { return false; }
	public get isErrorEnabled(): boolean { return false; }
	public get isFatalEnabled(): boolean { return false; }
	public trace(variant: FExecutionContext | ReadonlyArray<FLoggerProperty>, message: string, ex?: FException | undefined): void { }
	public debug(executionContext: FExecutionContext | ReadonlyArray<FLoggerProperty>, message: string, ex?: FException | undefined): void { }
	public info(executionContext: FExecutionContext | ReadonlyArray<FLoggerProperty>, message: string): void { }
	public warn(executionContext: FExecutionContext | ReadonlyArray<FLoggerProperty>, message: string): void { }
	public error(executionContext: FExecutionContext | ReadonlyArray<FLoggerProperty>, message: string): void { }
	public fatal(executionContext: FExecutionContext | ReadonlyArray<FLoggerProperty>, message: string): void { }
	public getInnerLogger(innerLoggerName: string): FLogger { return this; }
}
_noneLogger = new _NoneLogger();

import { FLoggerConsole } from './FLoggerConsole'; // Yes, here cyclic dependencies
import { FLoggerProperty } from "./FLoggerProperty";
_consoleLogger = FLoggerConsole.Default;
