//
// https://github.com/tc39/proposal-explicit-resource-management
//

export {};

declare global {
	interface SymbolConstructor {
		//readonly dispose: unique symbol;
		readonly asyncDispose: unique symbol;
	}
}

//
// Require TypeScript 5.2+ and ESNext.Disposable
// See https://devblogs.microsoft.com/typescript/announcing-typescript-5-2-beta/
//
// (Symbol as any).dispose ??= Symbol("Symbol.dispose");
(Symbol as any).asyncDispose ??= Symbol("Symbol.asyncDispose");
