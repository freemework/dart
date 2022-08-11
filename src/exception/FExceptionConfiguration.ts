import { FException } from "./FException";

export class FExceptionConfiguration extends FException {
	public readonly source: string | null;
	public readonly key: string | null;

	public constructor(message: string, key: string | null, source: string | null);
	public constructor(message: string, key: string | null, source: string | null, innerException: FException);

	public constructor(message: string, key: string | null, source: string | null, innerException?: any) {
		if (innerException !== undefined) {
			super(message, innerException);
		} else {
			super(message);
		}
		this.key = key;
		this.source = source;
	}
}
