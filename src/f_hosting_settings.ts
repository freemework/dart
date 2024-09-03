import { FConfiguration, FLogger } from "@freemework/common";

export namespace FHostingSettings {
	export type WebServer = UnsecuredWebServer | SecuredWebServer;

	export interface WebServerBase {
		readonly name: string;
		readonly listenHost: string;
		readonly listenPort: number;
		readonly log?: FLogger;
		/**
		 * See http://expressjs.com/en/4x/api.html#trust.proxy.options.table
		 */
		readonly trustProxy?: boolean | "loopback" | "linklocal" | "uniquelocal";
		/**
		 * @default true
		 * 
		 * Handle HTTP Upgrade to switch a connection into a WebSocket.
		 * See more https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Upgrade
		 */
		readonly handleUpgrade?: boolean;
	}

	export interface UnsecuredBaseWebServer extends WebServerBase {
		readonly type: "http";
	}
	export interface UnsecuredCommonWebServer extends UnsecuredBaseWebServer {
	}
	export interface UnsecuredXfccWebServer extends UnsecuredBaseWebServer {
		readonly caCertificates: Buffer | string | Array<string | Buffer>;
		readonly clientCertificateMode: ClientCertificateMode.XFCC;
	}
	export type UnsecuredWebServer = UnsecuredCommonWebServer | UnsecuredXfccWebServer;

	export interface SecuredBaseWebServer extends WebServerBase {
		readonly type: "https";
		/**
		 * Certificate's data as Buffer or Path to file
		 */
		readonly serverCertificate: Buffer | string;
		/**
		 * Private Key's data as Buffer or Path to file
		 */
		readonly serverKey: Buffer | string;
		readonly serverKeyPassword?: string;
	}
	export interface SecuredCommonWebServer extends SecuredBaseWebServer {
		/**
		 * Certificate's data as Buffer or Path to file
		 */
		readonly caCertificates?: Buffer | string | Array<string | Buffer>;
		readonly clientCertificateMode: ClientCertificateMode.REQUEST | ClientCertificateMode.NONE;
	}
	export interface SecuredClientWebServer extends SecuredBaseWebServer {
		/**
		 * Certificate's data as Buffer or Path to file
		 */
		readonly caCertificates: Buffer | string | Array<string | Buffer>;
		readonly clientCertificateMode: ClientCertificateMode.TRUST | ClientCertificateMode.XFCC;
	}
	export type SecuredWebServer = SecuredCommonWebServer | SecuredClientWebServer;

	export enum ClientCertificateMode {
		/**
		 * The server will NOT request a certificate from clients that connect WILL NOT validate the certificate.
		 */
		NONE = "none",

		/**
		 * The server WILL request a certificate from clients that connect and WILL NOT validate the certificate.
		 * Validate the certificate by yourself.
		 */
		REQUEST = "request",

		/**
		 * The server WILL request a certificate from clients that connect and validate the certificate
		 * Rejects untrusted certificate
		 */
		TRUST = "trust",

		/**
		 * The server WILL retrieve a certificate from the HTTP header X-Forwarded-Client-Cert and validate the certificate.
		 * Rejects untrusted certificate
		 * Hist: Use $ssl_client_escaped_cert NGINX variable to set X-Forwarded-Client-Cert header inside configuration.
		 */
		XFCC = "xfcc"
	}

	export interface ServerEndpoint {
		readonly servers: Array<string>;
	}

	export interface BindEndpoint {
		readonly bindPath: string;
	}

	export interface WebSocketEndpoint extends BindEndpoint {
		readonly defaultProtocol: string;
		readonly allowedProtocols?: ReadonlyArray<string>;
	}

	export function fromConfigurationWebServer(configuration: FConfiguration, serverName: string): WebServer {
		const serverType: string = configuration.get("type").asString;
		const handleUpgrade: boolean = configuration.get("handleUpgrade", "true").asBoolean;
		switch (serverType) {
			case "http": {
				let trustProxy: boolean | "loopback" | "linklocal" | "uniquelocal" | null = null;
				if (configuration.has("trustProxy")) {
					trustProxy = FHostingSettings.fromConfigurationTrustProxy(configuration.get("trustProxy").asString);
				}

				if (configuration.has("clientCertificateMode")) {
					const clientCertificateMode = configuration.get("clientCertificateMode").asString;
					if (clientCertificateMode !== FHostingSettings.ClientCertificateMode.XFCC) {
						throw new Error(`Unsupported value for clientCertificateMode: ${clientCertificateMode}`);
					}

					const serverOpts: UnsecuredXfccWebServer = {
						type: serverType,
						name: serverName,
						handleUpgrade,
						listenHost: configuration.get("listenHost").asString,
						listenPort: configuration.get("listenPort").asIntegerPositive,
						...(trustProxy !== null ? { trustProxy } : {}),
						clientCertificateMode,
						caCertificates: configuration.get("caCertificates").asString // caCertificates requires for validate client certificates
					};

					return serverOpts;
				} else {
					const serverOpts: UnsecuredCommonWebServer = {
						type: serverType,
						name: serverName,
						handleUpgrade,
						listenHost: configuration.get("listenHost").asString,
						listenPort: configuration.get("listenPort").asIntegerPositive,
						...(trustProxy !== null ? { trustProxy } : {}),
					};

					return serverOpts;
				}
			}
			case "https": {
				let serverOpts: SecuredWebServer;

				let trustProxy: boolean | "loopback" | "linklocal" | "uniquelocal" | null = null;
				if (configuration.has("trustProxy")) {
					trustProxy = FHostingSettings.fromConfigurationTrustProxy(configuration.get("trustProxy").asString);
				}

				let serverKeyPassword: string | null = null;
				if (configuration.has("serverKeyPassword")) {
					serverKeyPassword = configuration.get("serverKeyPassword").asString;
				}

				const clientCertMode: string = configuration.get("clientCertificateMode").asString;
				switch (clientCertMode) {
					case ClientCertificateMode.NONE:
					case ClientCertificateMode.REQUEST:
						if (configuration.has("caCertificates")) {
							serverOpts = {
								type: serverType,
								name: serverName,
								handleUpgrade,
								listenHost: configuration.get("listenHost").asString,
								listenPort: configuration.get("listenPort").asInteger,
								serverCertificate: configuration.get("serverCertificate").asString,
								serverKey: configuration.get("serverKey").asString,
								...(serverKeyPassword !== null ? { serverKeyPassword } : {}),
								...(trustProxy !== null ? { trustProxy } : {}),
								clientCertificateMode: clientCertMode,
								caCertificates: configuration.get("caCertificates").asString
							};
						} else {
							serverOpts = {
								type: serverType,
								name: serverName,
								handleUpgrade,
								listenHost: configuration.get("listenHost").asString,
								listenPort: configuration.get("listenPort").asIntegerPositive,
								serverCertificate: configuration.get("serverCertificate").asString,
								serverKey: configuration.get("serverKey").asString,
								...(serverKeyPassword !== null ? { serverKeyPassword } : {}),
								...(trustProxy !== null ? { trustProxy } : {}),
								clientCertificateMode: clientCertMode,
							};
						}
						break;
					case ClientCertificateMode.TRUST:
					case ClientCertificateMode.XFCC:
						serverOpts = {
							type: serverType,
							name: serverName,
							handleUpgrade,
							listenHost: configuration.get("listenHost").asString,
							listenPort: configuration.get("listenPort").asIntegerPositive,
							caCertificates: configuration.get("caCertificates").asString,
							serverCertificate: configuration.get("serverCertificate").asString,
							serverKey: configuration.get("serverKey").asString,
							...(serverKeyPassword !== null ? { serverKeyPassword } : {}),
							...(trustProxy !== null ? { trustProxy } : {}),
							clientCertificateMode: clientCertMode
						};
						break;
					default:
						throw new Error(`Unsupported value for clientCertificateMode: ${clientCertMode}`);
				}

				return serverOpts;
			}
			default:
				throw new Error(`Non supported server type: ${serverType}`);
		}
	}

	/**
	 * @deprecated Use FHostingSettings.fromConfigurationWebServer instead
	 */
	export const parseWebServer = fromConfigurationWebServer;

	export function fromConfigurationWebServers(configuration: FConfiguration): Array<FHostingSettings.WebServer> {
		const serverConfigurations: Array<FConfiguration> = configuration.getArray("server");
		const servers: Array<FHostingSettings.WebServer> = serverConfigurations.map(serverConfiguration => {
			let serverName: string = "Unnamed";
			const { namespaceFull } = serverConfiguration;
			if (namespaceFull !== null) {
				const configurationNamespaceParts: Array<string> = namespaceFull.split(".");
				if (configurationNamespaceParts.length > 0) {
					// Use name of configuration index
					serverName = configurationNamespaceParts[configurationNamespaceParts.length - 1]!;
				}
			}

			return FHostingSettings.fromConfigurationWebServer(
				serverConfiguration,
				serverName
			);
		});
		return servers;
	}

	/**
	 * @deprecated Use FHostingSettings.fromConfigurationWebServers instead
	 */
	export const parseWebServers = fromConfigurationWebServers;

	export function fromConfigurationTrustProxy(val: string): boolean | "loopback" | "linklocal" | "uniquelocal" {
		switch (val) {
			case "true": return true;
			case "false": return false;
			case "loopback":
			case "linklocal":
			case "uniquelocal":
				return val;
			default:
				throw new Error(`Wrong value for trustProxy: ${val}`);
		}
	}

	/**
	 * @deprecated Use FHostingSettings.fromConfigurationTrustProxy instead
	 */
	export const parseTrustProxy = fromConfigurationTrustProxy;
}

/**
 * @deprecated Use FHostingSettings instead
 */
export namespace FHostingConfiguration {
	/**
	 * @deprecated Use FHostingSettings.WebServer instead
	 */
	export type WebServer = FHostingSettings.WebServer;

	/**
	 * @deprecated Use FHostingSettings.WebServerBase instead
	 */
	export type WebServerBase = FHostingSettings.WebServerBase;

	/**
	 * @deprecated Use FHostingSettings.UnsecuredBaseWebServer instead
	 */
	export type UnsecuredBaseWebServer = FHostingSettings.UnsecuredBaseWebServer;

	/**
	 * @deprecated Use FHostingSettings.UnsecuredCommonWebServer instead
	 */
	export type UnsecuredCommonWebServer = FHostingSettings.UnsecuredCommonWebServer;

	/**
	 * @deprecated Use FHostingSettings.UnsecuredXfccWebServer instead
	 */
	export type UnsecuredXfccWebServer = FHostingSettings.UnsecuredXfccWebServer;

	/**
	 * @deprecated Use FHostingSettings.UnsecuredWebServer instead
	 */
	export type UnsecuredWebServer = FHostingSettings.UnsecuredWebServer;

	/**
	 * @deprecated Use FHostingSettings.SecuredBaseWebServer instead
	 */
	export type SecuredBaseWebServer = FHostingSettings.SecuredBaseWebServer;

	/**
	 * @deprecated Use FHostingSettings.SecuredCommonWebServer instead
	 */
	export type SecuredCommonWebServer = FHostingSettings.SecuredCommonWebServer;

	/**
	 * @deprecated Use FHostingSettings.SecuredClientWebServer instead
	 */
	export type SecuredClientWebServer = FHostingSettings.SecuredClientWebServer;

	/**
	 * @deprecated Use FHostingSettings.SecuredWebServer instead
	 */
	export type SecuredWebServer = FHostingSettings.SecuredWebServer;

	/**
	 * @deprecated Use FHostingSettings.ClientCertificateMode instead
	 */
	export const ClientCertificateMode = FHostingSettings.ClientCertificateMode;

	/**
	 * @deprecated Use FHostingSettings.ServerEndpoint instead
	 */
	export type ServerEndpoint = FHostingSettings.ServerEndpoint;

	/**
	 * @deprecated Use FHostingSettings.BindEndpoint instead
	 */
	export type BindEndpoint = FHostingSettings.BindEndpoint;

	/**
	 * @deprecated Use FHostingSettings.WebSocketEndpoint instead
	 */
	export type WebSocketEndpoint = FHostingSettings.WebSocketEndpoint;

	/**
	 * @deprecated Use FHostingSettings.parseWebServer instead
	 */
	export const parseWebServer = FHostingSettings.parseWebServer;

	/**
	 * @deprecated Use FHostingSettings.parseWebServers instead
	 */
	export const parseWebServers = FHostingSettings.parseWebServers;

	/**
	 * @deprecated Use FHostingSettings.parseTrustProxy instead
	 */
	export const parseTrustProxy = FHostingSettings.parseTrustProxy;
}
