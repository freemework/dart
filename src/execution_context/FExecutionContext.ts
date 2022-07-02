import { FCancellationTokenAggregated } from "../cancellation";
import { FCancellationToken } from "../cancellation/FCancellationToken";
import { FArgumentException } from "../FArgumentException";
import { FInvalidOperationException } from "../FInvalidOperationException";
import { FLogger } from "../FLogger";

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
		throw new FInvalidOperationException(`Execution context '${clz.name}' is not presented on the chain.`);
	}
}

export abstract class FExecutionContextBase extends FExecutionContext {
	public get prevContext(): FExecutionContext | null { return this._prevContext; }

	public constructor(prevContext: FExecutionContext) {
		super();
		this._prevContext = prevContext;
	}

	protected readonly _prevContext: FExecutionContext;
}

class _FExecutionContextRoot extends FExecutionContext {
	public get prevContext(): FExecutionContext | null { return null; }
	// public get cancellationToken(): FCancellationToken { return FCancellationToken.None; }
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
export class FExecutionElementCancellation extends FExecutionElement<FExecutionContextCancellation> {
	public get cancellationToken(): FCancellationToken { return this.owner.cancellationToken; }
}

export class FExecutionContextLogger extends FExecutionContextBase {
	private readonly _logger: FLogger;

	public static of(context: FExecutionContext): FExecutionElementLogger {
		const loggerCtx: FExecutionContextLogger
			= FExecutionContext.getChainExecutionContext(context, FExecutionContextLogger);

		return new FExecutionElementLogger(loggerCtx);
	}

	public constructor(prevContext: FExecutionContext, logger: FLogger);
	public constructor(prevContext: FExecutionContext, loggerName: string);
	public constructor(prevContext: FExecutionContext, loggerName: string, loggerContext: FLogger.Context);
	public constructor(prevContext: FExecutionContext, loggerContext: FLogger.Context);
	constructor(
		prevContext: FExecutionContext,
		...args: Array<any>
	) {
		super(prevContext);
		const arg1 = args[0];
		if ((args.length === 1 || args.length === 2) && typeof arg1 === "string") {
			// public constructor(prevContext: FExecutionContext, loggerName: string);
			// public constructor(prevContext: FExecutionContext, loggerName: string, loggerContext: FLogger.Context);
			const loggerName: string = arg1;
			const loggerContext: FLogger.Context | null = args.length >= 2 ? args[1] : null;

			const loggerExCtx: FExecutionContextLogger = FExecutionContext
				.getChainExecutionContext(prevContext, FExecutionContextLogger);

			this._logger = loggerContext !== null
				? loggerExCtx.logger.getLogger(loggerName, loggerContext)
				: loggerExCtx.logger.getLogger(loggerName);
		} else if (args.length === 1 && typeof arg1["getLogger"] === "function") {
			// public constructor(prevContext: FExecutionContext, logger: FLogger);
			const logger: FLogger = arg1;

			this._logger = logger;
		} else if (args.length === 1) {
			// public constructor(prevContext: FExecutionContext, loggerContext: FLogger.Context);
			const loggerContext: FLogger.Context = arg1;

			const loggerExCtx: FExecutionContextLogger = FExecutionContext
				.getChainExecutionContext(prevContext, FExecutionContextLogger);

			this._logger = loggerExCtx.logger.getLogger(loggerContext);
		} else {
			throw new FArgumentException();
		}
	}

	public get logger(): FLogger { return this._logger; }
}
export class FExecutionElementLogger extends FExecutionElement<FExecutionContextLogger> {
	public get logger(): FLogger { return this.owner.logger; }
}
