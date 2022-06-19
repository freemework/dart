import { FException } from "./FException";

export class FConfigurationException extends FException {
	public readonly source: string | null;
	public readonly key: string | null;

	public constructor(message: string, key: string | null, source: string | null);
	public constructor(message: string, key: string | null, source: string | null, innerError: Error);
	public constructor(message: string, key: string | null, source: string | null, innerError: any);

	public constructor(message: string, key: string | null, source: string | null, innerError?: any) {
		if (innerError !== undefined) {
			super(message, innerError);
		} else {
			super(message);
		}
		this.key = key;
		this.source = source;
	}
}
