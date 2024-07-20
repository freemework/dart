import {
	FModuleVersionGuard,
	FDisposable,
	FExecutionContext,
	FCancellationExecutionContext,
	FChannelPublisher,
	FChannelSubscriber,
	FCancellationToken,
	FCancellationTokenSourceManual,
	FException,
	FExceptionInvalidOperation,
	FExceptionAggregate,
	FInitableBase,
	FLogger,
} from "@freemework/common";

import express from 'express';
import fs from "fs";
import net from "net";
import http from "http";
import https from "https";
// import { unescape as urlDecode } from "querystring";
import WebSocket from "ws";
// import { pki } from "node-forge";

import { FHttpRequestCancellationToken } from "./FHttpRequestCancellationToken.js";
import { FHostingConfiguration } from "./FHostingConfiguration.js";

import { packageInfo } from "./package_info.js";
FModuleVersionGuard(packageInfo);

export { FHostingConfiguration } from "./FHostingConfiguration.js";
export { FHttpRequestCancellationToken } from "./FHttpRequestCancellationToken.js";

export * from "./configuration/index.js";
export * from "./launcher/index.js";

export type FWebServerRequestHandler = http.RequestListener;

export interface FWebServer extends FInitableBase {
	readonly name: string;
	readonly underlyingServer: http.Server | https.Server;
	rootExpressApplication: express.Application;
	bindRequestHandler(bindPath: string, handler: FWebServerRequestHandler): void;
	createWebSocketServer(bindPath: string): WebSocket.Server;
	destroyWebSocketServer(bindPath: string): Promise<void>;
}

export abstract class FAbstractWebServer<TOpts extends FHostingConfiguration.WebServerBase | FHostingConfiguration.WebServer>
	extends FInitableBase implements FWebServer {
	public abstract readonly underlyingServer: http.Server | https.Server;
	protected readonly _trustProxy: boolean | "loopback" | "linklocal" | "uniquelocal";
	protected readonly _name: string;
	protected readonly _listenHost: string;
	protected readonly _listenPort: number;
	protected readonly _websockets: { [bindPath: string]: WebSocket.Server };
	protected readonly _log: FLogger;
	private readonly _onUpgrade: (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => void;
	private readonly _onRequestImpl: http.RequestListener;
	private readonly _handlers: Map</*bindPath: */string, FWebServerRequestHandler>;
	// private readonly _caCertificates: ReadonlyArray<[pki.Certificate, Buffer]>;
	private _rootExpressApplication: express.Application | null;

	public static createFCancellationToken(request: http.IncomingMessage): FCancellationToken {
		return new FHttpRequestCancellationToken(request);
	}

	public constructor(opts: TOpts) {
		super();
		this._name = opts.name;
		this._listenHost = opts.listenHost;
		this._listenPort = opts.listenPort;
		this._log = opts.log !== undefined ? opts.log : FLogger.create(this.constructor.name);
		this._trustProxy = opts.trustProxy !== undefined ? opts.trustProxy : false;
		this._websockets = {};
		this._handlers = new Map();
		this._rootExpressApplication = null;

		let onXfccRequest: http.RequestListener | null = null;
		let onXfccUpgrade: ((request: http.IncomingMessage, socket: net.Socket, head: Buffer) => void) | null = null;
		if ("type" in opts) {
			const friendlyOpts = opts as FHostingConfiguration.WebServer;
			if (
				"clientCertificateMode" in friendlyOpts &&
				friendlyOpts.clientCertificateMode === FHostingConfiguration.ClientCertificateMode.XFCC
			) {
				if (
					friendlyOpts.caCertificates === undefined ||
					!(
						typeof friendlyOpts.caCertificates === "string"
						|| friendlyOpts.caCertificates instanceof Buffer
						|| Array.isArray(friendlyOpts.caCertificates)
					)
				) {
					throw new Error("ClientCertificateMode.XFCC required at least one CA certificate");
				}

				// this._caCertificates = parseCertificates(friendlyOpts.caCertificates);

				onXfccRequest = this.onRequestXFCC.bind(this);
				onXfccUpgrade = this.onUpgradeXFCC.bind(this);
			} else {
				// if (
				// 	friendlyOpts.type === "https" &&
				// 	friendlyOpts.caCertificates !== undefined &&
				// 	(
				// 		typeof friendlyOpts.caCertificates === "string"
				// 		|| friendlyOpts.caCertificates instanceof Buffer
				// 		|| Array.isArray(friendlyOpts.caCertificates)
				// 	)
				// ) {
				// 	this._caCertificates = parseCertificates(friendlyOpts.caCertificates);
				// } else {
				// 	this._caCertificates = [];
				// }
			}
		} else {
			// this._caCertificates = [];
		}

		this._onRequestImpl = onXfccRequest !== null ? onXfccRequest : this.onRequestCommon.bind(this);
		this._onUpgrade = onXfccUpgrade !== null ? onXfccUpgrade : this.onUpgradeCommon.bind(this);
	}

	/**
	 * Lazy create for Express Application
	 */
	public get rootExpressApplication(): express.Application {
		if (this._rootExpressApplication === null) {
			this._rootExpressApplication = express();
			const trustProxy = this._trustProxy;
			if (trustProxy !== undefined) {
				this._rootExpressApplication.set("trust proxy", trustProxy);
			}
		}
		return this._rootExpressApplication;
	}

	public set rootExpressApplication(value: express.Application) {
		if (this._rootExpressApplication !== null) {
			throw new Error("Wrong operation at current state. Express application already set. Override is not allowed.");
		}
		this._rootExpressApplication = value;
	}

	public get name(): string { return this._name; }

	public bindRequestHandler(bindPath: string, value: FWebServerRequestHandler): void {
		if (this._handlers.has(bindPath)) {
			throw new Error(`Wrong operation. Path '${bindPath}' already bound`);
		}
		this._handlers.set(bindPath, value);
	}

	public createWebSocketServer(bindPath: string): WebSocket.Server {
		const websocketServer: WebSocket.Server = new WebSocket.Server({ noServer: true });
		this._websockets[bindPath] = websocketServer;
		return websocketServer;
	}
	public async destroyWebSocketServer(bindPath: string): Promise<void> {
		const logger: FLogger = this._log;

		const webSocketServer = this._websockets[bindPath];
		if (webSocketServer !== undefined) {
			delete this._websockets[bindPath];
			await new Promise<void>((resolve) => {
				webSocketServer.close((err) => {
					if (err !== undefined) {
						if (logger.isWarnEnabled) {
							logger.warn(this.initExecutionContext, () => `Web Socket Server was closed with error. Inner message: ${err.message} `);
						}
						logger.trace(this.initExecutionContext, () => "Web Socket Server was closed with error.", FException.wrapIfNeeded(err));
					}

					// dispose never raise any errors
					resolve();
				});
			});
		}
	}

	protected async onInit(): Promise<void> {
		this.underlyingServer.on("upgrade", this._onUpgrade);
		await this.onListen();
	}

	// protected get caCertificatesAsPki(): Array<pki.Certificate> {
	// 	if (this._caCertificates === undefined) {
	// 		throw new Error("Wrong operation at current state.");
	// 	}
	// 	return this._caCertificates.map(tuple => tuple[0]);
	// }

	// protected get caCertificatesAsBuffer(): Array<Buffer> {
	// 	if (this._caCertificates === undefined) {
	// 		throw new Error("Wrong operation at current state.");
	// 	}
	// 	return this._caCertificates.map(tuple => tuple[1]);
	// }

	protected abstract onListen(): Promise<void>;

	protected onRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
		this._onRequestImpl(req, res);
	}

	private onRequestCommon(req: http.IncomingMessage, res: http.ServerResponse): void {
		const logger: FLogger = this._log;

		if (this._handlers.size > 0 && req.url !== undefined) {
			const { pathname } = new URL(req.url);
			if (pathname !== undefined) {
				for (const bindPath of this._handlers.keys()) {
					if (pathname.startsWith(bindPath)) {
						const handler = this._handlers.get(bindPath) as FWebServerRequestHandler;
						handler(req, res);
						return;
					}
				}
			}
		}

		// A proper handler was not found, fallback to rootExpressApplication
		if (this._rootExpressApplication !== null) {
			this._rootExpressApplication(req, res);
			return;
		}

		logger.warn(this.initExecutionContext, "Request was handled but no listener.");
		res.writeHead(503);
		res.statusMessage = "Service Unavailable";
		res.end();
	}

	private onRequestXFCC(req: http.IncomingMessage, res: http.ServerResponse): void {
		if (this.validateXFCC(req)) {
			this.onRequestCommon(req, res);
			return;
		}

		res.statusMessage = "Client certificate is required.";
		res.writeHead(401);
		res.end();
	}

	private onUpgradeCommon(req: http.IncomingMessage, socket: net.Socket, head: Buffer): void {
		const logger: FLogger = this._log;

		const urlPath = req.url;
		if (urlPath !== undefined) {
			const wss = this._websockets[urlPath];
			if (wss !== undefined) {
				logger.debug(this.initExecutionContext, () => `Upgrade the server on url path '${urlPath}' for WebSocket server.`);
				wss.handleUpgrade(req, socket, head, function (ws) {
					wss.emit("connection", ws, req);
				});
			} else {
				socket.destroy();
			}
		} else {
			socket.destroy();
		}
	}

	private onUpgradeXFCC(req: http.IncomingMessage, socket: net.Socket, head: Buffer): void {
		if (this.validateXFCC(req)) {
			this.onUpgradeCommon(req, socket, head);
			return;
		}

		socket.write("HTTP/1.1 401 Client certificate is required.\r\n\r\n");
		socket.end();
	}

	private validateXFCC(req: http.IncomingMessage): boolean {
		const logger: FLogger = this._log;

		const xfccHeaderData = req && req.headers && req.headers["x-forwarded-client-cert"];
		if (typeof xfccHeaderData === "string") {
			logger.trace(this.initExecutionContext, () => `X-Forwarded-Client-Cert header: ${xfccHeaderData}`);

			// const clientCertPem = urlDecode(xfccHeaderData);
			// const clientCert = pki.certificateFromPem(clientCertPem);

			// for (const caCert of this.caCertificatesAsPki) {
			// 	try {
			// 		if (caCert.verify(clientCert)) {
			// 			return true;
			// 		}
			// 	} catch (e) {
			// 		logger.trace(this.initExecutionContext, "Verify failed.", FException.wrapIfNeeded(e));
			// 	}
			// }
		} else {
			logger.debug(this.initExecutionContext, "Request with no X-Forwarded-Client-Cert header.");
		}

		return false;
	}
}

export class UnsecuredWebServer extends FAbstractWebServer<FHostingConfiguration.UnsecuredWebServer> {
	private readonly _httpServer: http.Server;

	public constructor(opts: FHostingConfiguration.UnsecuredWebServer) {
		super(opts);

		// Make HTTP server instance
		const serverOpts: https.ServerOptions = {
		};

		this._httpServer = http.createServer(serverOpts, this.onRequest.bind(this));
	}

	public get underlyingServer(): http.Server { return this._httpServer; }

	protected onListen(): Promise<void> {
		const logger: FLogger = this._log;

		logger.debug(this.initExecutionContext, "UnsecuredWebServer#listen()");

		const server: http.Server = this._httpServer;
		return new Promise<void>((resolve, reject) => {
			logger.info(this.initExecutionContext, () => `Starting Web Server '${this._name}' ...`);
			server
				.on("listening", () => {
					const address = server.address();
					if (address !== null) {
						if (typeof address === "string") {
							logger.info(this.initExecutionContext, () => `Web Server '${this._name}' was started on ${address}`);
						} else {
							logger.info(this.initExecutionContext, () => `${address.family} Web Server '${this._name}' was started on http://" + ${address.address}:${address.port}`);
						}
					}
					resolve();
				})
				.on("error", reject)
				.listen(this._listenPort, this._listenHost);
		});
	}

	protected async onDispose() {
		const logger: FLogger = this._log;
		logger.debug(this.initExecutionContext, "UnsecuredWebServer#onDispose()");
		const server = this._httpServer;
		const address = server.address();
		if (address !== null) {
			if (typeof address === "string") {
				logger.info(this.initExecutionContext, () => "Stopping Web Server http://" + address + "...");
			} else {
				logger.info(this.initExecutionContext, () => "Stopping " + address.family + " Web Server http://" + address.address + ":" + address.port + "...");
			}
		} else {
			logger.info(this.initExecutionContext, "Stopping Web Server...");
		}
		await new Promise<void>((destroyResolve) => {
			server.close((e) => {
				if (e) {
					const ex: FException = FException.wrapIfNeeded(e);
					logger.warn(this.initExecutionContext, () => `The Web Server was stopped with error: ${ex.message}`);
					logger.debug(this.initExecutionContext, "The Web Server was stopped with error", ex);
				} else {
					logger.info(this.initExecutionContext, "The Web Server was stopped");
				}
				destroyResolve();
			});
		});
	}
}

export class SecuredWebServer extends FAbstractWebServer<FHostingConfiguration.SecuredWebServer> {
	private readonly _httpsServer: https.Server;

	public constructor(opts: FHostingConfiguration.SecuredWebServer) {
		super(opts);

		// Make HTTPS server instance
		const serverOpts: https.ServerOptions = {
			cert: opts.serverCertificate instanceof Buffer ? opts.serverCertificate : fs.readFileSync(opts.serverCertificate),
			key: opts.serverKey instanceof Buffer ? opts.serverKey : fs.readFileSync(opts.serverKey)
		};

		if (opts.caCertificates !== null) {
			if (typeof opts.caCertificates === "string") {
				serverOpts.ca = fs.readFileSync(opts.caCertificates);
			}
			//serverOpts.ca = this.caCertificatesAsBuffer;
		}
		if (opts.serverKeyPassword !== null) {
			serverOpts.passphrase = opts.serverKeyPassword;
		}

		switch (opts.clientCertificateMode) {
			case FHostingConfiguration.ClientCertificateMode.NONE:
			case FHostingConfiguration.ClientCertificateMode.XFCC: // XFCC handled by AbstractWebServer
				serverOpts.requestCert = false;
				serverOpts.rejectUnauthorized = false;
				break;
			case FHostingConfiguration.ClientCertificateMode.REQUEST:
				serverOpts.requestCert = true;
				serverOpts.rejectUnauthorized = false;
				break;
			default:
				// By default use FHostingConfiguration.SecuredWebServer.ClientCertMode.TRUST mode
				serverOpts.requestCert = true;
				serverOpts.rejectUnauthorized = true;
				break;
		}

		this._httpsServer = https.createServer(serverOpts, this.onRequest.bind(this));
	}

	public get underlyingServer(): https.Server { return this._httpsServer; }

	protected onListen(): Promise<void> {
		const logger: FLogger = this._log;
		logger.debug(this.initExecutionContext, "SecuredWebServer#listen()");

		const server: https.Server = this._httpsServer;
		return new Promise((resolve, reject) => {
			logger.info(this.initExecutionContext, () => `Starting Web Server '${this._name}' ...`);
			server
				.on("listening", () => {
					const address = server.address();
					if (address !== null) {
						if (typeof address === "string") {
							logger.info(this.initExecutionContext, () => `Web Server '${this._name}' was started on ${address}`);
						} else {
							logger.info(this.initExecutionContext, () => `${address.family} Web Server '${this._name}' was started on https://${address.address}:${address.port}`);
						}
					}
					resolve();
				})
				.on("error", reject)
				.listen(this._listenPort, this._listenHost);
		});
	}

	protected async onDispose() {
		const logger: FLogger = this._log;
		logger.debug(this.initExecutionContext, "SecuredWebServer#onDispose()");
		const server = this._httpsServer;
		const address = server.address();
		if (address !== null) {
			if (typeof address === "string") {
				logger.info(this.initExecutionContext, () => "Stopping Web Server https://" + address + "...");
			} else {
				logger.info(this.initExecutionContext, () => "Stopping " + address.family + " Web Server https://" + address.address + ":" + address.port + "...");
			}
		} else {
			logger.info(this.initExecutionContext, "Stopping Web Server...");
		}
		await new Promise<void>((destroyResolve) => {
			server.close((e) => {
				if (e) {
					const ex: FException = FException.wrapIfNeeded(e);
					logger.warn(this.initExecutionContext, () => `The Web Server was stopped with error: ${ex.message}`);
					logger.debug(this.initExecutionContext, "The Web Server was stopped with error", ex);
				} else {
					logger.info(this.initExecutionContext, "The Web Server was stopped");
				}
				destroyResolve();
			});
		});
	}
}

export abstract class FBindEndpoint extends FInitableBase {
	protected readonly _bindPath: string;

	public constructor(
		opts: FHostingConfiguration.BindEndpoint
	) {
		super();
		this._bindPath = opts.bindPath;
	}

	protected onInit(): void | Promise<void> {
		// NOP
	}

	protected onDispose(): void | Promise<void> {
		// NOP
	}
}

export abstract class FServersBindEndpoint extends FBindEndpoint {
	protected readonly _servers: ReadonlyArray<FWebServer>;

	public constructor(
		servers: ReadonlyArray<FWebServer>,
		opts: FHostingConfiguration.BindEndpoint
	) {
		super(opts);
		this._servers = servers;
	}
}

/**
 * This endpoint supplies communication channels for each client connection.
 *
 * WebSocket Client is hosting the channel:
 *   - Client's messages delivered via SubscriberChannel
 *   - To deliver message to client use PublisherChannel
 *
 * If you need opposite behavior take a look for `WebSocketChannelFactoryEndpoint`
 *
 * You need to override onOpenBinaryChannel and/or onOpenTextChannel to obtain necessary channel
 */
export class FWebSocketChannelSupplyEndpoint extends FServersBindEndpoint {
	private readonly _webSocketServers: Array<WebSocket.Server>;
	private readonly _connections: Set<WebSocket>;
	private readonly _log: FLogger;
	private _defaultProtocol: string;
	private _allowedProtocols: Set<string>;
	private _connectionCounter: number;

	public constructor(
		servers: ReadonlyArray<FWebServer>,
		opts: FHostingConfiguration.WebSocketEndpoint
	) {
		super(servers, opts);
		this._log = FLogger.create(this.constructor.name);
		this._webSocketServers = [];
		this._connections = new Set();
		this._defaultProtocol = opts.defaultProtocol;
		this._allowedProtocols = new Set([this._defaultProtocol]);
		if (opts.allowedProtocols !== undefined) {
			opts.allowedProtocols.forEach((allowedProtocol: string): void => {
				this._allowedProtocols.add(allowedProtocol);
			});
		}
		this._connectionCounter = 0;
	}

	protected override onInit(): void {
		super.onInit();

		for (const server of this._servers) {
			const webSocketServer = server.createWebSocketServer(this._bindPath); // new WebSocket.Server({ noServer: true });
			this._webSocketServers.push(webSocketServer);
			webSocketServer.on("connection", this.onConnection.bind(this));
		}
	}

	protected override async onDispose() {
		const logger: FLogger = this._log;

		const connections = [...this._connections.values()];
		this._connections.clear();
		for (const webSocket of connections) {
			webSocket.close(1001, "going away");
			webSocket.terminate();
		}

		const webSocketServers = this._webSocketServers.splice(0).reverse();
		for (const webSocketServer of webSocketServers) {
			await new Promise<void>((resolve) => {
				webSocketServer.close((err) => {
					if (err !== undefined) {
						logger.warn(this.initExecutionContext, () => `Web Socket Server was closed with error. Inner message: ${err.message} `);
						logger.trace(this.initExecutionContext, "Web Socket Server was closed with error.", FException.wrapIfNeeded(err));
					}

					// dispose never raise any errors
					resolve();
				});
			});
		}
	}

	protected onConnection(webSocket: WebSocket, request: http.IncomingMessage): void {
		if (this.disposing) {
			// https://tools.ietf.org/html/rfc6455#section-7.4.1
			webSocket.close(1001, "going away");
			webSocket.terminate();
			return;
		}

		const logger: FLogger = this._log;

		if (this._connectionCounter === Number.MAX_SAFE_INTEGER) { this._connectionCounter = 0; }
		const connectionNumber: number = this._connectionCounter++;
		const ipAddress: string | undefined = request.socket.remoteAddress;
		if (ipAddress !== undefined) {
			logger.info(this.initExecutionContext, () => `Connection #${connectionNumber} was established from ${ipAddress} `);
		}
		if (logger.isInfoEnabled) {
			logger.info(this.initExecutionContext, `Connection #${connectionNumber} was established`);
		}

		const subProtocol: string = webSocket.protocol || this._defaultProtocol;
		if (webSocket.protocol !== undefined) {
			if (!this._allowedProtocols.has(subProtocol)) {
				logger.warn(this.initExecutionContext, () => `Connection #${connectionNumber} dropped. Not supported sub-protocol: ${subProtocol}`);
				// https://tools.ietf.org/html/rfc6455#section-7.4.1
				webSocket.close(1007, `Wrong sub-protocol: ${subProtocol}`);
				webSocket.terminate();
				return;
			}
		}

		const FCancellationTokenSource = new FCancellationTokenSourceManual();

		webSocket.binaryType = "nodebuffer";

		const channels: Map</*protocol:*/ string, {
			binaryChannel?: _FWebSocketChannelSupplyEndpointHelpers.WebSocketBinaryChannelImpl,
			textChannel?: _FWebSocketChannelSupplyEndpointHelpers.WebSocketTextChannelImpl
		}> = new Map();

		webSocket.onmessage = async ({ data }) => {
			try {
				let channelsTuple = channels.get(subProtocol);
				if (channelsTuple === undefined) {
					channelsTuple = {};
					channels.set(subProtocol, channelsTuple);
				}

				if (data instanceof Buffer) {
					if (channelsTuple.binaryChannel === undefined) {
						const binaryChannel = new _FWebSocketChannelSupplyEndpointHelpers.WebSocketBinaryChannelImpl(webSocket);
						try {
							this.onOpenBinaryChannel(webSocket, subProtocol, binaryChannel);
						} catch (e) {
							// https://tools.ietf.org/html/rfc6455#section-7.4.1
							const friendlyError: FException = FException.wrapIfNeeded(e);
							webSocket.close(1011, friendlyError.message);
							webSocket.terminate();
							return;
						}
						channelsTuple.binaryChannel = binaryChannel;
					}
					await channelsTuple.binaryChannel.onMessage(FCancellationTokenSource.token, data);
				} else if (typeof data === "string") {
					if (channelsTuple.textChannel === undefined) {
						const textChannel = new _FWebSocketChannelSupplyEndpointHelpers.WebSocketTextChannelImpl(webSocket);
						try {
							this.onOpenTextChannel(webSocket, subProtocol, textChannel);
						} catch (e) {
							// https://tools.ietf.org/html/rfc6455#section-7.4.1
							const friendlyError: FException = FException.wrapIfNeeded(e);
							webSocket.close(1011, friendlyError.message);
							webSocket.terminate();
							return;
						}
						channelsTuple.textChannel = textChannel;
					}
					await channelsTuple.textChannel.onMessage(FCancellationTokenSource.token, data);
				} else {
					logger.debug(
						this.initExecutionContext,
						() => `Connection #${connectionNumber} cannot handle a message due not supported type. Terminate socket...`
					);

					// https://tools.ietf.org/html/rfc6455#section-7.4.1
					webSocket.close(1003, `Not supported message type`);
					webSocket.terminate();
					return;
				}
			} catch (e) {
				if (logger.isInfoEnabled || logger.isTraceEnabled) {
					const ex: FException = FException.wrapIfNeeded(e);
					logger.info(this.initExecutionContext, () => `Connection #${connectionNumber} onMessage failed: ${ex.message}`);
					logger.trace(this.initExecutionContext, () => `Connection #${connectionNumber} onMessage failed:`, ex);
				}
			}
		};
		webSocket.onclose = ({ code, reason }) => {
			logger.trace(this.initExecutionContext, () => `Connection #${connectionNumber} was closed: ${JSON.stringify({ code, reason })} `);
			logger.info(this.initExecutionContext, () => `Connection #${connectionNumber} was closed`);

			FCancellationTokenSource.cancel();
			this._connections.delete(webSocket);

			const closedError = new FException(`WebSocket was closed: ${code} ${reason}`);
			for (const channelsTuple of channels.values()) {
				if (channelsTuple.binaryChannel !== undefined) {
					channelsTuple.binaryChannel.onClose(closedError).catch(console.error);
				}
				if (channelsTuple.textChannel !== undefined) {
					channelsTuple.textChannel.onClose(closedError).catch(console.error);
				}
			}
			channels.clear();
		};

		this._connections.add(webSocket);
	}

	/**
	 * The method should be overridden. The method called by the endpoint,
	 * when WSClient sent first binary message for specified sub-protocol.
	 * @param webSocket WebSocket instance
	 * @param subProtocol These strings are used to indicate sub-protocols,
	 * so that a single server can implement multiple WebSocket sub-protocols (for example,
	 * you might want one server to be able to handle different types of interactions
	 * depending on the specified protocol).
	 * @param channel Binary channel instance to be user in inherited class
	 */
	protected onOpenBinaryChannel(_webSocket: WebSocket, subProtocol: string, _channel: FWebSocketChannelSupplyEndpoint.BinaryChannel): void {
		throw new FExceptionInvalidOperation(`Binary messages are not supported by the sub-protocol: ${subProtocol}`);
	}

	/**
	 * The method should be overridden. The method called by the endpoint,
	 * when WSClient sent first text message for specified sub-protocol.
	 * @param webSocket WebSocket instance
	 * @param subProtocol These strings are used to indicate sub-protocols,
	 * so that a single server can implement multiple WebSocket sub-protocols (for example,
	 * you might want one server to be able to handle different types of interactions
	 * depending on the specified protocol).
	 * @param channel Text channel instance to be user in inherited class
	 */
	protected onOpenTextChannel(_webSocket: WebSocket, subProtocol: string, _channel: FWebSocketChannelSupplyEndpoint.TextChannel): void {
		throw new FExceptionInvalidOperation(`Text messages are not supported by the sub-protocol: ${subProtocol}`);
	}
}
export namespace FWebSocketChannelSupplyEndpoint {
	export interface BinaryChannel extends FChannelPublisher<Uint8Array>, FChannelSubscriber<Uint8Array> { }
	export interface TextChannel extends FChannelPublisher<string>, FChannelSubscriber<string> { }
}

/**
 * This endpoint requests you for communication channels for each client connection.
 *
 * WebSocket Client is used the channel:
 *   - Client's messages delivered via PublisherChannel
 *   - To deliver message to client use SubscriberChannel
 *
 * If you need opposite behavior take a look for `WebSocketChannelSupplyEndpoint`
 *
 * You need to override createBinaryChannel and/or createTextChannel to provide necessary channel
 */
export class FWebSocketChannelFactoryEndpoint extends FServersBindEndpoint {
	private readonly _webSocketServers: Array<WebSocket.Server>;
	private readonly _connections: Set<WebSocket>;
	private readonly _autoCreateChannelBinary: boolean;
	private readonly _autoCreateChannelText: boolean;
	private readonly _log: FLogger;
	private _defaultProtocol: string;
	private _allowedProtocols: Set<string>;
	private _connectionCounter: number;

	public constructor(
		servers: ReadonlyArray<FWebServer>,
		opts: FHostingConfiguration.WebSocketEndpoint,
		autoCreateChannels?: {
			binary?: boolean,
			text?: boolean
		}
	) {
		super(servers, opts);
		this._log = FLogger.create(this.constructor.name);
		this._webSocketServers = [];
		this._connections = new Set();
		this._defaultProtocol = opts.defaultProtocol;
		this._allowedProtocols = new Set([this._defaultProtocol]);
		if (opts.allowedProtocols !== undefined) {
			opts.allowedProtocols.forEach((allowedProtocol: string): void => {
				this._allowedProtocols.add(allowedProtocol);
			});
		}
		this._connectionCounter = 0;

		this._autoCreateChannelBinary = false;
		this._autoCreateChannelText = false;

		if (autoCreateChannels !== undefined) {
			if (autoCreateChannels.binary === true) { this._autoCreateChannelBinary = true; }
			if (autoCreateChannels.text === true) { this._autoCreateChannelText = true; }
		}
	}

	protected override onInit(): void {
		super.onInit();

		for (const server of this._servers) {
			const webSocketServer = server.createWebSocketServer(this._bindPath); // new WebSocket.Server({ noServer: true });
			this._webSocketServers.push(webSocketServer);
			webSocketServer.on("connection", this.onConnection.bind(this));
		}
	}

	protected override async onDispose() {
		// Prevent open new connection
		for (const server of this._servers) {
			await server.destroyWebSocketServer(this._bindPath);
		}

		const connections = [...this._connections.values()];
		this._connections.clear();
		for (const webSocket of connections) {
			webSocket.close(1001, "going away");
			webSocket.terminate();
		}
		this._webSocketServers.splice(0);
	}

	protected async onConnection(webSocket: WebSocket, request: http.IncomingMessage): Promise<void> {
		if (this.disposing) {
			// https://tools.ietf.org/html/rfc6455#section-7.4.1
			webSocket.close(1001, "going away");
			webSocket.terminate();
			return;
		}

		const logger: FLogger = this._log;

		if (this._connectionCounter === Number.MAX_SAFE_INTEGER) { this._connectionCounter = 0; }
		const connectionNumber: number = this._connectionCounter++;
		const ipAddress: string | undefined = request.connection.remoteAddress;
		if (ipAddress !== undefined) {
			logger.info(this.initExecutionContext, () => `Connection #${connectionNumber} was established from ${ipAddress} `);
		} else {
			logger.info(this.initExecutionContext, () => `Connection #${connectionNumber} was established`);
		}

		const subProtocol: string = webSocket.protocol || this._defaultProtocol;
		if (webSocket.protocol !== undefined) {
			if (!this._allowedProtocols.has(subProtocol)) {
				logger.warn(this.initExecutionContext, `Connection #${connectionNumber} dropped. Not supported sub-protocol: ${subProtocol}`);
				// https://tools.ietf.org/html/rfc6455#section-7.4.1
				webSocket.close(1007, `Wrong sub-protocol: ${subProtocol}`);
				webSocket.terminate();
				return;
			}
		}

		const cancellationTokenSource: FCancellationTokenSourceManual = new FCancellationTokenSourceManual();

		const executionContext: FExecutionContext = new FCancellationExecutionContext(
			FExecutionContext.Empty,
			cancellationTokenSource.token
		);

		webSocket.binaryType = "nodebuffer";

		const channels: Map</*protocol:*/ string, {
			binaryChannel?: FWebSocketChannelFactoryEndpoint.BinaryChannel,
			textChannel?: FWebSocketChannelFactoryEndpoint.TextChannel
		}> = new Map();

		const handler = async (
			_executionContext: FExecutionContext,
			event: FChannelSubscriber.Event<Uint8Array> | FChannelSubscriber.Event<string> | FException
		) => {
			if (event instanceof FException) {
				// https://tools.ietf.org/html/rfc6455#section-7.4.1
				logger.debug(this.initExecutionContext, "Channel emits error. " + event.message);
				logger.trace(this.initExecutionContext, "Channel emits error.", event);
				webSocket.close(1011, event.message);
				webSocket.terminate();
			} else {
				const { data } = event;
				await new Promise<void>(sendResolve => webSocket.send(data, () => sendResolve()));
			}
		};

		if (this._autoCreateChannelBinary === true) {
			let channelsTuple = channels.get(subProtocol);
			if (channelsTuple === undefined) {
				channelsTuple = {};
				channels.set(subProtocol, channelsTuple);
			}
			try {
				const binaryChannel: FWebSocketChannelFactoryEndpoint.BinaryChannel
					= await this.createBinaryChannel(executionContext, webSocket, subProtocol);
				channelsTuple.binaryChannel = binaryChannel;
				binaryChannel.addHandler(handler);
			} catch (e) {
				// https://tools.ietf.org/html/rfc6455#section-7.4.1
				const friendlyError: FException = FException.wrapIfNeeded(e);
				logger.debug(this.initExecutionContext, () => `Could not create binary channel. ${friendlyError.message}`);
				logger.trace(this.initExecutionContext, "Could not create binary channel.", friendlyError);
				webSocket.close(1011, friendlyError.message);
				webSocket.terminate();
				return;
			}
		}

		if (this._autoCreateChannelText === true) {
			let channelsTuple = channels.get(subProtocol);
			if (channelsTuple === undefined) {
				channelsTuple = {};
				channels.set(subProtocol, channelsTuple);
			}
			try {
				const textChannel: FWebSocketChannelFactoryEndpoint.TextChannel
					= await this.createTextChannel(executionContext, webSocket, subProtocol);
				channelsTuple.textChannel = textChannel;
				textChannel.addHandler(handler);
			} catch (e) {
				// https://tools.ietf.org/html/rfc6455#section-7.4.1
				const friendlyError: FException = FException.wrapIfNeeded(e);
				logger.debug(this.initExecutionContext, () => `Could not create text channel. ${friendlyError.message}`);
				logger.trace(this.initExecutionContext, "Could not create text channel.", friendlyError);
				webSocket.close(1011, friendlyError.message);
				webSocket.terminate();
				return;
			}
		}

		webSocket.onmessage = async ({ data }) => {
			try {
				let channelsTuple = channels.get(subProtocol);
				if (channelsTuple === undefined) {
					channelsTuple = {};
					channels.set(subProtocol, channelsTuple);
				}

				if (data instanceof Buffer) {
					if (channelsTuple.binaryChannel === undefined) {
						try {
							const binaryChannel: FWebSocketChannelFactoryEndpoint.BinaryChannel
								= await this.createBinaryChannel(executionContext, webSocket, subProtocol);
							channelsTuple.binaryChannel = binaryChannel;
							binaryChannel.addHandler(handler);
						} catch (e) {
							// https://tools.ietf.org/html/rfc6455#section-7.4.1
							const friendlyError: FException = FException.wrapIfNeeded(e);
							logger.debug(this.initExecutionContext, () => `Could not create binary channel. ${friendlyError.message}`);
							logger.trace(this.initExecutionContext, "Could not create binary channel.", friendlyError);
							webSocket.close(1011, friendlyError.message);
							webSocket.terminate();
							return;
						}
					}
					await channelsTuple.binaryChannel.send(FExecutionContext.Empty, data);
				} else if (typeof data === "string") {
					if (channelsTuple.textChannel === undefined) {
						try {
							const textChannel: FWebSocketChannelFactoryEndpoint.TextChannel
								= await this.createTextChannel(executionContext, webSocket, subProtocol);
							channelsTuple.textChannel = textChannel;
							textChannel.addHandler(handler);
						} catch (e) {
							// https://tools.ietf.org/html/rfc6455#section-7.4.1
							const friendlyError: FException = FException.wrapIfNeeded(e);
							logger.debug(this.initExecutionContext, () => `Could not create text channel. ${friendlyError.message}`);
							logger.trace(this.initExecutionContext, "Could not create text channel.", friendlyError);
							webSocket.close(1011, friendlyError.message);
							webSocket.terminate();
							return;
						}
					}
					await channelsTuple.textChannel.send(FExecutionContext.Empty, data);
				} else {
					logger.debug(
						this.initExecutionContext,
						() => `Connection #${connectionNumber} cannot handle a message due not supported type. Terminate socket...`
					);

					// https://tools.ietf.org/html/rfc6455#section-7.4.1
					webSocket.close(1003, `Not supported message type`);
					webSocket.terminate();
					return;
				}
			} catch (e) {
				const ex: FException = FException.wrapIfNeeded(e);
				logger.info(this.initExecutionContext, () => `Connection #${connectionNumber} onMessage failed: ${ex.message}`);
				logger.trace(this.initExecutionContext, () => `Connection #${connectionNumber} onMessage failed:`, ex);
			}
		};
		webSocket.onclose = ({ code, reason }) => {
			logger.trace(this.initExecutionContext, () => `Connection #${connectionNumber} was closed: ${JSON.stringify({ code, reason })} `);
			logger.info(this.initExecutionContext, () => `Connection #${connectionNumber} was closed`);

			cancellationTokenSource.cancel();
			this._connections.delete(webSocket);

			for (const channelsTuple of channels.values()) {
				if (channelsTuple.binaryChannel !== undefined) {
					channelsTuple.binaryChannel.removeHandler(handler);
					channelsTuple.binaryChannel.dispose().catch(console.error);
				}
				if (channelsTuple.textChannel !== undefined) {
					channelsTuple.textChannel.removeHandler(handler);
					channelsTuple.textChannel.dispose().catch(console.error);
				}
			}
			channels.clear();
		};

		this._connections.add(webSocket);
	}

	/**
	 * The method should be overridden. The method called by the endpoint,
	 * when WSClient sent first binary message for specified sub-protocol.
	 * @param webSocket WebSocket instance
	 * @param subProtocol These strings are used to indicate sub-protocols,
	 * so that a single server can implement multiple WebSocket sub-protocols (for example,
	 * you might want one server to be able to handle different types of interactions
	 * depending on the specified protocol).
	 */
	protected createBinaryChannel(
		_executionContext: FExecutionContext, _webSocket: WebSocket, subProtocol: string
	): Promise<FWebSocketChannelFactoryEndpoint.BinaryChannel> {
		throw new FExceptionInvalidOperation(`Binary messages are not supported by the sub-protocol: ${subProtocol}`);
	}

	/**
	 * The method should be overridden. The method called by the endpoint,
	 * when WSClient sent first text message for specified sub-protocol.
	 * @param webSocket WebSocket instance
	 * @param subProtocol These strings are used to indicate sub-protocols,
	 * so that a single server can implement multiple WebSocket sub-protocols (for example,
	 * you might want one server to be able to handle different types of interactions
	 * depending on the specified protocol).
	 */
	protected createTextChannel(
		_executionContext: FExecutionContext, _webSocket: WebSocket, subProtocol: string
	): Promise<FWebSocketChannelFactoryEndpoint.TextChannel> {
		throw new FExceptionInvalidOperation(`Text messages are not supported by the sub-protocol: ${subProtocol}`);
	}
}
export namespace FWebSocketChannelFactoryEndpoint {
	export interface BinaryChannel extends FDisposable, FChannelPublisher<Uint8Array>, FChannelSubscriber<Uint8Array> { }
	export interface TextChannel extends FDisposable, FChannelPublisher<string>, FChannelSubscriber<string> { }
}

export function instanceofWebServer(server: any): server is FWebServer {
	if (server instanceof UnsecuredWebServer) { return true; }
	if (server instanceof SecuredWebServer) { return true; }

	if (
		process.env["NODE_ENV"] === "development" &&
		"name" in server &&
		"underlyingServer" in server &&
		"rootExpressApplication" in server &&
		"bindRequestHandler" in server &&
		"createWebSocketServer" in server &&
		"listen" in server
	) {
		// Look like the server is WebServer like. Allow it only in development
		return true;
	}

	return false;
}

export function createWebServer(serverOpts: FHostingConfiguration.WebServer): FWebServer {
	switch (serverOpts.type) {
		case "http":
			return new UnsecuredWebServer(serverOpts);
		case "https":
			return new SecuredWebServer(serverOpts);
		default: {
			const { type } = serverOpts;
			throw new Error(`Not supported server type '${type}'`);
		}
	}
}

export function createWebServers(
	serversOpts: ReadonlyArray<FHostingConfiguration.WebServer>
): ReadonlyArray<FWebServer> {
	return serversOpts.map(serverOpts => createWebServer(serverOpts));
}


// function parseCertificate(certificate: Buffer | string): [pki.Certificate, Buffer] {
// 	let cert: pki.Certificate;
// 	let data: Buffer;

// 	if (typeof certificate === "string") {
// 		data = fs.readFileSync(certificate);
// 		cert = pki.certificateFromPem(data.toString("ascii"));
// 	} else {
// 		data = certificate;
// 		cert = pki.certificateFromPem(certificate.toString("ascii"));
// 	}

// 	return [cert, data];
// }
// function parseCertificates(certificates: Buffer | string | Array<string | Buffer>): Array<[pki.Certificate, Buffer]> {
// 	if (certificates instanceof Buffer || typeof certificates === "string") {
// 		return [parseCertificate(certificates)];
// 	} else {
// 		return certificates.map(parseCertificate);
// 	}
// }

namespace _FWebSocketChannelSupplyEndpointHelpers {
	export class WebSocketChannelBase<TData extends Parameters<WebSocket.WebSocket["send"]>[0]> {
		protected readonly _webSocket: WebSocket;
		protected readonly _callbacks: Array<FChannelSubscriber.Callback<TData>>;
		protected _isBroken: boolean;

		public constructor(webSocket: WebSocket) {
			this._webSocket = webSocket;
			this._callbacks = [];
			this._isBroken = false;
		}

		public async onClose(ex: FException): Promise<void> {
			if (this._isBroken) {
				// Already sent error-based callback, nothing to do
				return;
			}
			await Promise.all(this._callbacks.map(async (callback) => {
				try {
					// Notify that channel broken
					await callback(FExecutionContext.Empty, ex);
				} catch (e) {
					// Nothing to do any more with fucking client's callback. Just log STDERR.
					console.error(e);
				}
			}));
		}

		public async onMessage(_cancellationToken: FCancellationToken, data: TData): Promise<void> {
			if (this._isBroken) {
				console.error("Skip received messages due channel is broken");
				return;
			}
			const errors: Array<FException> = [];
			const safePromises = this._callbacks.map(async (callback) => {
				try {
					await callback(FExecutionContext.Empty, { data/*, FCancellationToken*/ });
				} catch (e) {
					errors.push(FException.wrapIfNeeded(e));
				}
			});
			await Promise.all(safePromises);
			if (errors.length > 0) {
				// The callback supplier is shit coder. Closing channel and socket to prevent flowing shit...
				this._isBroken = true;

				// https://tools.ietf.org/html/rfc6455#section-7.4.1
				this._webSocket.close(1011, "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.");
				this._webSocket.terminate();

				const aggregatedError = new FExceptionAggregate(errors);
				await Promise.all(this._callbacks.map(async (callback) => {
					try {
						// Notify that channel broken
						await callback(FExecutionContext.Empty, aggregatedError);
					} catch (e) {
						// Nothing to do any more with fucking client's callback. Just log STDERR.
						console.error(e);
					}
				}));
			}
		}

		public addHandler(cb: FChannelSubscriber.Callback<TData>): void {
			this._callbacks.push(cb);
		}

		public removeHandler(cb: FChannelSubscriber.Callback<TData>): void {
			const index = this._callbacks.indexOf(cb);
			if (index !== -1) {
				this._callbacks.splice(index, 1);
			}
		}

		public send(_executionContext: FExecutionContext, data: TData): Promise<void> {
			if (this._isBroken) {
				throw new FExceptionInvalidOperation("Cannot send message on broken channel");
			}
			return new Promise<void>(sendResolve => this._webSocket.send(data, () => sendResolve()));
		}
	}
	export class WebSocketBinaryChannelImpl extends WebSocketChannelBase<Uint8Array>
		implements FWebSocketChannelSupplyEndpoint.BinaryChannel { }
	export class WebSocketTextChannelImpl extends WebSocketChannelBase<string>
		implements FWebSocketChannelSupplyEndpoint.TextChannel { }
}
