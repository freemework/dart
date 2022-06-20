import { FDisposable } from "./FDisposable";
import { FExecutionContext } from "../execution_context/FExecutionContext";

export interface FInitable extends FDisposable {
	init(executionContext: FExecutionContext): Promise<void>;
}
