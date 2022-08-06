import { FException } from "../exception/FException";
import { FSqlException } from "./FSqlException";

export class FSqlExceptionConstraint extends FSqlException {
	public readonly constraintName: string;

	public constructor(message: string, constraintName: string, innerEx: FException) {
		super(message, innerEx);
		this.constraintName = constraintName;
	}
}
