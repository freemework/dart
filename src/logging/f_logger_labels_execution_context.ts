import { FExecutionContext, FExecutionElement, FExecutionContextBase } from "../execution_context/f_execution_context";

import { FLoggerLabels } from "../logging/f_logger_labels";


export class FLoggerLabelsExecutionContext extends FExecutionContextBase {
	private readonly _loggerLabels: FLoggerLabels;

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

	public get loggerLabels(): FLoggerLabels { return this._loggerLabels; }

	public constructor(
		prevContext: FExecutionContext, loggerLabels?: FLoggerLabels
	) {
		super(prevContext);
		this._loggerLabels = Object.freeze({ ...loggerLabels });
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

	public get loggerLabels(): FLoggerLabels {
		// using reduceRight to take priority for first property in chain.
		const dict = this.chain.reduceRight((p, c) => {
			Object.entries(c.loggerLabels).forEach(([name, value]) => {
				if (!p.has(name)) {
					p.set(name, value);
				}
			});
			return p;
		}, new Map<string, string>);
		return Object.freeze(Object.fromEntries(dict));
	}
}
