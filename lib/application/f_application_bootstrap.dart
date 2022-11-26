// // Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// // file for details. All rights reserved. Use of this source code is governed
// // by a BSD-style license that can be found in the LICENSE file.

// import "dart:async";

// import "package:meta/meta.dart";

// import "../configuration/FConfiguration.dart";
// import "../exception/FExceptionInvalidOperation.dart";
// import "../execution_context/FCancellationExecutionContext.dart";
// import "../lifecycle/FInitableBase.dart" show FInitableBase;

// abstract class FApplicationBootstrap<TApplicationConfiguration>
//     extends FInitableBase {
//   static void run<
//       TApplicationConfiguration,
//       TApplicationBootstrap extends FApplicationBootstrap<
//           TApplicationConfiguration>>(
//     TApplicationBootstrap app, [
//     FCancellationExecutionContext? applicationExecutionContext,
//   ]) {
//     unawaited(
//       Future<void>.sync(
//         () async {
//           await app.init(applicationExecutionContext ??
//               FCancellationExecutionContext.Default);

//           try {
//             await app.onRun();
//           } finally {
//             await app.dispose();
//           }
//         },
//       ),
//     );
//   }

//   TApplicationConfiguration get applicationConfiguration {
//     final applicationConfiguration = this._applicationConfiguration;
//     if (applicationConfiguration == null) {
//       throw FExceptionInvalidOperation(
//           "Wrong operation at current state. The applicationConfiguration is not available yet. Did you call init()?");
//     }
//     return applicationConfiguration;
//   }

//   @override
//   @protected
//   FutureOr<void> onDispose() {
//     // NOP
//   }

//   @override
//   @protected
//   FutureOr<void> onInit() async {
//     final FConfiguration configuration =
//         await this.loadConfiguration(this.initExecutionContext);

//     this._applicationConfiguration =
//         await this.parseConfiguration(this.initExecutionContext, configuration);
//   }

//   @protected
//   Future<void> onRun();

//   @protected
//   Future<FConfiguration> loadConfiguration(
//     FCancellationExecutionContext executionContext,
//   );

//   @protected
//   Future<TApplicationConfiguration> parseConfiguration(
//     FCancellationExecutionContext executionContext,
//     FConfiguration configuration,
//   );

//   TApplicationConfiguration? _applicationConfiguration;
// }

// // import {
// // 	FException,
// // 	FConfiguration,
// // 	FCancellationExecutionContext,
// // 	FCancellationTokenSource,
// // 	FCancellationTokenSourceManual,
// // 	FLogger,
// // 	FCancellationExecutionContextLogger,
// // 	FCancellationExecutionContextCancellation,
// // 	FCancellationException
// // } from "@freemework/common";

// // import { FLauncherException } from "./FLauncherException";

// // import {
// // 	fileConfiguration, tomlFileConfiguration,
// // 	chainConfiguration, envConfiguration,
// // 	secretsDirectoryConfiguration
// // } from "../configuration";

// // export function Flauncher(runtimeFactory: FConfigLessRuntimeFactory): void;

// // /**
// //  * Launch an application using `defaultConfigurationLoader`
// //  * @param configurationParser User's function that provides configuration parser
// //  * @param runtimeFactory User's function that compose and start runtime
// //  */
// // export function Flauncher<TConfiguration>(
// // 	configurationParser: ConfigurationParser<TConfiguration>,
// // 	runtimeFactory: FLauncherRuntimeFactory<TConfiguration>
// // ): void;

// // /**
// //  * Launch an application
// //  * @param configurationLoader User's function that provides configuration loader
// //  * @param configurationParser User's function that provides configuration parser
// //  * @param runtimeFactory User's function that compose and start runtime
// //  */
// // export function Flauncher<TConfiguration>(
// // 	configurationLoader: RawConfigurationLoader,
// // 	configurationParser: ConfigurationParser<TConfiguration>,
// // 	runtimeFactory: FLauncherRuntimeFactory<TConfiguration>
// // ): void;

// // export function Flauncher<TConfiguration>(...args: Array<any>): void {
// // 	const log: FLogger = FLogger.Console;

// // 	async function run() {
// // 		const cancellationTokenSource: FCancellationTokenSource = new FCancellationTokenSourceManual();
// // 		const executionContext: FCancellationExecutionContext = new FCancellationExecutionContextLogger(
// // 			new FCancellationExecutionContextCancellation(
// // 				FCancellationExecutionContext.Empty,
// // 				cancellationTokenSource.token
// // 			),
// // 			log
// // 		);

// // 		process.on("unhandledRejection", e => {
// // 			const ex: FException = FException.wrapIfNeeded(e);
// // 			log.debug("Unhandled Rejection", ex);
// // 			log.fatal(`Unhandled Rejection. ${ex.constructor.name}: ${ex.message}`);
// // 			fireShutdownHooks().finally(function () {
// // 				process.exit(255);
// // 			});
// // 		});

// // 		let destroyRequestCount = 0;
// // 		const shutdownSignals: Array<NodeJS.Signals> = ["SIGTERM", "SIGINT"];

// // 		let runtimeStuff:
// // 			{
// // 				readonly loader: RawConfigurationLoader;
// // 				readonly parser: ConfigurationParser<TConfiguration>;
// // 				readonly runtimeFactory: FLauncherRuntimeFactory<TConfiguration>
// // 			}
// // 			| { readonly parser: null; readonly runtimeFactory: FConfigLessRuntimeFactory };

// // 		if (args.length === 3 && typeof args[0] === "function" && typeof args[1] === "function") {
// // 			runtimeStuff = Object.freeze({
// // 				loader: args[0], parser: args[1], runtimeFactory: args[2]
// // 			});
// // 		} else if (args.length === 2 && typeof args[0] === "function" && typeof args[1] === "function") {
// // 			runtimeStuff = Object.freeze({
// // 				loader: defaultConfigurationLoader, parser: args[0], runtimeFactory: args[1]
// // 			});
// // 		} else if (args.length === 1 && typeof args[0] === "function") {
// // 			runtimeStuff = Object.freeze({
// // 				parser: null, runtimeFactory: args[0]
// // 			});
// // 		} else {
// // 			throw new Error("Wrong arguments");
// // 		}

// // 		let runtime: FLauncherRuntime;
// // 		try {
// // 			if (runtimeStuff.parser === null) {
// // 				runtime = await runtimeStuff.runtimeFactory(executionContext);
// // 			} else {
// // 				const rawConfiguration: FConfiguration = await runtimeStuff.loader(executionContext);
// // 				const parsedConfiguration: TConfiguration = runtimeStuff.parser(rawConfiguration);
// // 				runtime = await runtimeStuff.runtimeFactory(executionContext, parsedConfiguration);
// // 			}

// // 			shutdownSignals.forEach((signal: NodeJS.Signals) => process.on(signal, () => gracefulShutdown(signal)));

// // 		} catch (e) {
// // 			const ex: FException = FException.wrapIfNeeded(e);
// // 			if (ex instanceof FCancellationException) {
// // 				log.warn("Runtime initialization was cancelled by user");
// // 				fireShutdownHooks().finally(function () {
// // 					process.exit(0);
// // 				});
// // 			}
// // 			if (log.isFatalEnabled) {
// // 				if (e instanceof Error) {
// // 					log.fatal(`Runtime initialization failed with ${e.constructor.name}: ${e.message}`);
// // 				} else {
// // 					log.fatal(`Runtime initialization failed with error: ${e}`);
// // 				}
// // 			}
// // 			log.debug("Runtime initialization failed", ex);
// // 			fireShutdownHooks().finally(function () {
// // 				process.exit(127);
// // 			});
// // 		}

// // 		async function gracefulShutdown(signal: string) {
// // 			if (destroyRequestCount++ === 0) {
// // 				cancellationTokenSource.cancel();

// // 				if (log.isInfoEnabled) {
// // 					log.info(`Interrupt signal received: ${signal}`);
// // 				}
// // 				await runtime.destroy();
// // 				await fireShutdownHooks();
// // 				process.exit(0);
// // 			} else {
// // 				if (log.isInfoEnabled) {
// // 					log.info(`Interrupt signal (${destroyRequestCount}) received: ${signal}`);
// // 				}
// // 			}
// // 		}
// // 	}

// // 	log.info("Starting application...");
// // 	run()
// // 		.then(() => {
// // 			if (log.isInfoEnabled) {
// // 				log.info(`Application was started. Process ID: ${process.pid}`);
// // 			}
// // 		})
// // 		.catch(e => {
// // 			const ex: FException = FException.wrapIfNeeded(e);
// // 			if (log.isFatalEnabled) {
// // 				if (ex instanceof FLauncherException) {
// // 					log.fatal(`Cannot launch the application due an ${e.constructor.name}: ${e.message}`);
// // 				} else {
// // 					log.fatal(ex.message);
// // 					log.debug(ex.message, ex);
// // 				}
// // 			}
// // 			if (process.env.NODE_ENV === "development") {
// // 				setTimeout(() => {
// // 					fireShutdownHooks().finally(function () {
// // 						process.exit(127);
// // 					});
// // 				}, 1000);
// // 			} else {
// // 				fireShutdownHooks().finally(function () {
// // 					process.exit(127);
// // 				});
// // 			}
// // 		});
// // }

// // export interface FLauncherRuntime {
// // 	destroy(): Promise<void>;
// // }

// // export type RawConfigurationLoader = (executionContext: FCancellationExecutionContext) => Promise<FConfiguration>;
// // export type ConfigurationParser<TConfiguration> = (rawConfiguration: FConfiguration) => TConfiguration;

// // export type FLauncherRuntimeFactory<TConfiguration> = (executionContext: FCancellationExecutionContext, configuration: TConfiguration) => Promise<FLauncherRuntime>;
// // export type FConfigLessRuntimeFactory = (executionContext: FCancellationExecutionContext) => Promise<FLauncherRuntime>;

// // export async function defaultConfigurationLoader(executionContext: FCancellationExecutionContext): Promise<FConfiguration> {
// // 	const chainItems: Array<FConfiguration> = [];
// // 	for (const arg of process.argv) {
// // 		if (arg.startsWith(defaultConfigurationLoader.CONFIG_FILE_ARG)) {
// // 			const configFile = arg.substring(defaultConfigurationLoader.CONFIG_FILE_ARG.length);
// // 			const fileConf: FConfiguration = await fileConfiguration(configFile);
// // 			chainItems.push(fileConf);
// // 		} else if (arg.startsWith(defaultConfigurationLoader.CONFIG_TOML_FILE_ARG)) {
// // 			const configFile = arg.substring(defaultConfigurationLoader.CONFIG_TOML_FILE_ARG.length);
// // 			const fileConf: FConfiguration = await tomlFileConfiguration(configFile);
// // 			chainItems.push(fileConf);
// // 		} else if (arg.startsWith(defaultConfigurationLoader.CONFIG_SECRET_DIR_ARG)) {
// // 			const secretsDir = arg.substring(defaultConfigurationLoader.CONFIG_SECRET_DIR_ARG.length);
// // 			const secretsConfiguration = await secretsDirectoryConfiguration(secretsDir);
// // 			chainItems.push(secretsConfiguration);
// // 		} else if (arg === defaultConfigurationLoader.CONFIG_ENV_ARG) {
// // 			const envConf = envConfiguration();
// // 			chainItems.push(envConf);
// // 		}
// // 	}

// // 	if (chainItems.length === 0) {
// // 		throw new FLauncherException(
// // 			"Missing configuration. Please provide at least one of: " +
// // 			`${defaultConfigurationLoader.CONFIG_ENV_ARG}, ${defaultConfigurationLoader.CONFIG_FILE_ARG}, ${defaultConfigurationLoader.CONFIG_TOML_FILE_ARG}, ${defaultConfigurationLoader.CONFIG_SECRET_DIR_ARG}`
// // 		);
// // 	}

// // 	chainItems.reverse();
// // 	const rawConfiguration: FConfiguration = chainConfiguration(...chainItems);

// // 	return rawConfiguration;
// // }
// // export namespace defaultConfigurationLoader {
// // 	export const CONFIG_ENV_ARG = "--config-env";
// // 	export const CONFIG_FILE_ARG = "--config-file=";
// // 	export const CONFIG_TOML_FILE_ARG = "--config-toml-file=";
// // 	export const CONFIG_SECRET_DIR_ARG = "--config-secrets-dir=";
// // }

// // export function registerShutdownHook(cb: () => Promise<void>): void {
// // 	shutdownHooks.push(cb);
// // }

// // const shutdownHooks: Array<() => Promise<void>> = [];
// // async function fireShutdownHooks(): Promise<void> {
// // 	if (shutdownHooks.length > 0) {
// // 		const log = FLogger.Console.getLogger("launcher.fireShutdownHooks");
// // 		log.debug("Executing shutdown hooks...");
// // 		const shutdownHooksCopy = [...shutdownHooks];
// // 		do {
// // 			const cb: () => Promise<void> = shutdownHooksCopy.pop()!;
// // 			try {
// // 				await cb();
// // 			} catch (e) {
// // 				const ex: FException = FException.wrapIfNeeded(e);
// // 				log.warn(`An shutdown hook was finished with error: ${ex.message}`);
// // 				log.debug("An shutdown hook was finished with error", ex);
// // 			}
// // 		} while (shutdownHooksCopy.length > 0);
// // 	}
// // }
