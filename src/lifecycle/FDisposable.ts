export interface FDisposable {
	dispose(): Promise<void>;
}

export abstract class FDisposableBase implements FDisposable {
	private _disposed?: boolean;
	private _disposingPromise?: Promise<void>;

	public get disposed(): boolean { return this._disposed === true; }
	public get disposing(): boolean { return this._disposingPromise !== undefined; }

	public dispose(): Promise<void> {
		if (this._disposed !== true) {
			if (this._disposingPromise === undefined) {
				const onDisposeResult = this.onDispose();
				if (onDisposeResult instanceof Promise) {
					this._disposingPromise = onDisposeResult.finally(() => {
						delete this._disposingPromise;
						this._disposed = true;
					});
				} else {
					this._disposed = true;
					return Promise.resolve();
				}
			}
			return this._disposingPromise;
		}
		return Promise.resolve();
	}

	public static async disposeAll(...instances: ReadonlyArray<FDisposable>): Promise<void> {
		for (const instance of instances) {
			await FDisposableBase.safeDispose(instance);
		}
	}

	public static safeDispose(disposable: any): Promise<void> {
		if (typeof disposable !== "object" || disposable === null) { return Promise.resolve(); }
		if (!("dispose" in disposable)) { return Promise.resolve(); }
		if (typeof disposable.dispose !== "function") { return Promise.resolve(); }

		return Promise.resolve().then(async () => {
			try {
				const disposeResult = (disposable as FDisposable).dispose();
				if (disposeResult instanceof Promise) {
					await disposeResult;
				}
			} catch (e) {
				console.error(
					"Dispose method raised an error. This is unexpected behaviour due dispose() should be exception safe. The error was bypassed.",
					e);
			}
		});
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
			const propertyDescr = Object.getOwnPropertyDescriptor(FDisposableBase.prototype, name);

			if (name === "constructor") {
				// Skip constructor
				return;
			}

			if (propertyDescr !== undefined) {
				Object.defineProperty(targetClass.prototype, name, propertyDescr);
			}
		});

		Object.getOwnPropertyNames(FDisposableMixin.prototype).forEach(name => {
			const propertyDescr = Object.getOwnPropertyDescriptor(FDisposableMixin.prototype, name);

			if (name === "constructor") {
				// Skip constructor
				return;
			}
			if (name === "onDispose") {
				// Add NOP methods into mixed only if it not implements its
				if (propertyDescr !== undefined) {
					const existingPropertyDescr = Object.getOwnPropertyDescriptor(targetClass.prototype, name);
					if (existingPropertyDescr === undefined) {
						Object.defineProperty(targetClass.prototype, name, propertyDescr);
					}
				}
				return;
			}

			if (propertyDescr !== undefined) {
				Object.defineProperty(targetClass.prototype, name, propertyDescr);
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
