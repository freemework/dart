import { EOL } from "os";

import { FException } from "./f_exception";

export class FExceptionAggregate extends FException {
	static throwIfNeeded(innerExceptions: ReadonlyArray<FException>): void {
		if (innerExceptions.length > 0) {
			if (innerExceptions.length == 1) {
				throw innerExceptions[0];
			}
			throw new FExceptionAggregate(innerExceptions);
		}
	}

	public readonly innerExceptions: ReadonlyArray<FException>;
	public constructor(innerExceptions: ReadonlyArray<FException>, message?: string) {
		let friendlyInnerException: FException | null;
		let friendlyInnerExceptions: Array<FException>;
		let friendlyMessage: string;
		if (innerExceptions.length > 0) {
			friendlyInnerExceptions = [...innerExceptions];
			friendlyInnerException = friendlyInnerExceptions.length > 0 ? friendlyInnerExceptions[0] : null;
		} else {
			friendlyInnerExceptions = [];
			friendlyInnerException = null;
		}
		if(message !== undefined) {
			friendlyMessage = message;
		} else {
			friendlyMessage = "One or more errors occurred.";
		}

		if (friendlyInnerException !== null) {
			super(friendlyMessage, friendlyInnerException);
		} else {
			super(friendlyMessage);
		}

		this.innerExceptions = Object.freeze(friendlyInnerExceptions);
	}

	/**
	 * @override
	 */
	public toString(): string {
		const  messages: Array<String> = [super.toString()];
	
		if (this.innerExceptions.length > 0) {
		  messages.push(...this.innerExceptions.map((e) => e.toString()));
		}
		return messages.join(EOL);
	  }
}
