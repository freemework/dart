import { FExceptionArgument } from "../exception/f_exception_argument.js";

const _trace = "TRACE";
const _debug = "DEBUG";
const _info = "INFO";
const _warn = "WARN";
const _error = "ERROR";
const _fatal = "FATAL";

export class FLoggerLevel extends Object {
	static readonly TRACE: FLoggerLevel = new FLoggerLevel(_trace, 6);
	static readonly DEBUG: FLoggerLevel = new FLoggerLevel(_debug, 5);
	static readonly INFO: FLoggerLevel = new FLoggerLevel(_info, 4);
	static readonly WARN: FLoggerLevel = new FLoggerLevel(_warn, 3);
	static readonly ERROR: FLoggerLevel = new FLoggerLevel(_error, 2);
	static readonly FATAL: FLoggerLevel = new FLoggerLevel(_fatal, 1);

	static parse(value: string): FLoggerLevel {
		switch (value) {
			case _trace:
				return FLoggerLevel.TRACE;
			case _debug:
				return FLoggerLevel.DEBUG;
			case _info:
				return FLoggerLevel.INFO;
			case _warn:
				return FLoggerLevel.WARN;
			case _error:
				return FLoggerLevel.ERROR;
			case _fatal:
				return FLoggerLevel.FATAL;
			default:
				throw new FExceptionArgument(`Cannot parse '${value}' as '${FLoggerLevel.name}'`);
		}
	}

	public override valueOf(): number {
		return this._intValue;
	}

	// bool operator > (FLoggerLevel other) => this._intValue > other._intValue;
	// bool operator >= (FLoggerLevel other) => this._intValue >= other._intValue;
	// bool operator < (FLoggerLevel other) => this._intValue < other._intValue;
	// bool operator <= (FLoggerLevel other) => this._intValue <= other._intValue;

	public override toString(): string {
		return this._textValue;
	}

	private constructor(
		private readonly _textValue: string,
		private readonly _intValue: number
	) {
		super();
	}
}



// export const enum FLoggerLevel {
// 	TRACE = "TRACE",
// 	DEBUG = "DEBUG",
// 	INFO = "INFO",
// 	WARN = "WARN",
// 	ERROR = "ERROR",
// 	FATAL = "FATAL"
// }
