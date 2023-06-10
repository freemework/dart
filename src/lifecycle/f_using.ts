import { FDisposable } from "./f_disposable";
import { FInitable, FInitableBase } from "./f_initable";
import { FExecutionContext } from "../execution_context/f_execution_context";
import { FExceptionArgument } from "../exception";


// TODO Add overloading
// return Fusing(
// 	executionContext,
// 	() => this.create(executionContext),  // <- ! initializer without executionContext
// 	(db) => worker(db)                    // <- ! worker without executionContext
// );

export namespace Fusing {
	export type ResourceInitializerWithExecutionContext<T> = (executionContext: FExecutionContext) => T | Promise<T>;
	export type ResourceInitializerWithoutExecutionContext<T> = () => T | Promise<T>;
	export type ResourceInitializer<T> = ResourceInitializerWithExecutionContext<T> | ResourceInitializerWithoutExecutionContext<T>;

	export type WorkerWithExecutionContext<TResource, TResult> = (executionContext: FExecutionContext, resource: TResource) => Result<TResult>;
	export type WorkerWithoutExecutionContext<TResource, TResult> = (resource: TResource) => Result<TResult>;
	export type Worker<TResource, TResult> = WorkerWithExecutionContext<TResource, TResult> | WorkerWithoutExecutionContext<TResource, TResult>;

	export type Result<T> = T | Promise<T>;
}
export function Fusing<TResource extends FInitable | FDisposable, TResult>(
	executionContext: FExecutionContext,
	resourceFactory: Fusing.ResourceInitializer<TResource>,
	// worker: (executionContext: FExecutionContext, disposable: TResource) => Fusing.Result<TResult>
	worker: Fusing.Worker<TResource, TResult>
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

			let workerResult: Fusing.Result<TResult>;
			if (worker.length === 1) {
				workerResult = (worker as Fusing.WorkerWithoutExecutionContext<TResource, TResult>)(disposableResource);
			} else if (worker.length === 2) {
				workerResult = (worker as Fusing.WorkerWithExecutionContext<TResource, TResult>)(workerExecutorCancellactonToken, disposableResource);
			} else {
				throw new FExceptionArgument("Wrong worker function. Expect a function with 1 or 2 arguments.", "worker");
			}

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
