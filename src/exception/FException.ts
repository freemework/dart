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
	public constructor(message: string, innerException?: FException);
	public constructor(innerException: FException);

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
		let messageBuffer: string = '';
		let stackTraceBuffer: string = '';

		messageBuffer += this.constructor.name;
		messageBuffer += ': ';
		messageBuffer += this.message;

		let innerException: FException | null = this.innerException;
		while (innerException !== null) {
			messageBuffer += ' ---> ';

			messageBuffer += innerException.constructor.name;
			messageBuffer += ': ';
			messageBuffer += innerException.message;

			const innerStack: string | undefined = innerException.stack;
			if (innerStack !== undefined) {
				stackTraceBuffer += innerStack;
			} else {
				stackTraceBuffer += 'No available stack trace';
			}
			stackTraceBuffer += '\n';
			stackTraceBuffer += '--- End of inner exception stack trace ---\n';

			innerException = innerException.innerException;
		}

		const stackTrace: string | undefined = this.stack;
		if (stackTrace !== undefined) {
			stackTraceBuffer += stackTrace;
		} else {
			stackTraceBuffer += 'No available stack trace';
		}

		messageBuffer += '\n';
		messageBuffer += stackTraceBuffer;

		return messageBuffer.toString();
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
