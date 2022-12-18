import { FExecutionContext } from "./FExecutionContext";

export abstract class FExecutionContextBase extends FExecutionContext {
	public get prevContext(): FExecutionContext | null { return this._prevContext; }

	public constructor(prevContext: FExecutionContext) {
		super();
		this._prevContext = prevContext;
	}

	private readonly _prevContext: FExecutionContext;
}
