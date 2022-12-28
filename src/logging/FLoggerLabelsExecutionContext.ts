import { FExecutionContext, FExecutionElement } from "../execution_context/FExecutionContext";
import { FExecutionContextBase } from "../execution_context/FExecutionContextBase"

import { FLoggerLabels } from "../logging/FLoggerLabels";


export class FLoggerLabelsExecutionContext extends FExecutionContextBase {
	private readonly _loggerProperties: FLoggerLabels;

	public static of(
		executionContext: FExecutionContext
	): FLoggerPropertiesExecutionElement | null {
		const loggerCtx: FLoggerLabelsExecutionContext | null = FExecutionContext.findExecutionContext(
			executionContext,
			FLoggerLabelsExecutionContext
		);

		if (loggerCtx === null) { return null; }

		const chain: Array<FLoggerLabelsExecutionContext> = [loggerCtx];
		const prevExecutionContext = loggerCtx.prevContext;
		if (prevExecutionContext != null) {
			chain.push(
				...FExecutionContext
					.listExecutionContexts(
						prevExecutionContext,
						FLoggerLabelsExecutionContext,
					)
			);
		}

		return new FLoggerPropertiesExecutionElement(loggerCtx, chain);
	}

	public get loggerProperties(): FLoggerLabels { return this._loggerProperties; }

	public constructor(
		prevContext: FExecutionContext, loggerProperties?: FLoggerLabels
	) {
		super(prevContext);
		this._loggerProperties = Object.freeze({ ...loggerProperties });
	}
}
export class FLoggerPropertiesExecutionElement<
	TExecutionContextLogger extends FLoggerLabelsExecutionContext = FLoggerLabelsExecutionContext>
	extends FExecutionElement<TExecutionContextLogger> {
	public readonly chain: Array<FLoggerLabelsExecutionContext>;

	public constructor(
		owner: TExecutionContextLogger,
		chain: Array<FLoggerLabelsExecutionContext>,
	) {
		super(owner);
		this.chain = chain;
	}

	public get loggerProperties(): FLoggerLabels {
		// using reduceRight to take priority for first property in chain.
		const dict = this.chain.reduceRight((p, c) => {
			Object.entries(c.loggerProperties).forEach(([name, value]) => {
				if (!p.has(name)) {
					p.set(name, value);
				}
			});
			return p;
		}, new Map<string, string>);
		return Object.freeze(Object.fromEntries(dict));
	}
}
