import { FArgumentException } from "./FArgumentException";
import { FCancellationToken } from "./FCancellationToken";
import { FException } from "./FException";
import { FExecutionContextLogger } from "./FExecutionContextLogger";
import { FLogger, FLoggerContext, FLoggerProperty } from "./FLogger";

export interface FExecutionContext {
	readonly prevContext: FExecutionContext | null;
	readonly cancellationToken: FCancellationToken;
	readonly loggerProperties: FLoggerContext;

	getLogger(name?: string): FExecutionContextLogger;

	withCancellationToken(cancellationToken: FCancellationToken): FExecutionContext;
	withLogger(logger: FLogger): FExecutionContext;
	withLoggerProperty(propertyName: FLoggerProperty["name"], propertyValue: FLoggerProperty["value"]): FExecutionContext;
	withLoggerProperty(property: FLoggerProperty): FExecutionContext;
}

class _FExecutionContextImpl implements FExecutionContext {
	private readonly _cancellationToken: FCancellationToken;
	private readonly _logger: FLogger;
	private readonly _loggerProperties: FLoggerContext;
	private readonly _prevContext: FExecutionContext | null;

	public constructor(
		cancellationToken: FCancellationToken,
		logger: FLogger,
		loggerProperties: FLoggerContext,
		prevContext?: FExecutionContext,
	) {
		this._cancellationToken = cancellationToken;
		this._logger = logger;
		this._loggerProperties = Object.freeze({ ...loggerProperties });
		this._prevContext = prevContext !== undefined ? prevContext : null;
	}

	public get prevContext(): FExecutionContext | null { return this._prevContext; }
	public get cancellationToken(): FCancellationToken { return this._cancellationToken; }
	public get loggerProperties(): FLoggerContext { return this._loggerProperties; }

	public getLogger(name?: string): FExecutionContextLogger {
		const logger: FLogger = name !== undefined ? this._logger.getLogger(name) : this._logger;
		return new _FExecutionContextLoggerAdater(logger, this._loggerProperties);
	}

	public withCancellationToken(cancellationToken: FCancellationToken): FExecutionContext {
		return new _FExecutionContextImpl(
			cancellationToken,
			this._logger,
			this.loggerProperties,
			this,
		);
	}

	public withLogger(logger: FLogger): FExecutionContext {
		return new _FExecutionContextImpl(
			this.cancellationToken,
			logger,
			this.loggerProperties,
			this,
		);
	}

	public withLoggerProperty(property: FLoggerProperty): FExecutionContext;
	public withLoggerProperty(propertyName: FLoggerProperty["name"], propertyValue: FLoggerProperty["value"]): FExecutionContext;
	public withLoggerProperty(...args: Array<unknown>): FExecutionContext {
		let property: FLoggerProperty;
		if (args.length === 1) {
			// Looks like overload: withLoggerProperty(property: LoggerProperty)
			const propertyLike: any = args[0];

			if (
				propertyLike === null
				|| !("name" in propertyLike)
				|| !("value" in propertyLike)
				|| typeof propertyLike.name !== "string"
				|| !(typeof propertyLike.value === "string" || typeof propertyLike.value === "number" || typeof propertyLike.value === "boolean")
			) {
				throw new FArgumentException();
			}

			property = propertyLike;
		} else if (args.length === 2) {
			// Looks like overload: withLoggerProperty(propertyName: string, propertyValue: string)
			const propertyName: unknown = args[0];
			const propertyValue: unknown = args[1];

			if (
				typeof propertyName !== "string" ||
				!(typeof propertyValue === "string" || typeof propertyValue === "number" || typeof propertyValue === "boolean")
			) {
				throw new FArgumentException();
			}

			property = Object.freeze({ name: propertyName, value: propertyValue });
		} else {
			throw new FArgumentException();
		}
		const loggerProperties = { ...this.loggerProperties };
		loggerProperties[property.name] = property.value;
		return new _FExecutionContextImpl(
			this.cancellationToken,
			this._logger,
			loggerProperties,
			this,
		);
	}
}

class _FExecutionContextLoggerAdater implements FExecutionContextLogger {
	private readonly _logger: FLogger;
	private readonly _loggerContext: FLoggerContext;

	public constructor(sublogger: FLogger, loggerContext: FLoggerContext) {
		this._logger = sublogger;
		this._loggerContext = loggerContext;
	}

	public get isTraceEnabled(): boolean { return this._logger.isTraceEnabled; }
	public get isDebugEnabled(): boolean { return this._logger.isDebugEnabled; }
	public get isInfoEnabled(): boolean { return this._logger.isInfoEnabled; }
	public get isWarnEnabled(): boolean { return this._logger.isWarnEnabled; }
	public get isErrorEnabled(): boolean { return this._logger.isErrorEnabled; }
	public get isFatalEnabled(): boolean { return this._logger.isFatalEnabled; }

	public trace(message: string, ex?: FException): void { this._logger.trace(this._loggerContext, message, ex); }
	public debug(message: string, ex?: FException): void { this._logger.debug(this._loggerContext, message, ex); }
	public info(message: string): void { this._logger.info(this._loggerContext, message); }
	public warn(message: string): void { this._logger.warn(this._loggerContext, message); }
	public error(message: string): void { this._logger.error(this._loggerContext, message); }
	public fatal(message: string): void { this._logger.fatal(this._loggerContext, message); }

	public getLogger(name: string): FExecutionContextLogger {
		return new _FExecutionContextLoggerAdater(this._logger.getLogger(name), this._loggerContext);
	}
}

export namespace FExecutionContext {
	export const Empty: FExecutionContext = new _FExecutionContextImpl(FCancellationToken.None, FLogger.None, {});
}
