import { FDisposable } from "./FDisposable";
import { FExecutionContext } from "./FExecutionContext";

export interface FInitable extends FDisposable {
	init(executionContext: FExecutionContext): Promise<void>;
}
