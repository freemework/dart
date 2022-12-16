import { FLogger } from "./FLogger";
import { FLoggerBase } from "./FLoggerBase";

export abstract class FLoggerContainer extends FLoggerBase {
	protected readonly parent: FLogger | null;
	private readonly _name: string;

	public get name(): string { return this._name; }

	public constructor(loggerName: string, parent?: FLogger) {
		super();

		this._name = loggerName;
		this.parent = parent !== undefined ? parent : null;
	}

	public getLogger(loggerName: string): FLogger {
		const childLoggerName: string = this._name !== null
			? `${this._name}.${loggerName}`
			: loggerName;
		return this.createChildLogger(childLoggerName);
	}

	protected abstract createChildLogger(childLoggerName: string): FLogger;
}
