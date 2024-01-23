import { FConfiguration, FConfigurationValue } from "@freemework/common";

export class FConfigurationCommandLine extends FConfiguration {
	get sourceURI(): URL {
		throw new Error("Method not implemented.");
	}
	get namespaceFull(): string | null {
		throw new Error("Method not implemented.");
	}
	get namespaceParent(): string | null {
		throw new Error("Method not implemented.");
	}
	get keys(): readonly string[] {
		throw new Error("Method not implemented.");
	}
	getArray(_key: string, _indexesName?: string | undefined): FConfiguration[] {
		throw new Error("Method not implemented.");
	}
	getNamespace(_namespaceFull: string): FConfiguration {
		throw new Error("Method not implemented.");
	}
	get(_key: string, _defaultData?: string | null | undefined): FConfigurationValue {
		throw new Error("Method not implemented.");
	}
	findNamespace(_namespaceFull: string): FConfiguration | null {
		throw new Error("Method not implemented.");
	}
	find(_key: string): FConfigurationValue | null {
		throw new Error("Method not implemented.");
	}
	hasNamespace(_namespaceFull: string): boolean {
		throw new Error("Method not implemented.");
	}
	has(_key: string): boolean {
		throw new Error("Method not implemented.");
	}

}
