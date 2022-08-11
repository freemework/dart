import { FExceptionArgument } from "../exception/FExceptionArgument";
import { FLogger } from "../FLogger";
import { FExecutionContext, FExecutionContextBase, FExecutionElement } from "./FExecutionContext";

export class FExecutionContextLogger extends FExecutionContextBase {
	private readonly _logger: FLogger;

	public static of(context: FExecutionContext): FExecutionElementLogger {
		const loggerCtx: FExecutionContextLogger
			= FExecutionContext.getChainExecutionContext(context, FExecutionContextLogger);

		return new FExecutionElementLogger(loggerCtx);
	}

	public constructor(prevContext: FExecutionContext, logger: FLogger);
	public constructor(prevContext: FExecutionContext, loggerName: string);
	public constructor(prevContext: FExecutionContext, loggerName: string, loggerContext: FLogger.Context);
	public constructor(prevContext: FExecutionContext, loggerContext: FLogger.Context);
	constructor(
		prevContext: FExecutionContext,
		...args: Array<any>
	) {
		super(prevContext);
		const arg1 = args[0];
		if ((args.length === 1 || args.length === 2) && typeof arg1 === "string") {
			// public constructor(prevContext: FExecutionContext, loggerName: string);
			// public constructor(prevContext: FExecutionContext, loggerName: string, loggerContext: FLogger.Context);
			const loggerName: string = arg1;
			const loggerContext: FLogger.Context | null = args.length >= 2 ? args[1] : null;

			const loggerExCtx: FExecutionContextLogger = FExecutionContext
				.getChainExecutionContext(prevContext, FExecutionContextLogger);

			this._logger = loggerContext !== null
				? loggerExCtx.logger.getLogger(loggerName, loggerContext)
				: loggerExCtx.logger.getLogger(loggerName);
		} else if (args.length === 1 && typeof arg1["getLogger"] === "function") {
			// public constructor(prevContext: FExecutionContext, logger: FLogger);
			const logger: FLogger = arg1;

			this._logger = logger;
		} else if (args.length === 1) {
			// public constructor(prevContext: FExecutionContext, loggerContext: FLogger.Context);
			const loggerContext: FLogger.Context = arg1;

			const loggerExCtx: FExecutionContextLogger = FExecutionContext
				.getChainExecutionContext(prevContext, FExecutionContextLogger);

			this._logger = loggerExCtx.logger.getLogger(loggerContext);
		} else {
			throw new FExceptionArgument();
		}
	}

	public get logger(): FLogger { return this._logger; }
}
export class FExecutionElementLogger<TFExecutionContextLogger
extends FExecutionContextLogger = FExecutionContextLogger>
extends FExecutionElement<TFExecutionContextLogger> {
	public get logger(): FLogger { return this.owner.logger; }
}
