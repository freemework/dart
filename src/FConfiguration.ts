import { FDecimal } from "./primitive";

export interface FConfiguration {
	readonly configurationNamespace: string;
	readonly keys: ReadonlyArray<string>;
	getNamespace(configurationNamespace: string): FConfiguration;
	findNamespace(configurationNamespace: string): FConfiguration | null;
	hasNamespace(configurationNamespace: string): boolean;
	find(key: string): FConfiguration.Value | null;
	get(key: string, defaultData?: string): FConfiguration.Value;
	has(key: string): boolean;

	getIndexer(indexerName?: string): ReadonlyArray<FConfiguration>;
}
export namespace FConfiguration {
	export interface Value {
		/**
		 * Value source URI. It is `null` for default or missing data.
		 *
		 * For example:
		 * - configuration+file+properies://path/to/file.properies
		 * - configuration+file+ini://path/to/file.ini
		 * - configuration+file+json://path/to/file.json
		 * - configuration+file+toml://path/to/file.toml
		 * - configuration+file+yaml://path/to/file.yml
		 * - configuration+env
		 * - configuration+consul://my.consul.host:????
		 * - configuration+redis://my.redis.host:6379/1
		 */
		readonly source: URL | null;

		/**
		 * Reference to an override value in chain configuration.
		 */
		readonly override: Value | null;

		/**
		 * Key of current value (from root namespace)
		 */
		readonly key: string;

		// /**
		//  * Value original data.
		//  */
		// readonly data: string | null;

		readonly asBase64: Uint8Array;
		readonly asNullableBase64: Uint8Array | null;

		readonly asBoolean: boolean;
		readonly asNullableBoolean: boolean | null;

		readonly asString: string;
		readonly asNullableString: string | null;

		readonly asInteger: number;
		readonly asNullableInteger: number | null;

		readonly asPositiveInteger: number;
		readonly asNullablePositiveInteger: number | null;

		readonly asNegativeInteger: number;
		readonly asNullableNegativeInteger: number | null;

		readonly asNumber: number;
		readonly asNullableNumber: number | null;

		readonly asDecimal: FDecimal;
		readonly asNullableDecimal: FDecimal | null;

		readonly asIso8601Date: Date;
		readonly asNullableIso8601Date: Date | null;

		readonly asTimestampDate: Date;
		readonly asNullableTimestampDate: Date | null;

		readonly asURL: URL;
		readonly asNullableURL: URL | null;
	}
}
