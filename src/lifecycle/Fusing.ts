import { FDisposable } from "./FDisposable";
import { FInitable } from "./FInitable";
import { FCancellationToken } from "../cancellation/FCancellationToken";
import { FExecutionContext } from "../execution_context/FExecutionContext";

export namespace Fusing {
	// tslint:disable-next-line: max-line-length
	export type ResourceInitializer<T> = ((executionContext: FExecutionContext) => T | Promise<T>) | Promise<T>;
	export type Result<T> = T | Promise<T>;
}
export function Fusing<TResource extends FInitable | FDisposable, TResult>(
	executionContext: FExecutionContext,
	// tslint:disable-next-line: max-line-length
	disposable: Fusing.ResourceInitializer<TResource>,
	worker: (executionContext: FExecutionContext, disposable: TResource) => Fusing.Result<TResult>
): Promise<TResult> {
	if (!disposable) { throw new Error("Wrong argument: disposable"); }
	if (!worker) { throw new Error("Wrong argument: worker"); }

	// tslint:disable-next-line: max-line-length
	async function workerExecutor(workerExecutorCancellactonToken: FExecutionContext, disposableResource: TResource): Promise<TResult> {
		if ("init" in disposableResource) {
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
			try {
				await disposableResource.dispose();
			} catch (e) {
				console.error(
					"Dispose method raised an error. This is unexpected behaviour due dispose() should be exception safe. The error was bypassed.",
					e);
			}
		}
	}

	// tslint:disable-next-line: max-line-length
	function workerExecutorFacade(disposableObject: TResource | Promise<TResource>): Promise<TResult> {
		if (disposableObject instanceof Promise) {
			return (disposableObject as Promise<TResource>).then(disposableInstance => workerExecutor(executionContext, disposableInstance));
		} else {
			return workerExecutor(executionContext, disposableObject);
		}
	}

	if (typeof disposable === "function") {
		// tslint:disable-next-line: max-line-length
		const disposableInitializerFunction: Fusing.ResourceInitializer<TResource> = disposable;
		const realDisposable = disposableInitializerFunction(executionContext);
		return workerExecutorFacade(realDisposable);
	} else {
		return workerExecutorFacade(disposable);
	}
}
