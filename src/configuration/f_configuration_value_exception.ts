import { FException } from "../exception/index.js";

import { FConfigurationException } from "./f_configuration_exception.js";
import { FConfigurationValue } from "./f_configuration_value.js";

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
