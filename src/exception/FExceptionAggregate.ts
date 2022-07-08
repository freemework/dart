import { FException } from "./FException";

export class FExceptionAggregate extends FException {
	public readonly innerErrors: ReadonlyArray<FException>;
	public constructor(innerErrors: ReadonlyArray<FException>) {
		let friendlyInnerError: FException | null;
		let friendlyInnerErrors: Array<FException>;
		let friendlyMessage: string;
		if (innerErrors.length > 0) {
			friendlyInnerErrors = [...innerErrors];
			friendlyInnerError = friendlyInnerErrors.length > 0 ? friendlyInnerErrors[0] : null;
			friendlyMessage = innerErrors.map(e => e.message).join("\n");
		} else {
			friendlyInnerErrors = [];
			friendlyInnerError = null;
			friendlyMessage = "FExceptionAggregate";
		}

		if (friendlyInnerError !== null) {
			super(friendlyMessage, friendlyInnerError);
		} else {
			super(friendlyMessage);
		}

		this.innerErrors = friendlyInnerErrors;
	}

	public toString(): string {
		if (this.innerErrors.length === 0) { return super.toString(); }
		return this.innerErrors.map(e => e.toString()).join("\n");
	}
}
