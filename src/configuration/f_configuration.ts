import { FExceptionArgument } from "../exception";
import { FUtilUnreadonly } from "../util";

import { FConfigurationValue } from "./f_configuration_value";


/**
 * The `FConfiguration` provides contract to access key-value configuration sources
 */
export abstract class FConfiguration {
	/**
	 * Construct configuration from json object
	 *
	 * Complex json object expands into plain dictionary of key-values.
	 *
	 * @example
	 * ```js
	 * const config: FConfiguration = FConfiguration.factoryJson({ a: { b: { c: 42 } } });
	 * assert.equal(config.get("a.b.c").asInteger, 42);
	 * ```
	 *
	 * @example
	 * ```js
	 * const config: FConfiguration = FConfiguration.factoryJson({ a: { b: [ { c: 40 }, { c: 41 }, { c: 42 } ] } });
	 *
	 * assert.equal(config.get("a.b.0.c").asString, "40");
	 * assert.equal(config.get("a.b.1.c").asString, "41");
	 * assert.equal(config.get("a.b.2.c").asString, "42");
	 *
	 * const array: ReadonlyArray<FConfiguration> = config.getArray("a.b");
	 * assert.equal(array.length, 3);
	 * assert.equal(array[0].get("c").asInteger, 40);
	 * assert.equal(array[1].get("c").asInteger, 41);
	 * assert.equal(array[2].get("c").asInteger, 42);
	 * ```
	 */
	public static factoryJson(jsonObject: any, indexFieldName: string = FConfiguration.DEFAULT_INDEX_KEY): FConfiguration {

		/**
		 * Expand json to key-value dict
		 *
		 * @example
		 * ```js
		 * const jsonObject = {"a":{"b":{"c":"42"}}};
		 * const targetDict: { [key: string]: boolean | number | string; } = {};
		 * expandJson(jsonObject, targetDict);
		 * console.log(JSON.stringify(targetDict)); // {"a.b.c":"42"}
		 * ```
		 */
		function expandJson(jsonObject: any, targetDict: { [key: string]: boolean | number | string; }, parentName?: string): void {
			for (let [name, value] of Object.entries(jsonObject)) {

				if (Array.isArray(jsonObject)) {
					if (typeof value === "object" && value !== null && indexFieldName in value) {
						const { [indexFieldName]: index, ...rest } = value as any;
						if (typeof index !== "string") {
							const itemKeyName: string = parentName !== undefined ? `${parentName}.${name}` : name;
							throw new FExceptionArgument(`Unreadable data. Unsupported index '${index}' for value of key '${itemKeyName}'. Expected index type of string.`, "jsonObject");
						} else {
							name = index;
							value = rest;
						}
					}
				}

				const fullKeyName: string = parentName !== undefined ? `${parentName}.${name}` : name;

				switch (typeof value) {
					case "boolean":
					case "number":
					case "string":
						targetDict[fullKeyName] = value;
						break;
					case "object":
						// it is applicable for arrays too, due to Array.prototype.keys() returns indexes.
						expandJson(value, targetDict, fullKeyName);
						break;
					default:
						throw new FExceptionArgument(`Unreadable data. Unsupported type for value of key '${fullKeyName}'`, "jsonObject");
				}
			}
		}

		const jsonDict: { [key: string]: boolean | number | string; } = {};
		expandJson(jsonObject, jsonDict);

		const dict: FUtilUnreadonly<FConfigurationDictionary.Data> = {};
		for (const [name, value] of Object.entries(jsonDict)) {
			if (typeof value === "string") {
				dict[name] = value === "" ? null : value;
			} else if (value === null) {
				dict[name] = null;
			} else {
				dict[name] = value.toString();
			}
		}

		const encodedJson: string = encodeURIComponent(JSON.stringify(jsonObject));
		const sourceURI: string = `configuration:json?data=${encodedJson}`;

		return new FConfigurationDictionary(
			new URL(sourceURI),
			Object.freeze(dict)
		);
	}


	protected static readonly DEFAULT_INDEXES_KEY: string = "indexes";
	protected static readonly DEFAULT_INDEX_KEY: string = "index";

	/**
	 * Gets configuration source URI.
	 *
	 * @remarks This value mostly need to debug purposes to understand source of a value.
	 *
	 * @see https://docs.freemework.org/configuration/FConfiguration#sourceURI?lang=typescript
	 *
	 * Each configuration source should represents an URI.
	 * For example:
	 * - configuration+file+properies:///path/to/file.properies
	 * - configuration+file+ini:///path/to/file.ini
	 * - configuration+file+json:///path/to/file.json
	 * - configuration+file+toml:///path/to/file.toml
	 * - configuration+file+yaml:///path/to/file.yml
	 * - configuration+consul://my.consul.host:????
	 * - configuration+redis://my.redis.host:6379/1
	 * - configuration+directory+keyperfile:///run/secrets
	 * - configuration:json?data=%7B%22a%22%3A42%7D
	 * - configuration:properies?data=...
	 * - configuration:toml?data=...
	 * - configuration:chain?sources=configuration:env,configuration%3Ajson%3Fdata%3D...,...
	 * - configuration:env
	 * - etc.
	 */
	public abstract get sourceURI(): URL;

	/**
	 * Gets configuration namespace
	 *
	 * @example
	 * ```js
	 * const appCfg = FConfiguration.factoryJson({
	 * 	"runtime.server.ONE.listenAddress": "localhost",
	 * 	"runtime.server.ONE.listenPort": "8081",
	 * 	"runtime.server.TWO.listenAddress": "localhost",
	 * 	"runtime.server.TWO.listenPort": "8082",
	 * });
	 *
	 * console.log(appCfg.configurationNamespace); // null
	 *
	 * const runtimeCfg = appCfg.getNamespace("runtime");
	 * console.log(runtimeCfg.configurationNamespace); // "runtime"
	 *
	 * const serverTwoCfg = runtimeCfg.getNamespace("server.TWO");
	 * console.log(serverTwoCfg.configurationNamespace); // "runtime.server.TWO"
	 * ```
	 */
	public abstract get configurationNamespace(): string | null;

	/**
	 * Gets list of keys available in current configuration
	 *
	 * @example
	 * ```js
	 * const appCfg = FConfiguration.factoryJson({
	 * 	"runtime.server.ONE.listenAddress": "localhost",
	 * 	"runtime.server.ONE.listenPort": "8081",
	 * 	"runtime.server.TWO.listenAddress": "localhost",
	 * 	"runtime.server.TWO.listenPort": "8082",
	 * });
	 *
	 * console.log(appCfg.keys); // ["runtime.server.ONE.listenAddress", "runtime.server.ONE.listenPort", "runtime.server.TWO.listenAddress", "runtime.server.TWO.listenPort"]
	 *
	 * const runtimeCfg = appCfg.getNamespace("runtime");
	 * console.log(runtimeCfg.keys); // ["server.ONE.listenAddress", "server.ONE.listenPort", "server.TWO.listenAddress", "server.TWO.listenPort"]
	 *
	 * const serverTwoCfg = appCfg.getNamespace("runtime.server.TWO");
	 * console.log(serverTwoCfg.keys); // ["listenAddress","listenPort"]
	 * ```
	 */
	public abstract get keys(): ReadonlyArray<string>;


	/**
	 * Obtain array of sub-configurations
	 *
	 * @param key Name of array key
	 * @param indexesName Name of indexes key. Default: "indexes".
	 *
	 * @example
	 * ```js
	 * const appCfg = FConfiguration.factoryJson({
	 * 	"runtime.server.ONE.listenAddress": "localhost",
	 * 	"runtime.server.ONE.listenPort": "8081",
	 * 	"runtime.server.TWO.listenAddress": "localhost",
	 * 	"runtime.server.TWO.listenPort": "8082",
	 * 	"runtime.server.THREE.listenAddress": "localhost",
	 * 	"runtime.server.THREE.listenPort": "8083",
	 * 	"runtime.server.indexes": "ONE THREE",
	 * });
	 *
	 * const runtimeCfg = appCfg.getNamespace("runtime");
	 * const serverCfgs = runtimeCfg.getArray("server", "indexes");
	 *
	 * console.log(serverCfgs.length); // 2
	 *
	 * console.log(serverCfgs[0].keys); // ["listenAddress","listenPort"]
	 * console.log(serverCfgs[1].keys); // ["listenAddress","listenPort"]
	 *
	 * console.log(serverCfgs[0].configurationNamespace); // runtime.server.ONE
	 * console.log(serverCfgs[0].get("listenAddress").asString); // localhost
	 * console.log(serverCfgs[0].get("listenPort").asInteger); // 8081
	 *
	 * console.log(serverCfgs[1].configurationNamespace); // runtime.server.THREE
	 * console.log(serverCfgs[1].get("listenAddress").asString); // localhost
	 * console.log(serverCfgs[1].get("listenPort").asInteger); // 8083
	 * ```
	 */
	public abstract getArray(key: string, indexesName?: string): Array<FConfiguration>;

	/**
	 * Get inner configuration for specific namespace.
	 *
	 * @throw `FConfigurationException` if no specific namespace found
	 * @returns Inner configuration
	 *
	 * @example
	 * ```js
	 * const appCfg = FConfiguration.factoryJson({
	 * 	"runtime.server.ONE.listenAddress": "localhost",
	 * 	"runtime.server.ONE.listenPort": "8081",
	 * 	"runtime.server.TWO.listenAddress": "localhost",
	 * 	"runtime.server.TWO.listenPort": "8082",
	 * });
	 *
	 * console.log(appCfg.configurationNamespace); // ""
	 *
	 * const runtimeCfg = appCfg.getNamespace("runtime");
	 * console.log(runtimeCfg.configurationNamespace); // "runtime"
	 *
	 * const serverTwoCfg = runtimeCfg.getNamespace("server.TWO");
	 * console.log(serverTwoCfg.configurationNamespace); // "runtime.server.TWO"
	 * ```
	 */
	public abstract getNamespace(configurationNamespace: string): FConfiguration;

	/**
	 * @throws `FConfigurationException` if the `key` not found and no `defaultData` provided
	 */
	public abstract get(key: string, defaultData?: string | null): FConfigurationValue;

	/**
	 * Find inner configuration for specific namespace.
	 *
	 * @returns Inner configuration or `null` if no specific namespace found
	 *
	 * @example
	 * ```js
	 * const appCfg = FConfiguration.factoryJson({
	 * 	"runtime.server.ONE.listenAddress": "localhost",
	 * 	"runtime.server.ONE.listenPort": "8081",
	 * 	"runtime.server.TWO.listenAddress": "localhost",
	 * 	"runtime.server.TWO.listenPort": "8082",
	 * });
	 *
	 * const setupCfg = appCfg.findNamespace("setup");
	 * console.log(setupCfg === null); // true
	 *
	 * const runtimeCfg = appCfg.findNamespace("runtime");
	 * console.log(runtimeCfg !== null); // true
	 * ```
	 */
	public abstract findNamespace(configurationNamespace: string): FConfiguration | null;

	public abstract find(key: string): FConfigurationValue | null;

	public abstract hasNamespace(configurationNamespace: string): boolean;

	/**
	 * Checks whether key is presented in current configuration
	 *
	 * @param key Name of key
	 * @returns `true` is the key is presented, otherwise `false`
	 *
	 * @example
	 * ```js
	 * const appCfg = FConfiguration.factoryJson({
	 * 	"runtime.port": "8080",
	 * 	"runtime.loglevel": "DEBUG",
	 * });
	 *
	 * const runtimeCfg = appCfg.getNamespace("runtime");
	 * const isLogLevelPresented = runtimeCfg.has("loglevel")
	 *
	 * console.log(isLogLevelPresented); // true
	 * ```
	 */
	public abstract has(key: string): boolean;
}

import { FConfigurationDictionary } from "./f_configuration_dictionary"; // Import here due to cyclic dependencies
