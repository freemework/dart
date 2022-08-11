import { FCancellationTokenAggregated } from "../cancellation";
import { FCancellationToken } from "../cancellation/FCancellationToken";
import { FExceptionArgument, FExceptionInvalidOperation } from "../exception";
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
		throw new FExceptionInvalidOperation(`Execution context '${clz.name}' is not presented on the chain.`);
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

