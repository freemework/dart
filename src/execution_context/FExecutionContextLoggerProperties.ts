import { FLoggerProperty } from "../logging/FLoggerProperty";
import { FExecutionContext, FExecutionContextBase, FExecutionElement } from "./FExecutionContext";


export class FExecutionContextLoggerProperties extends FExecutionContextBase {
	private readonly _loggerProperties: ReadonlyArray<FLoggerProperty>;

	public static of(
		executionContext: FExecutionContext
	): FExecutionElementLoggerProperties {
		const loggerCtx: FExecutionContextLoggerProperties = FExecutionContext.getExecutionContext(
			executionContext,
			FExecutionContextLoggerProperties
		);

		const chain: Array<FExecutionContextLoggerProperties> = [loggerCtx];
		const prevExecutionContext = loggerCtx.prevContext;
		if (prevExecutionContext != null) {
			chain.push(
				...FExecutionContext
					.findAllExecutionContexts(
						prevExecutionContext,
						FExecutionContextLoggerProperties,
					)
			);
		}

		return new FExecutionElementLoggerProperties(loggerCtx, chain);
	}

	public get loggerProperties(): ReadonlyArray<FLoggerProperty> { return this._loggerProperties; }

	public constructor(
		prevContext: FExecutionContext, ...loggerProperties: Array<FLoggerProperty>
	) {
		super(prevContext);
		this._loggerProperties = Object.freeze([...loggerProperties]);
	}
}
export class FExecutionElementLoggerProperties<
	TExecutionContextLogger extends FExecutionContextLoggerProperties = FExecutionContextLoggerProperties>
	extends FExecutionElement<TExecutionContextLogger> {
	public readonly chain: Array<FExecutionContextLoggerProperties>;

	public constructor(
		owner: TExecutionContextLogger,
		chain: Array<FExecutionContextLoggerProperties>,
	) {
		super(owner);
		this.chain = chain;
	}

	public get loggerProperties(): ReadonlyArray<FLoggerProperty> {
		const dict = this.chain.reduce((p, c) => {
			c.loggerProperties.forEach(lp => {
				if (!p.has(lp.name)) {
					p.set(lp.name, lp);
				}
			});
			return p;
		}, new Map<string, FLoggerProperty>);
		return Object.freeze([...dict.values()]);
	}
}
