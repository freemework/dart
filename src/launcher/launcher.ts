import {
	FException,
	FConfiguration,
	FExecutionContext,
	FCancellationTokenSource,
	FCancellationTokenSourceManual,
	FLogger,
	FExecutionContextLogger,
	FExecutionContextCancellation,
	FExceptionCancelled
} from "@freemework/common";

import { FLauncherException } from "./FLauncherException";

import {
	fileConfiguration, tomlFileConfiguration,
	chainConfiguration, envConfiguration,
	secretsDirectoryConfiguration
} from "../configuration";

export function Flauncher(runtimeFactory: Flauncher.ConfigLessRuntimeFactory): void;

/**
 * Launch an application using `defaultConfigurationLoader`
 * @param configurationParser User's function that provides configuration parser
 * @param runtimeFactory User's function that compose and start runtime
 */
export function Flauncher<TConfiguration>(
	configurationParser: Flauncher.ConfigurationParser<TConfiguration>,
	runtimeFactory: Flauncher.FLauncherRuntimeFactory<TConfiguration>
): void;

/**
 * Launch an application
 * @param configurationLoader User's function that provides configuration loader
 * @param configurationParser User's function that provides configuration parser
 * @param runtimeFactory User's function that compose and start runtime
 */
export function Flauncher<TConfiguration>(
	configurationLoader: Flauncher.RawConfigurationLoader,
	configurationParser: Flauncher.ConfigurationParser<TConfiguration>,
	runtimeFactory: Flauncher.FLauncherRuntimeFactory<TConfiguration>
): void;

export function Flauncher<TConfiguration>(...args: Array<any>): void {
	const log: FLogger = FLogger.Console;

	async function run() {
		const cancellationTokenSource: FCancellationTokenSource = new FCancellationTokenSourceManual();
		const executionContext: FExecutionContext = new FExecutionContextLogger(
			new FExecutionContextCancellation(
				FExecutionContext.Empty,
				cancellationTokenSource.token
			),
			log
		);

		process.on("unhandledRejection", e => {
			const ex: FException = FException.wrapIfNeeded(e);
			log.debug("Unhandled Rejection", ex);
			log.fatal(`Unhandled Rejection. ${ex.constructor.name}: ${ex.message}`);
			fireShutdownHooks().finally(function () {
				process.exit(255);
			});
		});

		let destroyRequestCount = 0;
		const shutdownSignals: Array<NodeJS.Signals> = ["SIGTERM", "SIGINT"];


		let runtimeStuff:
			{
				readonly loader: Flauncher.RawConfigurationLoader;
				readonly parser: Flauncher.ConfigurationParser<TConfiguration>;
				readonly runtimeFactory: Flauncher.FLauncherRuntimeFactory<TConfiguration>
			}
			| { readonly parser: null; readonly runtimeFactory: Flauncher.ConfigLessRuntimeFactory };

		if (args.length === 3 && typeof args[0] === "function" && typeof args[1] === "function") {
			runtimeStuff = Object.freeze({
				loader: args[0], parser: args[1], runtimeFactory: args[2]
			});
		} else if (args.length === 2 && typeof args[0] === "function" && typeof args[1] === "function") {
			runtimeStuff = Object.freeze({
				loader: defaultConfigurationLoader, parser: args[0], runtimeFactory: args[1]
			});
		} else if (args.length === 1 && typeof args[0] === "function") {
			runtimeStuff = Object.freeze({
				parser: null, runtimeFactory: args[0]
			});
		} else {
			throw new Error("Wrong arguments");
		}

		let runtime: Flauncher.FLauncherRuntime;
		try {
			if (runtimeStuff.parser === null) {
				runtime = await runtimeStuff.runtimeFactory(executionContext);
			} else {
				const rawConfiguration: FConfiguration = await runtimeStuff.loader(executionContext);
				const parsedConfiguration: TConfiguration = runtimeStuff.parser(rawConfiguration);
				runtime = await runtimeStuff.runtimeFactory(executionContext, parsedConfiguration);
			}

			shutdownSignals.forEach((signal: NodeJS.Signals) => process.on(signal, () => gracefulShutdown(signal)));

		} catch (e) {
			const ex: FException = FException.wrapIfNeeded(e);
			if (ex instanceof FExceptionCancelled) {
				log.warn("Runtime initialization was cancelled by user");
				fireShutdownHooks().finally(function () {
					process.exit(0);
				});
			}
			if (log.isFatalEnabled) {
				if (e instanceof Error) {
					log.fatal(`Runtime initialization failed with ${e.constructor.name}: ${e.message}`);
				} else {
					log.fatal(`Runtime initialization failed with error: ${e}`);
				}
			}
			log.debug("Runtime initialization failed", ex);
			fireShutdownHooks().finally(function () {
				process.exit(127);
			});
		}

		async function gracefulShutdown(signal: string) {
			if (destroyRequestCount++ === 0) {
				cancellationTokenSource.cancel();

				if (log.isInfoEnabled) {
					log.info(`Interrupt signal received: ${signal}`);
				}
				await runtime.destroy();
				await fireShutdownHooks();
				process.exit(0);
			} else {
				if (log.isInfoEnabled) {
					log.info(`Interrupt signal (${destroyRequestCount}) received: ${signal}`);
				}
			}
		}
	}

	log.info("Starting application...");
	run()
		.then(() => {
			if (log.isInfoEnabled) {
				log.info(`Application was started. Process ID: ${process.pid}`);
			}
		})
		.catch(e => {
			const ex: FException = FException.wrapIfNeeded(e);
			if (log.isFatalEnabled) {
				if (ex instanceof FLauncherException) {
					log.fatal(`Cannot launch the application due an ${e.constructor.name}: ${e.message}`);
				} else {
					log.fatal(ex.message);
					log.debug(ex.message, ex);
				}
			}
			if (process.env.NODE_ENV === "development") {
				setTimeout(() => {
					fireShutdownHooks().finally(function () {
						process.exit(127);
					});
				}, 1000);
			} else {
				fireShutdownHooks().finally(function () {
					process.exit(127);
				});
			}
		});
}

export namespace Flauncher {
	export interface FLauncherRuntime {
		destroy(): Promise<void>;
	}
	
	export type RawConfigurationLoader = (executionContext: FExecutionContext) => Promise<FConfiguration>;
	export type ConfigurationParser<TConfiguration> = (rawConfiguration: FConfiguration) => TConfiguration;
	
	export type FLauncherRuntimeFactory<TConfiguration> = (executionContext: FExecutionContext, configuration: TConfiguration) => Promise<FLauncherRuntime>;
	export type ConfigLessRuntimeFactory = (executionContext: FExecutionContext) => Promise<FLauncherRuntime>;
	
}

export async function defaultConfigurationLoader(executionContext: FExecutionContext): Promise<FConfiguration> {
	const chainItems: Array<FConfiguration> = [];
	for (const arg of process.argv) {
		if (arg.startsWith(defaultConfigurationLoader.CONFIG_FILE_ARG)) {
			const configFile = arg.substring(defaultConfigurationLoader.CONFIG_FILE_ARG.length);
			const fileConf: FConfiguration = await fileConfiguration(configFile);
			chainItems.push(fileConf);
		} else if (arg.startsWith(defaultConfigurationLoader.CONFIG_TOML_FILE_ARG)) {
			const configFile = arg.substring(defaultConfigurationLoader.CONFIG_TOML_FILE_ARG.length);
			const fileConf: FConfiguration = await tomlFileConfiguration(configFile);
			chainItems.push(fileConf);
		} else if (arg.startsWith(defaultConfigurationLoader.CONFIG_SECRET_DIR_ARG)) {
			const secretsDir = arg.substring(defaultConfigurationLoader.CONFIG_SECRET_DIR_ARG.length);
			const secretsConfiguration = await secretsDirectoryConfiguration(secretsDir);
			chainItems.push(secretsConfiguration);
		} else if (arg === defaultConfigurationLoader.CONFIG_ENV_ARG) {
			const envConf = envConfiguration();
			chainItems.push(envConf);
		}
	}

	if (chainItems.length === 0) {
		throw new FLauncherException(
			"Missing configuration. Please provide at least one of: " +
			`${defaultConfigurationLoader.CONFIG_ENV_ARG}, ${defaultConfigurationLoader.CONFIG_FILE_ARG}, ${defaultConfigurationLoader.CONFIG_TOML_FILE_ARG}, ${defaultConfigurationLoader.CONFIG_SECRET_DIR_ARG}`
		);
	}

	chainItems.reverse();
	const rawConfiguration: FConfiguration = chainConfiguration(...chainItems);

	return rawConfiguration;
}
export namespace defaultConfigurationLoader {
	export const CONFIG_ENV_ARG = "--config-env";
	export const CONFIG_FILE_ARG = "--config-file=";
	export const CONFIG_TOML_FILE_ARG = "--config-toml-file=";
	export const CONFIG_SECRET_DIR_ARG = "--config-secrets-dir=";
}

export function registerShutdownHook(cb: () => Promise<void>): void {
	shutdownHooks.push(cb);
}

const shutdownHooks: Array<() => Promise<void>> = [];
async function fireShutdownHooks(): Promise<void> {
	if (shutdownHooks.length > 0) {
		const log = FLogger.Console.getLogger("launcher.fireShutdownHooks");
		log.debug("Executing shutdown hooks...");
		const shutdownHooksCopy = [...shutdownHooks];
		do {
			const cb: () => Promise<void> = shutdownHooksCopy.pop()!;
			try {
				await cb();
			} catch (e) {
				const ex: FException = FException.wrapIfNeeded(e);
				log.warn(`An shutdown hook was finished with error: ${ex.message}`);
				log.debug("An shutdown hook was finished with error", ex);
			}
		} while (shutdownHooksCopy.length > 0);
	}
}
