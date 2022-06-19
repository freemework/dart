export interface FConfiguration {
	readonly configurationNamespace: string;
	readonly keys: ReadonlyArray<string>;
	get(key: string): boolean | number | string;
	getBase64(key: string, defaultValue?: Uint8Array): Uint8Array;
	getBoolean(key: string, defaultValue?: boolean): boolean;
	getNamespace(configurationNamespace: string): FConfiguration;
	getEnabled(key: string, defaultValue?: boolean): boolean;
	getFloat(key: string, defaultValue?: number): number;
	getIndexer(indexerName?: string): ReadonlyArray<FConfiguration>;
	getInteger(key: string, defaultValue?: number): number;
	getString(key: string, defaultValue?: string): string;
	getURL(key: string, defaultValue?: URL): URL;
	hasNamespace(configurationNamespace: string): boolean;
	has(key: string): boolean;
	hasNonEmpty(key: string): boolean;
}
