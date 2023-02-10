import { FException } from "../exception";

import { FConfigurationException } from "./f_configuration_exception";
import { FConfigurationValue } from "./f_configuration_value";

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
