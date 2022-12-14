import { FCancellationToken } from "../cancellation/FCancellationToken";

import { FExceptionInvalidOperation } from "../exception/FExceptionInvalidOperation";

let _EmptyExecutionContextInstance: FExecutionContext;
let _DefaultExecutionContextInstance: FExecutionContext;

export abstract class FExecutionContext {
	public abstract get prevContext(): FExecutionContext | null;

	/**
	 * Provide empty execution context. Usually used as root of execution context chain.
	 */
	public static get Empty(): FExecutionContext { return _EmptyExecutionContextInstance; }

	/**
	 * Provide default execution context.
	 *
	 * The execution context contains:
	 * * `FExecutionContextCancellation` with `FCancellationToken.Dummy`
	 * * `FExecutionContextLoggerProperties` with empty list of logger properties
	 */
	public static get Default(): FExecutionContext { return _DefaultExecutionContextInstance; }

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

export abstract class FExecutionContextBase extends FExecutionContext {
	public get prevContext(): FExecutionContext | null { return this._prevContext; }

	public constructor(prevContext: FExecutionContext) {
		super();
		this._prevContext = prevContext;
	}

	private readonly _prevContext: FExecutionContext;
}

// Here cyclic dependencies
import { FExecutionContextCancellation } from "./FExecutionContextCancellation";
import { FExecutionContextLoggerProperties } from "./FExecutionContextLoggerProperties";


class _DefaultExecutionContext extends FExecutionContext {
	private readonly _prevContext: FExecutionContext;

	public constructor() {
		super();

		this._prevContext = new FExecutionContextCancellation(
			new FExecutionContextLoggerProperties(
				_EmptyExecutionContextInstance // empty list of logger properties
			),
			FCancellationToken.Dummy,
		);
	}

	public get prevContext(): FExecutionContext | null { return this._prevContext; }
}
_DefaultExecutionContextInstance = new _DefaultExecutionContext();

class _EmptyExecutionContext extends FExecutionContext {
	public get prevContext(): FExecutionContext | null { return null; }
}
_EmptyExecutionContextInstance = new _EmptyExecutionContext();
