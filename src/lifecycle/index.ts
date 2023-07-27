declare global {
	interface Symbol {
		// dispose(): void;
		asyncDispose(): Promise<void>;
	}
}

//
// Require TypeScript 5.2+ and ESNext.Disposable
// See https://devblogs.microsoft.com/typescript/announcing-typescript-5-2-beta/
//
// (Symbol as any).dispose ??= Symbol("Symbol.dispose");
(Symbol as any).asyncDispose ??= Symbol("Symbol.asyncDispose");

export { FDisposable, FDisposableBase, FDisposableMixin } from "./f_disposable";
export { FInitable, FInitableBase, FInitableMixin } from "./f_initable";
export { FSleep } from "./f_sleep";
export { FUsing } from "./f_using";

