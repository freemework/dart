export class FException extends Error {
	public static wrapErrorIfNeeded(likeError: any): FException {
		if (likeError) {
			if (likeError instanceof FException) {
				return likeError;
			} else if (likeError instanceof Error) {
				return new FNativeErrorException(likeError);
			} else {
				return new FException(`${likeError}`);
			}
		}
		return new FException();
	}

	public readonly innerException: FException | null;

	public constructor();
	public constructor(message: string);
	public constructor(message: string, innerEx: FException);
	public constructor(innerEx: FException);

	public constructor(first?: any, second?: any) {
		if (first === undefined) {
			super();
			this.innerException = null;
		} else {
			if (typeof first === "string") {
				super(first);
				if (second !== undefined && second !== null) {
					this.innerException = FException.wrapErrorIfNeeded(second);
				} else {
					this.innerException = null;
				}
			} else if (first instanceof FException) {
				super();
				this.innerException = first;
			} else {
				throw new Error("Wrong arguments. First agrument should be a string (if present).");
			}
		}
	}

	public toString(): string {
		if (this.innerException !== null) {
			return [super.toString(), this.innerException.toString()].join("\n");
		}
		return super.toString();
	}
}


export class FNativeErrorException extends FException {
	public readonly nativeError: Error;

	public constructor(nativeError: Error) {
		super();
		this.nativeError = nativeError;
	}
}
