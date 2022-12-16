import { FLoggerProperties } from "../logging/FLoggerProperties";
import { FExecutionContext, FExecutionContextBase, FExecutionElement } from "./FExecutionContext";


export class FExecutionContextLoggerProperties extends FExecutionContextBase {
	private readonly _loggerProperties: FLoggerProperties;

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

	public get loggerProperties(): FLoggerProperties { return this._loggerProperties; }

	public constructor(
		prevContext: FExecutionContext, loggerProperties?: FLoggerProperties
	) {
		super(prevContext);
		this._loggerProperties = Object.freeze({ ...loggerProperties });
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

	public get loggerProperties(): FLoggerProperties {
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
