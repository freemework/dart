import { FException } from "./FException";

export class FArgumentException extends FException {
	public constructor();
	public constructor(paramName: string);
	public constructor(paramName: string, message: string);
	public constructor(paramName: string, message: string, innerError: any);

	constructor(paramName?: string, message?: string, innerError?: any) {
		if (paramName !== undefined) {
			if (message !== undefined) {
				super(`Wrong argument '${paramName}'. ${message}`, innerError);
			} else {
				super(`Wrong argument '${paramName}'`);
			}
		} else {
			super("Wrong argument");
		}
	}
}
