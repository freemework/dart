import { FLogger } from "./FLogger";
import { FLoggerBase } from "./FLoggerBase";

export abstract class FLoggerContainer extends FLoggerBase {
	protected readonly loggerName?: string;
	protected readonly parent?: FLogger;

	public constructor(opts?: { readonly loggerName?: string; readonly parent?: FLogger; }) {
		super();

		if (opts !== undefined) {
			this.loggerName = opts.loggerName;
			this.parent = opts.parent;
		}
	}

	public getInnerLogger(innerLoggerName: string): FLogger {
		const loggerName: string = this.loggerName != null
			? `${this.loggerName}.${innerLoggerName}`
			: innerLoggerName;
		return this.createInnerLogger(loggerName);
	}

	protected abstract createInnerLogger(innerLoggerName: string): FLogger;
}
