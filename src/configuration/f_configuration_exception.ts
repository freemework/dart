import { FException } from "../exception";

export class FConfigurationException extends FException {
	public readonly key: string;

	public constructor(message: string, key: string, innerException?: FException) {
		super(`There are a problem with configuration key '${key}'. ${message}`, innerException);
		this.key = key;
	}
}
