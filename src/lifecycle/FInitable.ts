import { FDisposable, FDisposableBase } from "./FDisposable";
import { FExecutionContext } from "../execution_context/FExecutionContext";

export interface FInitable extends FDisposable {
	init(executionContext: FExecutionContext): Promise<void>;
}
export namespace FInitable {
	export async function initAll(executionContext: FExecutionContext, ...instances: ReadonlyArray<FInitable>): Promise<void> {
		const intializedInstances: Array<FInitable> = [];
		try {
			for (const instance of instances) {
				await instance.init(executionContext);
				intializedInstances.push(instance);
			}
		} catch (e) {
			for (const intializedInstance of intializedInstances.reverse()) {
				await FDisposableBase.safeDispose(intializedInstance);
			}
			throw e;
		}
	}

}

export abstract class FInitableBase implements FInitable {
	private _initialized?: boolean;
	private _initializingPromise?: Promise<void>;
	private _disposed?: boolean;
	private _disposingPromise?: Promise<void>;
	private _initExecutionContext: FExecutionContext | null;

	public get initialized(): boolean { return this._initialized === true; }
	public get initializing(): boolean { return this._initializingPromise !== undefined; }
	public get disposed(): boolean { return this._disposed === true; }
	public get disposing(): boolean { return this._disposingPromise !== undefined; }

	public constructor() {
		this._initExecutionContext = null;
	}

	public init(executionContext: FExecutionContext): Promise<void> {
		this.verifyNotDisposed();
		if (!this._initialized) {
			if (this._initializingPromise === undefined) {
				this._initExecutionContext = executionContext;
				this._initializingPromise = Promise.resolve();
				const onInitializeResult = this.onInit(executionContext);
				if (onInitializeResult instanceof Promise) {
					this._initializingPromise = this._initializingPromise
						.then(() => onInitializeResult)
						.finally(() => {
							delete this._initializingPromise;
							this._initialized = true;
						});
					return this._initializingPromise;
				} else {
					this._initialized = true;
					delete this._initializingPromise;
				}
			} else {
				return this._initializingPromise;
			}
		}
		return Promise.resolve();
	}

	public dispose(): Promise<void> {
		if (this._disposed !== true) {
			if (this._disposingPromise === undefined) {
				if (this._initializingPromise !== undefined) {
					this._disposingPromise = this._initializingPromise;
					this._disposingPromise = this._disposingPromise
						.then(async () => this.onDispose())
						.finally(() => {
							delete this._disposingPromise;
							this._disposed = true;
						});
					return this._disposingPromise;
				} else {
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
				}
			} else {
				return this._disposingPromise;
			}
		}
		return Promise.resolve();
	}

	protected get initExecutionContext(): FExecutionContext {
		if (!(this.initialized || this.initializing)) {
			throw new Error("Wrong operation. Cannot obtain initExecutionContext before call init().");
		}
		return this._initExecutionContext!;
	}

	protected abstract onInit(executionContext: FExecutionContext): void | Promise<void>;
	protected abstract onDispose(): void | Promise<void>;


	protected verifyInitialized() {
		if (!this.initialized) {
			throw new Error("Wrong operation on non-initialized object");
		}
	}

	protected verifyNotDisposed() {
		if (this.disposed || this.disposing) {
			throw new Error("Wrong operation on disposed object");
		}
	}

	protected verifyInitializedAndNotDisposed() {
		this.verifyInitialized();
		this.verifyNotDisposed();
	}
}

export class FInitableMixin extends FInitableBase {
	public static applyMixin(targetClass: any): void {
		Object.getOwnPropertyNames(FInitableBase.prototype).forEach(name => {
			const propertyDescr = Object.getOwnPropertyDescriptor(FInitableBase.prototype, name);

			if (name === "constructor") {
				// Skip constructor
				return;
			}

			if (propertyDescr !== undefined) {
				Object.defineProperty(targetClass.prototype, name, propertyDescr);
			}
		});

		Object.getOwnPropertyNames(FInitableMixin.prototype).forEach(name => {
			const propertyDescr = Object.getOwnPropertyDescriptor(FInitableMixin.prototype, name);

			if (name === "constructor") {
				// Skip constructor
				return;
			}
			if (name === "onInit" || name === "onDispose") {
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

	protected onInit(executionContext: FExecutionContext): void | Promise<void> {
		// Do nothing here by design. Users will override this method.
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
