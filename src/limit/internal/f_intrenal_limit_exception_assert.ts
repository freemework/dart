import { FExceptionInvalidOperation } from "../../exception/f_exception_invalid_operation.js";

export class FIntrenalLimitExceptionAssert extends FExceptionInvalidOperation {
	public constructor() {
		super("Looks like bug inside...");
	}
}
