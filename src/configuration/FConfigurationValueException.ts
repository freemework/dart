import { FException } from "../exception";

import { FConfigurationException } from "./FConfigurationException";
import { FConfigurationValue } from "./FConfigurationValue";

export class FConfigurationValueException extends FConfigurationException {
	public readonly value: FConfigurationValue;

	public constructor(
		value: FConfigurationValue,
		message: string,
		key: string,
		innerException?: FException
	) {
		super(message, key, innerException);

		this.value = value;
	}
}
