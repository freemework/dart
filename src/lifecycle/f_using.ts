import { FDisposable } from "./f_disposable";
import { FInitable, FInitableBase } from "./f_initable";
import { FExecutionContext } from "../execution_context/f_execution_context";

export namespace Fusing {
	export type ResourceInitializer<T> = (executionContext: FExecutionContext) => T | Promise<T>;
	export type Result<T> = T | Promise<T>;
}
export function Fusing<TResource extends FInitable | FDisposable, TResult>(
	executionContext: FExecutionContext,
	resourceFactory: Fusing.ResourceInitializer<TResource>,
	worker: (executionContext: FExecutionContext, disposable: TResource) => Fusing.Result<TResult>
): Promise<TResult> {
	if (!resourceFactory || typeof resourceFactory !== "function") {
		throw new Error("Wrong argument: resourceFactory");
	}
	if (!worker) { throw new Error("Wrong argument: worker"); }

	async function workerExecutor(workerExecutorCancellactonToken: FExecutionContext, disposableResource: TResource): Promise<TResult> {
		if (disposableResource instanceof FInitableBase || "init" in disposableResource) {
			await (disposableResource as FInitable).init(executionContext);
		}
		try {
			const workerResult = worker(workerExecutorCancellactonToken, disposableResource);
			if (workerResult instanceof Promise) {
				return await workerResult;
			} else {
				return workerResult;
			}
		} finally {
			await disposableResource.dispose();
		}
	}

	const resource = resourceFactory(executionContext);
	if (resource instanceof Promise) {
		return (resource as Promise<TResource>)
			.then(disposableInstance => workerExecutor(executionContext, disposableInstance));
	} else {
		return workerExecutor(executionContext, resource);
	}
}
