export function FmoduleVersionGuard(packageInfo: { readonly name: string; readonly version: string; }) {
	const { name: packageName, version: packageVersion } = packageInfo;
	const G: any = global || window || {};
	const PACKAGE_GUARD: symbol = Symbol.for(packageName);
	if (PACKAGE_GUARD in G) {
		const conflictVersion = G[PACKAGE_GUARD];
		// tslint:disable-next-line: max-line-length
		const msg = `Conflict module version. Looks like two different version of package ${packageName} was loaded inside the process: ${conflictVersion} and ${packageVersion}.`;
		if (process !== undefined && process.env !== undefined && process.env.NODE_ALLOW_CONFLICT_MODULES === "1") {
			console.warn(msg + " This treats as warning because NODE_ALLOW_CONFLICT_MODULES is set.");
		} else {
			throw new Error(msg + " Use NODE_ALLOW_CONFLICT_MODULES=\"1\" to treats this error as warning.");
		}
	} else {
		G[PACKAGE_GUARD] = packageVersion;
	}
}
FmoduleVersionGuard(require("../package.json"));

export * from "./cancellation";
export * from "./configuration";
export * from "./channel";
export * from "./exception";
export * from "./execution_context";
export * from "./http";
export * from "./lifecycle";
export * from "./limit";
export * from "./logging";
export * from "./primitive";
export * from "./sql";

export { FEnsure, FEnsureException } from "./FEnsure";
