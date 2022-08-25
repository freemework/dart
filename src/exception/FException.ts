export class FException extends Error {
	public static wrapIfNeeded(likeError: any): FException {
		if (likeError instanceof FException) {
			return likeError;
		} else if (likeError instanceof Error) {
			return new FExceptionNativeErrorWrapper(likeError);
		} else {
			return new FExceptionNativeObjectWrapper(likeError);
		}
	}

	public readonly innerException: FException | null;

	public constructor();
	public constructor(message: string);
	public constructor(message: string, innerEx?: FException);
	public constructor(innerEx: FException);

	public constructor(first?: any, second?: any) {
		if (first === undefined) {
			super();
			this.innerException = null;
		} else {
			if (typeof first === "string") {
				super(first);
				if (second !== undefined && second !== null) {
					this.innerException = FException.wrapIfNeeded(second);
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

	public get name(): string {
		return this.constructor.name;
	}

	public toString(): string {
		if (this.innerException !== null) {
			return [super.toString(), this.innerException.toString()].join("\n");
		}
		return super.toString();
	}
}

export class FExceptionNativeObjectWrapper extends FException {
	public readonly nativeObject: any;

	public constructor(nativeObject: any) {
		super(`${nativeObject}`);
		this.nativeObject = nativeObject;
	}
}

export class FExceptionNativeErrorWrapper extends FException {
	public readonly nativeError: Error;

	public constructor(nativeError: Error) {
		super(nativeError.message);
		this.nativeError = nativeError;
	}

	public get name(): string {
		return this.nativeError.name;
	}
}
