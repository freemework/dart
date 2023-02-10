import { FUtilUnreadonly } from "../util";

import { FConfiguration } from "./f_configuration";
import { FConfigurationException } from "./f_configuration_exception";;
import { FConfigurationValue } from "./f_configuration_value";

export class FConfigurationDictionary extends FConfiguration {

	private readonly _dict: FConfigurationDictionary.Data;
	private readonly _sourceURI: URL;
	private readonly _configurationNamespace: string | null;
	private _keys: ReadonlyArray<string> | null;

	public constructor(sourceURI: URL, dict: FConfigurationDictionary.Data, configurationNamespace?: string) {
		super();
		this._dict = Object.freeze({ ...dict });
		this._sourceURI = sourceURI;
		this._configurationNamespace = configurationNamespace !== undefined ? configurationNamespace : null;
		this._keys = null;
	}

	public get configurationNamespace(): string | null {
		return this._configurationNamespace;
	}

	public get keys(): ReadonlyArray<string> {
		return this._keys !== null ? this._keys : (this._keys = Object.freeze(Object.keys(this._dict)));
	}

	public get sourceURI(): URL {
		return this._sourceURI;
	}

	public findNamespace(configurationNamespace: string): FConfiguration | null {
		throw new Error("Method not implemented.");
	}

	public find(key: string): FConfigurationValue | null {
		if (key in this._dict) {
			const valueData = this._dict[key];
			const value: FConfigurationValue = FConfigurationValue.factory(
				key,
				valueData,
				this.sourceURI,
				null
			);
			return value;
		} else {
			return null;
		}
	}

	public getNamespace(configurationNamespace: string): FConfiguration {
		const innerDict: FUtilUnreadonly<FConfigurationDictionary.Data> = {};
		const criteria = configurationNamespace + ".";
		const criteriaLen = criteria.length;
		Object.keys(this._dict).forEach((key) => {
			if (key.length > criteriaLen && key.startsWith(criteria)) {
				const value = this._dict[key];
				innerDict[key.substring(criteriaLen)] = value;
			}
		});

		const innerConfigurationNamespace = this._configurationNamespace !== null ?
			`${this._configurationNamespace}.${configurationNamespace}` : configurationNamespace;

		if (Object.keys(innerDict).length === 0) {
			throw new FConfigurationException(
				`Namespace '${innerConfigurationNamespace}' was not found in the configuration.`,
				innerConfigurationNamespace
			);
		}
		return new FConfigurationDictionary(this.sourceURI, innerDict, innerConfigurationNamespace);
	}

	public get(key: string, defaultData?: string | null): FConfigurationValue {
		if (key in this._dict) {
			let valueData = this._dict[key];

			if (valueData === null && defaultData !== undefined) {
				valueData = defaultData;
			}

			const value: FConfigurationValue = FConfigurationValue.factory(
				key, valueData, this.sourceURI, null
			);
			return value;
		} else if (defaultData !== undefined) {
			const value: FConfigurationValue = FConfigurationValue.factory(
				key, defaultData, this.sourceURI, null
			);
			return value;
		} else {
			throw new FConfigurationException("Current configuration does not have such key. Check your configuration.", key);
		}
	}

	public getArray(key: string, indexesName: string = FConfiguration.DEFAULT_INDEXES_KEY): Array<FConfiguration> {
		const arrayIndexesKey = `${key}.${indexesName}`;
		const arrayIndexes: Array<string> = this.get(arrayIndexesKey).asString
			.split(" ")
			.filter(s => s !== "");

		const arrayNamespaces: Array<FConfiguration> = arrayIndexes.map(s => {
			const arrayItemNamespaceKey = `${key}.${s}`;
			return this.getNamespace(arrayItemNamespaceKey);
		});

		return arrayNamespaces;
	}

	public hasNamespace(configurationNamespace: string): boolean {
		const criteria = configurationNamespace + ".";
		const criteriaLen = criteria.length;
		for (const key of Object.keys(this._dict)) {
			if (key.length > criteriaLen && key.startsWith(criteria)) {
				return true;
			}
		}
		return false;
	}

	public has(key: string): boolean {
		return key in this._dict;
	}
}

export namespace FConfigurationDictionary {
	export type Data = { readonly [key: string]: string | null };
}
