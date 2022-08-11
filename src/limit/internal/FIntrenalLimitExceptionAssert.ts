import { FExceptionInvalidOperation } from "../../exception/FExceptionInvalidOperation";

export class FIntrenalLimitExceptionAssert extends FExceptionInvalidOperation {
	public constructor() {
		super("Looks like bug inside...");
	}
}
