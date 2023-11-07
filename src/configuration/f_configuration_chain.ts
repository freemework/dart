import _ = require("lodash");
import { join } from "path";

import { FExceptionArgument } from "../exception";

import { FConfiguration } from "./f_configuration";
import { FConfigurationException } from "./f_configuration_exception";;
import { FConfigurationValue } from "./f_configuration_value";

export class FConfigurationChain extends FConfiguration {
	public get sourceURI(): URL {
		return this._sourceURI;
	}
	public get namespaceFull(): string | null {
		return this._configurations[0].namespaceFull;
	}
	public get namespaceParent(): string | null {
		return this._configurations[0].namespaceParent;
	}
	public get keys(): readonly string[] {
		return _.union(...this._configurations.map(item => item.keys));
	}

	public constructor(...configurations: ReadonlyArray<FConfiguration>) {
		super();

		if (configurations.length === 0) {
			throw new FExceptionArgument("At least one configuration required for chain.", "configurations");
		}

		const innerCommaSeparatedSourceURIs: string = configurations
			.map(s => s.sourceURI.toString())
			.map(s => encodeURIComponent(s))
			.join(",");

		const sourceURI: string = `configuration:chain?sources=${innerCommaSeparatedSourceURIs}`;

		this._sourceURI = new URL(sourceURI);
		this._configurations = Object.freeze(configurations);
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

	public getNamespace(namespaceFull: string): FConfiguration {
		const innerConfiguration: FConfiguration | null = this.findNamespace(namespaceFull);
		if (innerConfiguration !== null) {
			return innerConfiguration;
		}

		// Force underlaying config to raise error
		for (const configuration of this._configurations) {
			configuration.getNamespace(namespaceFull);
		}

		// just a guard, should not happens if underlaying configuration is implemented correctly
		throw new FConfigurationException(
			`Namespace was not found in the configuration.`,
			namespaceFull
		);
	}

	public get(key: string, defaultData?: string | null): FConfigurationValue {
		const foundValue: FConfigurationValue | null = this.find(key);
		if (foundValue !== null) {
			return foundValue;
		}

		const namespaceFull = this.namespaceFull;
		const fullKey = namespaceFull !== null ? `${namespaceFull}.${key}` : key;

		if (defaultData !== undefined) {
			const value: FConfigurationValue = FConfigurationValue.factory(
				fullKey, defaultData, null, null
			);
			return value;
		} else {
			throw new FConfigurationException("Current configuration does not have such key. Check your configuration.", fullKey);
		}
	}

	public findNamespace(namespaceFull: string): FConfiguration | null {
		const innerConfigurations: Array<FConfiguration> = [];
		for (const configuration of this._configurations) {
			if (configuration.hasNamespace(namespaceFull)) {
				innerConfigurations.push(configuration.getNamespace(namespaceFull));
			}
		}
		if (innerConfigurations.length === 0) {
			return null;
		}
		return new FConfigurationChain(...innerConfigurations);
	}

	public find(key: string): FConfigurationValue | null {
		for (let itemIndex = 0; itemIndex < this._configurations.length; ++itemIndex) {
			const configurationItem: FConfiguration = this._configurations[itemIndex];
			if (configurationItem.has(key)) {
				return configurationItem.get(key);
			}
		}

		return null;
	}

	public hasNamespace(namespaceFull: string): boolean {
		for (const configuration of this._configurations) {
			if (configuration.hasNamespace(namespaceFull)) {
				return true;
			} else if (configuration.has(namespaceFull)) {
				const isMaskedNamespace = configuration.get(namespaceFull).isNull;
				if (isMaskedNamespace) {
					// This is masked namespace
					return false;
				}
			}
		}
		return false;
	}

	public has(key: string): boolean {
		for (const configuration of this._configurations) {
			if (configuration.has(key)) { return true; }
		}
		return false; // no one configurations contains key
	}

	private readonly _sourceURI: URL;

	/**
	 * List of inner configurations. Values from first more important!
	 */
	private readonly _configurations: ReadonlyArray<FConfiguration>;

	private static throwWrongKeyError(key: string, parentNamespace: string | null): never {
		if (parentNamespace !== null) {
			const fullKey: string = `${parentNamespace}.${key}`;
			throw new FConfigurationException(
				`A value was not found in current configuration.`,
				fullKey
			);
		}
		throw new FConfigurationException(
			`A value was not found in current configuration.`,
			key
		);
	}
}
