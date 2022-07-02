const { name: packageName, version: packageVersion } = require("../package.json");

export function FAssertModuleVersion(packageInfo: { readonly name: string; readonly version: string; }) {
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
FAssertModuleVersion(require("../package.json"));

export * from "./cancellation";
export * from "./execution_context";
export * from "./lifecycle";

export { FAggregateException } from "./FAggregateException";
export { FArgumentException } from "./FArgumentException";
export { FConfiguration } from "./FConfiguration";
export { FConfigurationException } from "./FConfigurationException";
// export { FContextLogger, FContextLoggerProperties, FContextLoggerProperty } from "./FContextLogger";
export { FException } from "./FException";
export { FInvalidOperationException } from "./FInvalidOperationException";
export { FLogger } from "./FLogger";
export { Fsleep } from "./Fsleep";
