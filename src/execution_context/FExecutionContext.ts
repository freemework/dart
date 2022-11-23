import { FCancellationToken } from "../cancellation/FCancellationToken";
import { FCancellationTokenAggregated } from "../cancellation/FCancellationTokenAggregated";
import { FExceptionArgument } from "../exception/FExceptionArgument";
import { FExceptionInvalidOperation } from "../exception/FExceptionInvalidOperation";
import { FLoggerLegacy } from "../FLoggerLegacy";

export abstract class FExecutionContext {
	public abstract get prevContext(): FExecutionContext | null;

	protected static findChainExecutionContext<T extends FExecutionContext>(context: FExecutionContext, clz: Function & { prototype: T; }): T | null {
		let chainItem: FExecutionContext | null = context;
		while (chainItem !== null) {
			if (chainItem instanceof clz) {
				return chainItem as T;
			}
			chainItem = chainItem.prevContext;
		}
		return null;
	}
	protected static getChainExecutionContext<T extends FExecutionContext>(context: FExecutionContext, clz: Function & { prototype: T; }): T {
		const chainItem: T | null = FExecutionContext.findChainExecutionContext(context, clz);
		if (chainItem !== null) {
			return chainItem;
		}
		throw new FExceptionInvalidOperation(`Execution context '${clz.name}' is not presented on the chain.`);
	}
}
export class FExecutionElement<TExecutionContext extends FExecutionContext> {
	private readonly _owner: TExecutionContext;

	public constructor(owner: TExecutionContext) {
		this._owner = owner;
	}

	public get owner(): TExecutionContext { return this._owner; }
}

export abstract class FExecutionContextBase extends FExecutionContext {
	public get prevContext(): FExecutionContext | null { return this._prevContext; }

	public constructor(prevContext: FExecutionContext) {
		super();
		this._prevContext = prevContext;
	}

	protected readonly _prevContext: FExecutionContext;
}

export class FExecutionContextCancellation extends FExecutionContextBase {
	private readonly _cancellationToken: FCancellationToken;

	public static of(context: FExecutionContext): FExecutionElementCancellation {
		const cancellationExecutionContext: FExecutionContextCancellation
			= FExecutionContextBase.getChainExecutionContext(context, FExecutionContextCancellation);

		return new FExecutionElementCancellation(cancellationExecutionContext);
	}

	public constructor(
		prevContext: FExecutionContext,
		cancellationToken: FCancellationToken,
		isAggregateWithPrev: boolean = false
	) {
		super(prevContext);

		if (isAggregateWithPrev) {
			const prev: FExecutionContextCancellation | null = FExecutionContext
				.findChainExecutionContext(prevContext, FExecutionContextCancellation);
			if (prev !== null) {
				this._cancellationToken = new FCancellationTokenAggregated(cancellationToken, prev.cancellationToken);
				return;
			}
		}

		this._cancellationToken = cancellationToken;
	}

	public get cancellationToken(): FCancellationToken { return this._cancellationToken; }
}
export class FExecutionElementCancellation<TFExecutionContextCancellation
	extends FExecutionContextCancellation = FExecutionContextCancellation>
	extends FExecutionElement<TFExecutionContextCancellation> {
	public get cancellationToken(): FCancellationToken { return this.owner.cancellationToken; }
}

export class FExecutionContextLoggerLegacy extends FExecutionContextBase {
	private readonly _logger: FLoggerLegacy;

	public static of(context: FExecutionContext): FExecutionElementLoggerLegacy {
		const loggerCtx: FExecutionContextLoggerLegacy
			= FExecutionContext.getChainExecutionContext(context, FExecutionContextLoggerLegacy);

		return new FExecutionElementLoggerLegacy(loggerCtx);
	}

	public constructor(prevContext: FExecutionContext, logger: FLoggerLegacy);
	public constructor(prevContext: FExecutionContext, loggerName: string);
	public constructor(prevContext: FExecutionContext, loggerName: string, loggerContext: FLoggerLegacy.Context);
	public constructor(prevContext: FExecutionContext, loggerContext: FLoggerLegacy.Context);
	constructor(
		prevContext: FExecutionContext,
		...args: Array<any>
	) {
		super(prevContext);
		const arg1 = args[0];
		if ((args.length === 1 || args.length === 2) && typeof arg1 === "string") {
			// public constructor(prevContext: FExecutionContext, loggerName: string);
			// public constructor(prevContext: FExecutionContext, loggerName: string, loggerContext: FLoggerLegacy.Context);
			const loggerName: string = arg1;
			const loggerContext: FLoggerLegacy.Context | null = args.length >= 2 ? args[1] : null;

			const loggerExCtx: FExecutionContextLoggerLegacy = FExecutionContext
				.getChainExecutionContext(prevContext, FExecutionContextLoggerLegacy);

			this._logger = loggerContext !== null
				? loggerExCtx.logger.getLogger(loggerName, loggerContext)
				: loggerExCtx.logger.getLogger(loggerName);
		} else if (args.length === 1 && typeof arg1["getLogger"] === "function") {
			// public constructor(prevContext: FExecutionContext, logger: FLoggerLegacy);
			const logger: FLoggerLegacy = arg1;

			this._logger = logger;
		} else if (args.length === 1) {
			// public constructor(prevContext: FExecutionContext, loggerContext: FLoggerLegacy.Context);
			const loggerContext: FLoggerLegacy.Context = arg1;

			const loggerExCtx: FExecutionContextLoggerLegacy = FExecutionContext
				.getChainExecutionContext(prevContext, FExecutionContextLoggerLegacy);

			this._logger = loggerExCtx.logger.getLogger(loggerContext);
		} else {
			throw new FExceptionArgument();
		}
	}

	public get logger(): FLoggerLegacy { return this._logger; }
}
export class FExecutionElementLoggerLegacy<TFExecutionContextLoggerLegacy
	extends FExecutionContextLoggerLegacy = FExecutionContextLoggerLegacy>
	extends FExecutionElement<TFExecutionContextLoggerLegacy> {
	public get logger(): FLoggerLegacy { return this.owner.logger; }
}


class _FExecutionContextRoot extends FExecutionContext {
	public get prevContext(): FExecutionContext | null { return null; }
}
export namespace FExecutionContext {
	/**
	 * Provide empty execution context. Usually used as root of execution context chain.
	 */
	export const Empty: FExecutionContext = new _FExecutionContextRoot();
}


class _FExecutionContextNone extends FExecutionContextBase {
	public constructor() {
		super(
			new FExecutionContextCancellation(
				new FExecutionContextLoggerLegacy(
					FExecutionContext.Empty,
					FLoggerLegacy.None
				),
				FCancellationToken.None
			)
		);
	}
}
export namespace FExecutionContext {
	/**
	 * Provide execution context with:
	 * * None(Dummy) logger
	 * * None(Dummy) cancelletion token
	 */
	export const None: FExecutionContext = new _FExecutionContextNone();
}

