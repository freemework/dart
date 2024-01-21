import { FCancellationToken } from "../cancellation/index.js";
import { FExceptionInvalidOperation } from "../exception/f_exception_invalid_operation.js";

export abstract class FExecutionContext {
	private static _defaultExecutionContext: FExecutionContext | null = null;

	public abstract get prevContext(): FExecutionContext | null;

	/**
	 * Provide empty execution context. Usually used as root of execution context chain.
	 */
	public static get Empty(): FExecutionContext {
		return emptyExecutionContext;
	}

	/**
	 * Provide default execution context.
	 */
	public static get Default(): FExecutionContext {
		if (FExecutionContext._defaultExecutionContext === null) {
			// throw new FExceptionInvalidOperation(`Default execution context was not set yet. Try to call ${FExecutionContext.name}.setDefaultExecutionContext() before.`);
			console.warn(`Default execution context was set to internal default value. We recommend you to call ${FExecutionContext.name}.setDefaultExecutionContext() with your application context.`);
			FExecutionContext._defaultExecutionContext = new FCancellationExecutionContext(
				emptyExecutionContext,
				FCancellationToken.Dummy,
			);
		}
		return FExecutionContext._defaultExecutionContext;
	}

	public static set Default(executionContext: FExecutionContext) {
		if (FExecutionContext._defaultExecutionContext !== null) {
			throw new FExceptionInvalidOperation("Unable to set FExecutionContext.Default twice. Please set this before first access FExecutionContext.Default property.");
		}
		FExecutionContext._defaultExecutionContext = executionContext;
	}

	/**
	 * Obtain a closest instance of typed `FExecutionContext` that encloses
	 * the given context.
	 *
	 * Returns `null` if requested type not found
	 */
	protected static findExecutionContext<T extends FExecutionContext>(
		context: FExecutionContext, clz: Function & { prototype: T; }
	): T | null {
		let chainItem: FExecutionContext | null = context;
		while (chainItem !== null) {
			if (chainItem instanceof clz) {
				return chainItem as T;
			}
			chainItem = chainItem.prevContext;
		}
		return null;
	}

	/**
	 * Obtain a closest instance of typed `FExecutionContext` that encloses
	 * the given context.
	 *
	 * Raise `FExceptionInvalidOperation` if requested type not found
	 */
	protected static getExecutionContext<T extends FExecutionContext>(context: FExecutionContext, clz: Function & { prototype: T; }): T {
		const chainItem: T | null = FExecutionContext.findExecutionContext(context, clz);
		if (chainItem !== null) {
			return chainItem;
		}
		throw new FExceptionInvalidOperation(`Execution context '${clz.name}' is not presented on the chain.`);
	}

	protected static listExecutionContexts<T extends FExecutionContext>(
		context: FExecutionContext, clz: Function & { prototype: T; }
	): ReadonlyArray<T> {
		const result: Array<T> = [];

		let chainItem: FExecutionContext | null = context;
		while (chainItem != null) {
			if (chainItem instanceof clz) {
				result.push(chainItem as T);
			}
			chainItem = chainItem.prevContext;
		}

		return Object.freeze(result);
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

	public static override get Empty(): FExecutionContext {
		throw new FExceptionInvalidOperation("Cannot use a member via inherit class. Use FExecutionContext.Empty instead.");
	}

	public static override get Default(): FExecutionContext {
		throw new FExceptionInvalidOperation("Cannot use a member via inherit class. Use FExecutionContext.Default instead.");
	}

	protected static override findExecutionContext<T extends FExecutionContext>(
		_: FExecutionContext, __: Function & { prototype: T; }
	): T | null {
		throw new FExceptionInvalidOperation("Cannot use a member via inherit class. Use FExecutionContext.findExecutionContext instead.");
	}

	protected static override getExecutionContext<T extends FExecutionContext>(_: FExecutionContext, __: Function & { prototype: T; }): T {
		throw new FExceptionInvalidOperation("Cannot use a member via inherit class. Use FExecutionContext.getExecutionContext instead.");
	}

	protected static override listExecutionContexts<T extends FExecutionContext>(
		_: FExecutionContext, __: Function & { prototype: T; }
	): ReadonlyArray<T> {
		throw new FExceptionInvalidOperation("Cannot use a member via inherit class. Use FExecutionContext.listExecutionContexts instead.");
	}

	private readonly _prevContext: FExecutionContext;
}

class _EmptyExecutionContext extends FExecutionContext {
	public get prevContext(): FExecutionContext | null { return null; }
}
const emptyExecutionContext: _EmptyExecutionContext = new _EmptyExecutionContext();

// Import here due to cyclic dependencies
import { FCancellationExecutionContext } from "../cancellation/f_cancellation_execution_context.js";
