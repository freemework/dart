import { FCancellationToken } from "../cancellation/FCancellationToken";

import { FExceptionInvalidOperation } from "../exception/FExceptionInvalidOperation";

export abstract class FExecutionContext {
	public abstract get prevContext(): FExecutionContext | null;

	/**
	 * Provide empty execution context. Usually used as root of execution context chain.
	 */
	public static get Empty(): FExecutionContext {
		return _EmptyExecutionContext.instance;
	}

	/**
	 * Provide default execution context.
	 *
	 * The execution context contains:
	 * * `FCancellationExecutionContext` with `FCancellationToken.Dummy`
	 */
	public static get Default(): FExecutionContext {
		return _DefaultExecutionContext.instance;
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

	protected static findAllExecutionContexts<T extends FExecutionContext>(
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
}
export class FExecutionElement<TExecutionContext extends FExecutionContext> {
	private readonly _owner: TExecutionContext;

	public constructor(owner: TExecutionContext) {
		this._owner = owner;
	}

	public get owner(): TExecutionContext { return this._owner; }
}

// Import here due to cyclic dependencies
import { FCancellationExecutionContext } from "../cancellation/FCancellationExecutionContext";

class _DefaultExecutionContext extends FExecutionContext {
	private static _instance: _DefaultExecutionContext | null = null;
	public static get instance(): _DefaultExecutionContext {
		if (_DefaultExecutionContext._instance === null) {
			_DefaultExecutionContext._instance = new _DefaultExecutionContext();
		}
		return _DefaultExecutionContext._instance;
	}

	private readonly _prevContext: FExecutionContext;

	public constructor() {
		super();

		this._prevContext = new FCancellationExecutionContext(
			_EmptyExecutionContext.instance,
			FCancellationToken.Dummy,
		);
	}

	public get prevContext(): FExecutionContext | null { return this._prevContext; }
}

class _EmptyExecutionContext extends FExecutionContext {
	private static _instance: _EmptyExecutionContext | null = null;
	public static get instance(): _EmptyExecutionContext {
		if (_EmptyExecutionContext._instance === null) {
			_EmptyExecutionContext._instance = new _EmptyExecutionContext();
		}
		return _EmptyExecutionContext._instance;
	}

	public get prevContext(): FExecutionContext | null { return null; }
}
