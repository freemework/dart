import { FLoggerBase } from "./f_logger_base";
import { FLoggerLevel } from "./f_logger_level";

export abstract class FLoggerBaseWithLevel extends FLoggerBase {
	public static buildLoggerLevelsMap(level: FLoggerLevel | null): Map<FLoggerLevel, boolean> {
		const levels: Map<FLoggerLevel, boolean> = new Map();
		levels.set(FLoggerLevel.FATAL, level != null && level >= FLoggerLevel.FATAL);
		levels.set(FLoggerLevel.ERROR, level != null && level >= FLoggerLevel.ERROR);
		levels.set(FLoggerLevel.WARN, level != null && level >= FLoggerLevel.WARN);
		levels.set(FLoggerLevel.INFO, level != null && level >= FLoggerLevel.INFO);
		levels.set(FLoggerLevel.DEBUG, level != null && level >= FLoggerLevel.DEBUG);
		levels.set(FLoggerLevel.TRACE, level != null && level >= FLoggerLevel.TRACE);
		return levels;
	}

	public constructor(loggerName: string, level: FLoggerLevel) {
		super(loggerName);

		// eslint-disable-next-line func-names
		const specificLogLevel: FLoggerLevel | null = (function () {
			const logLevelEnvironmentKey = `LOG_LEVEL_${loggerName}`;
			if (logLevelEnvironmentKey in process.env) {
				const specificLogLevelStr = process.env[logLevelEnvironmentKey];
				if (specificLogLevelStr !== undefined) {
					try {
						return FLoggerLevel.parse(specificLogLevelStr.toUpperCase());
					} catch (e) {
						console.error(`Unable to parse a value of environment variable '${logLevelEnvironmentKey}'.`);
					}
				}
			}
			return null;
		})();

		this.levels = FLoggerBaseWithLevel.buildLoggerLevelsMap(
			specificLogLevel !== null
				? specificLogLevel
				: level,
		);
	}

	protected isLevelEnabled(level: FLoggerLevel): boolean {
		const isEnabled: boolean | undefined = this.levels.get(level);
		return isEnabled === true;
	}

	private readonly levels: Map<FLoggerLevel, boolean>;
}

