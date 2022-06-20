import { FCancellationToken } from "../cancellation/FCancellationToken";
import { FArgumentException } from "../FArgumentException";
import { FException } from "../FException";
import { FInvalidOperationException } from "../FInvalidOperationException";
import { FLogger } from "../FLogger";
import { FLoggerExt, FLoggerProperties, FLoggerProperty } from "../FLoggerExt";

export abstract class FExecutionContext {
	public abstract get prevContext(): FExecutionContext | null;
	public abstract get cancellationToken(): FCancellationToken;

	public getLogger(name?: string): FLogger {
		const prevContext = this.prevContext;
		if (prevContext !== null) {
			return prevContext.getLogger(name);
		} else {
			return new _FExecutionContextLoggerAdater(FLoggerExt.None, {});
		}
	}

	public withCancellationToken(cancellationToken: FCancellationToken): FExecutionContext {
		return new FCancellationExecutionContext(this, cancellationToken);
	}

	public withLogger(logger: FLoggerExt): FExecutionContext {
		return new FLoggerExecutionContext(this, logger);
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
		const loggerProperties: { -readonly [P in keyof FLoggerProperties]: FLoggerProperties[P]; } = {};
		loggerProperties[property.name] = property.value;
		return new FExecutionContextLoggerProperties(this, loggerProperties);
	}

	protected static ofTypeOrNull<T extends FExecutionContext>(context: FExecutionContext, clz: Function & { prototype: T; }): T | null {
		let chainItem: FExecutionContext | null = context;
		while (chainItem !== null) {
			if (chainItem instanceof clz) {
				return chainItem as T;
			}
			chainItem = chainItem.prevContext;
		}
		return null;
	}
	protected static ofType<T extends FExecutionContext>(context: FExecutionContext, clz: Function & { prototype: T; }): T {
		const chainItem: T | null = FExecutionContext.ofTypeOrNull(context, clz);
		if (chainItem !== null) {
			return chainItem;
		}
		throw new FInvalidOperationException(`Execution context '${clz.name}' is not presented on the chain.`);
	}
}

export abstract class FExecutionContextBase extends FExecutionContext {
	public get prevContext(): FExecutionContext | null { return this._prevContext; }
	public get cancellationToken(): FCancellationToken { return this._prevContext.cancellationToken; }

	public constructor(prevContext: FExecutionContext) {
		super();
		this._prevContext = prevContext;
	}

	protected readonly _prevContext: FExecutionContext;



	// public withLoggerProperty(property: FLoggerProperty): FExecutionContext;
	// public withLoggerProperty(propertyName: FLoggerProperty["name"], propertyValue: FLoggerProperty["value"]): FExecutionContext;
	// public withLoggerProperty(...args: Array<unknown>): FExecutionContext {
	// 	let property: FLoggerProperty;
	// 	if (args.length === 1) {
	// 		// Looks like overload: withLoggerProperty(property: LoggerProperty)
	// 		const propertyLike: any = args[0];

	// 		if (
	// 			propertyLike === null
	// 			|| !("name" in propertyLike)
	// 			|| !("value" in propertyLike)
	// 			|| typeof propertyLike.name !== "string"
	// 			|| !(typeof propertyLike.value === "string" || typeof propertyLike.value === "number" || typeof propertyLike.value === "boolean")
	// 		) {
	// 			throw new FArgumentException();
	// 		}

	// 		property = propertyLike;
	// 	} else if (args.length === 2) {
	// 		// Looks like overload: withLoggerProperty(propertyName: string, propertyValue: string)
	// 		const propertyName: unknown = args[0];
	// 		const propertyValue: unknown = args[1];

	// 		if (
	// 			typeof propertyName !== "string" ||
	// 			!(typeof propertyValue === "string" || typeof propertyValue === "number" || typeof propertyValue === "boolean")
	// 		) {
	// 			throw new FArgumentException();
	// 		}

	// 		property = Object.freeze({ name: propertyName, value: propertyValue });
	// 	} else {
	// 		throw new FArgumentException();
	// 	}
	// 	const loggerProperties: { -readonly [P in keyof FLoggerProperties]: FLoggerProperties[P]; } = {};
	// 	loggerProperties[property.name] = property.value;
	// 	return new FLoggerPropertiesExecutionContext(this, loggerProperties);
	// }

	// public getLogger(name?: string): FLoggerExt { return this._prevContext.getLogger(name); }

	// public withCancellationToken(cancellationToken: FCancellationToken): FExecutionContext {
	// 	return new FCancellationExecutionContext(this, cancellationToken);
	// }

	// public withLogger(logger: FLogger): FExecutionContext {
	// 	return new FLoggerExecutionContext(this, logger);
	// }

	// public withLoggerProperty(property: FLoggerProperty): FExecutionContext;
	// public withLoggerProperty(propertyName: FLoggerProperty["name"], propertyValue: FLoggerProperty["value"]): FExecutionContext;
	// public withLoggerProperty(...args: Array<unknown>): FExecutionContext {
	// 	let property: FLoggerProperty;
	// 	if (args.length === 1) {
	// 		// Looks like overload: withLoggerProperty(property: LoggerProperty)
	// 		const propertyLike: any = args[0];

	// 		if (
	// 			propertyLike === null
	// 			|| !("name" in propertyLike)
	// 			|| !("value" in propertyLike)
	// 			|| typeof propertyLike.name !== "string"
	// 			|| !(typeof propertyLike.value === "string" || typeof propertyLike.value === "number" || typeof propertyLike.value === "boolean")
	// 		) {
	// 			throw new FArgumentException();
	// 		}

	// 		property = propertyLike;
	// 	} else if (args.length === 2) {
	// 		// Looks like overload: withLoggerProperty(propertyName: string, propertyValue: string)
	// 		const propertyName: unknown = args[0];
	// 		const propertyValue: unknown = args[1];

	// 		if (
	// 			typeof propertyName !== "string" ||
	// 			!(typeof propertyValue === "string" || typeof propertyValue === "number" || typeof propertyValue === "boolean")
	// 		) {
	// 			throw new FArgumentException();
	// 		}

	// 		property = Object.freeze({ name: propertyName, value: propertyValue });
	// 	} else {
	// 		throw new FArgumentException();
	// 	}

	// 	const loggerProperties: { -readonly [P in keyof FLoggerProperties]: FLoggerProperties[P]; } = {};
	// 	loggerProperties[property.name] = property.value;
	// 	return new FLoggerPropertiesExecutionContext(this, loggerProperties);
	// }
}

class _FExecutionContextRoot extends FExecutionContext {
	public get prevContext(): FExecutionContext | null { return null; }
	public get cancellationToken(): FCancellationToken { return FCancellationToken.None; }
}

export namespace FExecutionContext {
	export const Empty: FExecutionContext = new _FExecutionContextRoot();
}

export class FExecutionElement<TExecutionContext extends FExecutionContext> {
	private readonly _owner: TExecutionContext;

	public constructor(owner: TExecutionContext) {
		this._owner = owner;
	}

	public get owner(): TExecutionContext { return this._owner; }
}

export class FCancellationExecutionContext extends FExecutionContextBase {
	private readonly _cancellationToken: FCancellationToken;

	public static of(context: FExecutionContext): FCancellationExecutionElement {
		const cancellationExecutionContext: FCancellationExecutionContext
			= FExecutionContextBase.ofType(context, FCancellationExecutionContext);
		return new FCancellationExecutionElement(cancellationExecutionContext);
	}

	public constructor(
		prevContext: FExecutionContext,
		cancellationToken: FCancellationToken
	) {
		super(prevContext);
		this._cancellationToken = cancellationToken;
	}

	public get cancellationToken(): FCancellationToken { return this._cancellationToken; }
}
export class FCancellationExecutionElement extends FExecutionElement<FCancellationExecutionContext> {
	public get cancellationToken(): FCancellationToken { return this.owner.cancellationToken; }
}

export class FLoggerExecutionContext extends FExecutionContextBase {
	private readonly _logger: FLoggerExt;

	public static of(context: FExecutionContext): FLoggerExecutionElement {
		const loggerCtx: FLoggerExecutionContext
			= FExecutionContext.ofType(context, FLoggerExecutionContext);

		let propertiesCtx: FExecutionContextLoggerProperties | null
			= FExecutionContext.ofTypeOrNull(context, FExecutionContextLoggerProperties);

		const loggerProperties: FLoggerProperties = propertiesCtx !== null
			? propertiesCtx.loggerProperties
			: {};

		return new FLoggerExecutionElement(loggerCtx, loggerProperties);
	}

	public constructor(
		prevContext: FExecutionContext,
		logger: FLoggerExt
	) {
		super(prevContext);
		this._logger = logger;
	}

	public get logger(): FLoggerExt { return this._logger; }
}
export class FLoggerExecutionElement extends FExecutionElement<FLoggerExecutionContext> implements FLogger {
	private readonly _loggerProperties: FLoggerProperties;

	public constructor(owner: FLoggerExecutionContext, loggerProperties: FLoggerProperties) {
		super(owner);
		this._loggerProperties = loggerProperties;
		;
	}

	public getLogger(name?: string): FLogger {
		const logger: FLoggerExt = name !== undefined ? this.owner.logger.getLogger(name) : this.owner.logger;
		return new _FExecutionContextLoggerAdater(logger, this._loggerProperties);
	}

	public get isTraceEnabled(): boolean { return this.owner.logger.isTraceEnabled; }
	public get isDebugEnabled(): boolean { return this.owner.logger.isDebugEnabled; }
	public get isInfoEnabled(): boolean { return this.owner.logger.isInfoEnabled; }
	public get isWarnEnabled(): boolean { return this.owner.logger.isWarnEnabled; }
	public get isErrorEnabled(): boolean { return this.owner.logger.isErrorEnabled; }
	public get isFatalEnabled(): boolean { return this.owner.logger.isFatalEnabled; }

	public trace(message: string, ex?: FException): void { this.owner.logger.trace(this._loggerProperties, message, ex); }
	public debug(message: string, ex?: FException): void { this.owner.logger.debug(this._loggerProperties, message, ex); }
	public info(message: string): void { this.owner.logger.info(this._loggerProperties, message); }
	public warn(message: string): void { this.owner.logger.warn(this._loggerProperties, message); }
	public error(message: string): void { this.owner.logger.error(this._loggerProperties, message); }
	public fatal(message: string): void { this.owner.logger.fatal(this._loggerProperties, message); }
}
class _FExecutionContextLoggerAdater implements FLogger {
	private readonly _logger: FLoggerExt;
	private readonly _loggerProperties: FLoggerProperties;

	public constructor(sublogger: FLoggerExt, loggerContext: FLoggerProperties) {
		this._logger = sublogger;
		this._loggerProperties = loggerContext;
	}

	public get isTraceEnabled(): boolean { return this._logger.isTraceEnabled; }
	public get isDebugEnabled(): boolean { return this._logger.isDebugEnabled; }
	public get isInfoEnabled(): boolean { return this._logger.isInfoEnabled; }
	public get isWarnEnabled(): boolean { return this._logger.isWarnEnabled; }
	public get isErrorEnabled(): boolean { return this._logger.isErrorEnabled; }
	public get isFatalEnabled(): boolean { return this._logger.isFatalEnabled; }

	public trace(message: string, ex?: FException): void { this._logger.trace(this._loggerProperties, message, ex); }
	public debug(message: string, ex?: FException): void { this._logger.debug(this._loggerProperties, message, ex); }
	public info(message: string): void { this._logger.info(this._loggerProperties, message); }
	public warn(message: string): void { this._logger.warn(this._loggerProperties, message); }
	public error(message: string): void { this._logger.error(this._loggerProperties, message); }
	public fatal(message: string): void { this._logger.fatal(this._loggerProperties, message); }

	public getLogger(name: string): FLogger {
		return new _FExecutionContextLoggerAdater(this._logger.getLogger(name), this._loggerProperties);
	}
}


export class FExecutionContextLoggerProperties extends FExecutionContextBase {
	private readonly _loggerProperties: FLoggerProperties;

	public static of(context: FExecutionContext): FExecutionContextLoggerProperties {
		return FExecutionContextBase.ofType(context, FExecutionContextLoggerProperties);
	}

	public constructor(
		prevContext: FExecutionContext,
		loggerProperties: FLoggerProperties
	) {
		super(prevContext);
		const prevFLoggerPropertiesExecutionContext = FExecutionContextBase
			.ofTypeOrNull(prevContext, FExecutionContextLoggerProperties);
		this._loggerProperties = Object.freeze(
			prevFLoggerPropertiesExecutionContext !== null
				? {
					...prevFLoggerPropertiesExecutionContext.loggerProperties,
					...loggerProperties
				}
				: {
					...loggerProperties
				}
		);
	}

	public get loggerProperties(): FLoggerProperties { return this._loggerProperties; }
}
