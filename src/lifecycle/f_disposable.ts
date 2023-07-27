import { FException, FExceptionAggregate } from "../exception";

export abstract class FDisposable {
	public async [Symbol.asyncDispose]() {
		await this.dispose();
	}

	abstract dispose(): Promise<void>;

	public static async disposeAll(...instances: ReadonlyArray<FDisposable>): Promise<void> {
		const innerExceptions: Array<FException> = [];
		for (const instance of instances) {
			try {
				await instance.dispose();
			} catch (e) {
				innerExceptions.push(FException.wrapIfNeeded(e));
			}
		}
		FExceptionAggregate.throwIfNeeded(innerExceptions);
	}

	// public static async safeDispose(disposable: any): Promise<void> {
	// 	if (typeof disposable !== "object" || disposable === null) { return Promise.resolve(); }
	// 	if (!("dispose" in disposable)) { return Promise.resolve(); }
	// 	if (typeof disposable.dispose !== "function") { return Promise.resolve(); }

	// 	return Promise.resolve().then(async () => {
	// 		try {
	// 			const disposeResult = (disposable as FDisposable).dispose();
	// 			if (disposeResult instanceof Promise) {
	// 				await disposeResult;
	// 			}
	// 		} catch (e) {
	// 			console.error(
	// 				"Dispose method raised an error. This is unexpected behavior due dispose() should be exception safe. The error was bypassed.",
	// 				e);
	// 		}
	// 	});
	// }
}

export abstract class FDisposableBase extends FDisposable {
	private _disposed?: boolean;
	private _disposingPromise?: Promise<void>;

	public get disposed(): boolean { return this._disposed === true; }
	public get disposing(): boolean { return this._disposingPromise !== undefined; }

	public dispose(): Promise<void> {
		if (this._disposed !== true) {
			if (this._disposingPromise === undefined) {
				this._disposingPromise = Promise.resolve();
				const onDisposeResult = this.onDispose();
				if (onDisposeResult instanceof Promise) {
					this._disposingPromise = this._disposingPromise
						.then(() => onDisposeResult)
						.finally(() => {
							delete this._disposingPromise;
							this._disposed = true;
						});
					return this._disposingPromise;
				} else {
					this._disposed = true;
					delete this._disposingPromise;
				}
			} else {
				return this._disposingPromise;
			}
		}
		return Promise.resolve();
	}

	protected abstract onDispose(): void | Promise<void>;

	protected verifyNotDisposed() {
		if (this.disposed || this.disposing) {
			throw new Error("Wrong operation on disposed object");
		}
	}
}

export class FDisposableMixin extends FDisposableBase {
	public static applyMixin(targetClass: any): void {
		Object.getOwnPropertyNames(FDisposableBase.prototype).forEach(name => {

			if (name === "constructor") {
				// Skip constructor
				return;
			}

			const propertyDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(FDisposableBase.prototype, name);

			if (propertyDescriptor !== undefined) {
				Object.defineProperty(targetClass.prototype, name, propertyDescriptor);
			}
		});

		Object.getOwnPropertyNames(FDisposableMixin.prototype).forEach(name => {

			if (name === "constructor") {
				// Skip constructor
				return;
			}
			
			const propertyDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(FDisposableMixin.prototype, name);

			if (name === "onDispose") {
				// Add NOP methods into mixed only if it not implements its
				if (propertyDescriptor !== undefined) {
					const existingPropertyDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(targetClass.prototype, name);
					if (existingPropertyDescriptor === undefined) {
						Object.defineProperty(targetClass.prototype, name, propertyDescriptor);
					}
				}
				return;
			}

			if (propertyDescriptor !== undefined) {
				Object.defineProperty(targetClass.prototype, name, propertyDescriptor);
			}
		});
	}

	protected onDispose(): void | Promise<void> {
		// Do nothing here by design. Users will override this method.
	}

	private constructor() {
		super();
		// Never called, due mixin
		// Private constructor has two kinds of responsibility
		// 1) Restrict to extends the mixin
		// 2) Restrict to make instances of the mixin
	}
}
