import { FExceptionInvalidOperation } from "../exception";
import { FExecutionContext } from "./FExecutionContext";

export abstract class FExecutionContextBase extends FExecutionContext {
	public get prevContext(): FExecutionContext | null { return this._prevContext; }

	public constructor(prevContext: FExecutionContext) {
		super();
		this._prevContext = prevContext;
	}

	public static get Empty(): FExecutionContext {
		throw new FExceptionInvalidOperation("Cannot use a member via inherit class. Use FExecutionContext.Empty instead.");
	}

	public static get Default(): FExecutionContext {
		throw new FExceptionInvalidOperation("Cannot use a member via inherit class. Use FExecutionContext.Default instead.");
	}

	protected static findExecutionContext<T extends FExecutionContext>(
		context: FExecutionContext, clz: Function & { prototype: T; }
	): T | null {
		throw new FExceptionInvalidOperation("Cannot use a member via inherit class. Use FExecutionContext.findExecutionContext instead.");
	}

	protected static getExecutionContext<T extends FExecutionContext>(context: FExecutionContext, clz: Function & { prototype: T; }): T {
		throw new FExceptionInvalidOperation("Cannot use a member via inherit class. Use FExecutionContext.getExecutionContext instead.");
	}

	protected static listExecutionContexts<T extends FExecutionContext>(
		context: FExecutionContext, clz: Function & { prototype: T; }
	): ReadonlyArray<T> {
		throw new FExceptionInvalidOperation("Cannot use a member via inherit class. Use FExecutionContext.listExecutionContexts instead.");
	}

	private readonly _prevContext: FExecutionContext;
}
