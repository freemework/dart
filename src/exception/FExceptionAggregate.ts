import { FException } from "./FException";

export class FExceptionAggregate extends FException {
	public readonly innerExceptions: ReadonlyArray<FException>;
	public constructor(innerExceptions: ReadonlyArray<FException>) {
		let friendlyInnerException: FException | null;
		let friendlyInnerExceptions: Array<FException>;
		let friendlyMessage: string;
		if (innerExceptions.length > 0) {
			friendlyInnerExceptions = [...innerExceptions];
			friendlyInnerException = friendlyInnerExceptions.length > 0 ? friendlyInnerExceptions[0] : null;
			friendlyMessage = innerExceptions.map(e => e.message).join("\n");
		} else {
			friendlyInnerExceptions = [];
			friendlyInnerException = null;
			friendlyMessage = "FExceptionAggregate";
		}

		if (friendlyInnerException !== null) {
			super(friendlyMessage, friendlyInnerException);
		} else {
			super(friendlyMessage);
		}

		this.innerExceptions = friendlyInnerExceptions;
	}

	public toString(): string {
		if (this.innerExceptions.length === 0) { return super.toString(); }
		return this.innerExceptions.map(e => e.toString()).join("\n");
	}
}
