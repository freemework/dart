import { readFileSync } from "fs";

export function FModuleVersionGuard(packageInfo: { readonly name: string; readonly version: string; }): void {
	const { name: packageName, version: packageVersion } = packageInfo;
	const G: any = global || window || undefined;
	if (G !== undefined) {
		const PACKAGE_GUARD: symbol = Symbol.for(packageName);
		if (PACKAGE_GUARD in G) {
			const conflictVersion = G[PACKAGE_GUARD];
			const msg = `Conflict module version. Looks like two different version of package ${packageName} was loaded inside the process: ${conflictVersion} and ${packageVersion}.`;
			if (process !== undefined && process.env !== undefined && process.env["NODE_ALLOW_CONFLICT_MODULES"] === "1") {
				console.warn(msg + " This treats as warning because NODE_ALLOW_CONFLICT_MODULES is set.");
			} else {
				throw new Error(msg + " Use NODE_ALLOW_CONFLICT_MODULES=\"1\" to treats this error as warning.");
			}
		} else {
			G[PACKAGE_GUARD] = packageVersion;
		}
	}
}
FModuleVersionGuard(JSON.parse(readFileSync("package.json", "utf-8")));

export * from "./cancellation/index.js";
export * from "./configuration/index.js";
export * from "./channel/index.js";
export * from "./exception/index.js";
export * from "./execution_context/index.js";
export * from "./http/index.js";
export * from "./lifecycle/index.js";
export * from "./limit/index.js";
export * from "./logging/index.js";
export * from "./primitive/index.js";
export * from "./sql/index.js";
export * from "./util/index.js";

export { FEnsure, FEnsureException } from "./f_ensure.js";
