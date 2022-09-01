import { FCancellationToken } from "../cancellation";
import { FException, FExceptionCancelled, FExceptionInvalidOperation, FExceptionNativeErrorWrapper } from "../exception";
import { FExecutionContext, FExecutionContextCancellation, FExecutionContextLogger } from "../execution_context";
import { FInvokeChannel } from "../channel/FInvokeChannel";
import { FLogger } from "../FLogger";

import * as http from "http";
import * as https from "https";

export class FHttpClient implements FHttpClient.HttpInvokeChannel {
	private readonly _proxyOpts: FHttpClient.ProxyOpts | null;
	private readonly _sslOpts: FHttpClient.SslOpts | null;
	private readonly _requestTimeout: number;
	public constructor(opts?: FHttpClient.Opts) {
		this._proxyOpts = opts && opts.proxyOpts || null;
		this._sslOpts = opts && opts.sslOpts || null;
		this._requestTimeout = opts && opts.timeout || FHttpClient.DEFAULT_TIMEOUT;
	}

	public async invoke(
		executionContext: FExecutionContext,
		{ url, method, headers, body }: FHttpClient.Request
	): Promise<FHttpClient.Response> {
		const originalLogger: FLogger = FExecutionContextLogger.of(executionContext).logger;

		const invokeLoggerContext: FLogger.Context = {
			httpInvokeUrl: url.toString(),
			httpInvokeMethod: method
		};

		const invokeLogger: FLogger = originalLogger.getLogger(this.constructor.name, invokeLoggerContext);

		if (invokeLogger.isTraceEnabled) { invokeLogger.trace("Begin invoke"); }
		return new Promise<FHttpClient.Response>((resolve, reject) => {
			const cancellationToken: FCancellationToken = FExecutionContextCancellation.of(executionContext).cancellationToken;

			let isConnectTimeout: boolean = false;
			let resolved: boolean = false;

			const errorHandler = (e: Error) => {
				const ex: FException = FException.wrapIfNeeded(e);
				if (!resolved) {
					resolved = true;
					const msg = isConnectTimeout ? "Connect Timeout"
						: `${method} ${url} failed with error: ${ex.message}. See innerException for details`;
					invokeLogger.debug(msg, ex);
					return reject(new FHttpClient.CommunicationError(url, method,
						headers !== undefined ? headers : {},
						body !== undefined ? body : Buffer.alloc(0),
						msg, ex
					));
				}
			};

			const responseHandler = (response: http.IncomingMessage) => {
				const responseDataChunks: Array<Buffer> = [];
				response.on("data", (chunk: Buffer) => responseDataChunks.push(chunk));
				response.on("error", errorHandler);
				response.on("end", () => {
					if (!resolved) {
						resolved = true;

						if (isConnectTimeout) {
							return reject(new FHttpClient.CommunicationError(url, method,
								headers !== undefined ? headers : {},
								body !== undefined ? body : Buffer.alloc(0),
								"Connect Timeout"
							));
						}

						const respStatus: number = response.statusCode || 500;
						const respDescription: string = response.statusMessage || "";
						const respHeaders = response.headers;
						const respBody: Buffer = Buffer.concat(responseDataChunks);

						if (invokeLogger.isTraceEnabled) {
							invokeLogger.trace(`Recv: ${JSON.stringify({ respStatus, respDescription, respHeaders })}`);
							invokeLogger.trace(`Recv body: ${respBody.toString()}`);
						}

						if (respStatus < 400) {
							return resolve({
								statusCode: respStatus, statusDescription: respDescription,
								headers: respHeaders, body: respBody
							});
						} else {
							return reject(
								new FHttpClient.WebError(
									respStatus, respDescription,
									url, method,
									headers !== undefined ? headers : {}, body !== undefined ? body : Buffer.alloc(0),
									respHeaders, respBody
								)
							);
						}
					}
				});
			};

			try {
				cancellationToken.throwIfCancellationRequested(); // Shoud raise error
			} catch (e) {
				return reject(e);
			}

			const request = this.createClientRequest({ url, method, headers }, responseHandler, invokeLogger);
			if (body !== undefined) {
				if (invokeLogger.isTraceEnabled) { invokeLogger.trace("Write body: " + body.toString()); }
				request.write(body);
			}
			request.end();

			request.on("error", errorHandler);
			request.on("close", () => request.removeListener("close", errorHandler)); // Prevent memory-leaks

			request.setTimeout(this._requestTimeout, () => {
				isConnectTimeout = true;
				request.destroy();
			});
			request.on("socket", socket => {
				// this will setup connect timeout
				socket.setTimeout(this._requestTimeout);
				// socket.on("timeout", () => {
				// 	isConnectTimeout = true;
				// 	request.abort();
				// });
			});
			if (cancellationToken !== undefined) {
				const cb = () => {
					request.destroy();
					if (!resolved) {
						resolved = true;
						try {
							cancellationToken.throwIfCancellationRequested(); // Should raise error
							// Guard for broken implementation of cancellationToken
							reject(new FExceptionCancelled("Cancelled by user"));
						} catch (e) {
							reject(e);
						}
					}
				};
				cancellationToken.addCancelListener(cb);
				request.on("close", () => cancellationToken.removeCancelListener(cb)); // Prevent memory-leaks
			}
		});
	}

	private createClientRequest(
		{ url, method, headers }: FHttpClient.Request,
		callback: (res: http.IncomingMessage) => void,
		log: FLogger
	): http.ClientRequest {
		const proxyOpts = this._proxyOpts;
		if (proxyOpts && proxyOpts.type === "http") {
			const reqOpts = {
				protocol: "http:",
				host: proxyOpts.host,
				port: proxyOpts.port,
				path: url.href,
				method,
				headers: { Host: url.host, ...headers }
			};
			if (log.isTraceEnabled) {
				log.trace("Call https.request: " + JSON.stringify(reqOpts));
			}
			return http.request(reqOpts, callback);
		} else {
			const reqOpts: https.RequestOptions = {
				protocol: url.protocol,
				host: url.hostname,
				port: url.port,
				path: url.pathname + url.search,
				method: method,
				headers: headers
			};
			if (reqOpts.protocol === "https:") {
				const sslOpts = this._sslOpts;
				if (sslOpts) {
					if (sslOpts.ca) {
						reqOpts.ca = sslOpts.ca;
					}
					if (sslOpts.rejectUnauthorized !== undefined) {
						reqOpts.rejectUnauthorized = sslOpts.rejectUnauthorized;
					}
					if ("pfx" in sslOpts) {
						reqOpts.pfx = sslOpts.pfx;
						reqOpts.passphrase = sslOpts.passphrase;
					} else if ("cert" in sslOpts) {
						reqOpts.key = sslOpts.key;
						reqOpts.cert = sslOpts.cert;
					}
				}
				if (log.isTraceEnabled) {
					log.trace("Call https.request: " + JSON.stringify(reqOpts));
				}
				return https.request(reqOpts, callback);
			} else {
				if (log.isTraceEnabled) {
					log.trace("Call https.request: " + JSON.stringify(reqOpts));
				}
				return http.request(reqOpts, callback);
			}
		}
	}
}

export namespace FHttpClient {
	export const DEFAULT_TIMEOUT: number = 60000;

	export interface Opts {
		timeout?: number;
		proxyOpts?: ProxyOpts;
		sslOpts?: SslOpts;
	}

	export type ProxyOpts = HttpProxyOpts | Socks5ProxyOpts;

	export interface HttpProxyOpts {
		type: "http";
		host: string;
		port: number;
	}

	export interface Socks5ProxyOpts {
		type: "socks5";
	}

	export type SslOpts = SslOptsBase | SslCertOpts | SslPfxOpts;

	export interface SslOptsBase {
		ca?: Buffer | Array<Buffer>;
		rejectUnauthorized?: boolean;
	}

	export interface SslCertOpts extends SslOptsBase {
		key: Buffer;
		cert: Buffer;
	}

	export interface SslPfxOpts extends SslOptsBase {
		pfx: Buffer;
		passphrase: string;
	}

	export const enum HttpMethod {
		CONNECT = "CONNECT",
		DELETE = "DELETE",
		HEAD = "HEAD",
		GET = "GET",
		OPTIONS = "OPTIONS",
		PATCH = "PATCH",
		POST = "POST",
		PUT = "PUT",
		TRACE = "TRACE"
	}

	export interface Request {
		readonly url: URL;
		readonly method: HttpMethod | string;
		readonly headers?: http.OutgoingHttpHeaders;
		readonly body?: Buffer;
	}
	export interface Response {
		readonly statusCode: number;
		readonly statusDescription: string;
		readonly headers: http.IncomingHttpHeaders;
		readonly body: Buffer;
	}

	export type HttpInvokeChannel = FInvokeChannel<Request, Response>;

	/** Base error type for WebClient */
	export abstract class HttpClientError extends FException {
		private readonly _url: URL;
		private readonly _method: string;
		private readonly _requestHeaders: http.OutgoingHttpHeaders;
		private readonly _requestBody: Buffer;

		public constructor(
			url: URL, method: string,
			requestHeaders: http.OutgoingHttpHeaders, requestBody: Buffer,
			errorMessage: string,
			innerException?: FException
		) {
			super(errorMessage, innerException);
			this._url = url;
			this._method = method;
			this._requestHeaders = requestHeaders;
			this._requestBody = requestBody;
		}

		public get url(): URL { return this._url; }
		public get method(): string { return this._method; }
		public get requestHeaders(): http.OutgoingHttpHeaders { return this._requestHeaders; }
		public get requestBody(): Buffer { return this._requestBody; }
		public get requestObject(): any {
			const requestHeaders: http.OutgoingHttpHeaders = this.requestHeaders;
			let contentType: string | null = null;
			if (requestHeaders !== null) {
				const contentTypeHeaderName = Object.keys(requestHeaders).find(header => header.toLowerCase() === "content-type");
				if (contentTypeHeaderName !== undefined) {
					const headerValue = requestHeaders[contentTypeHeaderName];
					if (typeof headerValue === "string") {
						contentType = headerValue;
					}
				}
			}

			if (contentType !== "application/json") {
				throw new FExceptionInvalidOperation("Wrong operation. The property available only for 'application/json' content type requests.");
			}

			const requestBody: Buffer = this.requestBody;

			return JSON.parse(requestBody.toString("utf-8"));
		}
	}

	/**
	 * WebError is a wrapper of HTTP responses with code 4xx/5xx
	 */
	export class WebError extends HttpClientError implements Response {
		private readonly _statusCode: number;
		private readonly _statusDescription: string;
		private readonly _responseHeaders: http.IncomingHttpHeaders;
		private readonly _responseBody: Buffer;

		public constructor(
			statusCode: number, statusDescription: string,
			url: URL, method: string,
			requestHeaders: http.OutgoingHttpHeaders, requestBody: Buffer,
			responseHeaders: http.IncomingHttpHeaders, responseBody: Buffer,
			innerException?: FException
		) {
			super(url, method, requestHeaders, requestBody, `${statusCode} ${statusDescription}`, innerException);
			this._statusCode = statusCode;
			this._statusDescription = statusDescription;
			this._responseHeaders = responseHeaders;
			this._responseBody = responseBody;
		}

		public get statusCode(): number { return this._statusCode; }
		public get statusDescription(): string { return this._statusDescription; }
		public get headers(): http.IncomingHttpHeaders { return this._responseHeaders; }
		public get body(): Buffer { return this._responseBody; }
		public get object(): any {
			const headers: http.IncomingHttpHeaders = this.headers;
			const contentTypeHeaderName: string | undefined = Object.keys(headers).find(header => header.toLowerCase() === "content-type");
			if (contentTypeHeaderName !== undefined && headers[contentTypeHeaderName] !== "application/json") {
				throw new FExceptionInvalidOperation("Wrong operation. The property available only for 'application/json' content type responses.");
			}
			return JSON.parse(this.body.toString());
		}
	}

	/**
	 * CommunicationError is a wrapper over underlaying network errors.
	 * Such a DNS lookup issues, TCP connection issues, etc...
	 */
	export class CommunicationError extends HttpClientError {
		public constructor(
			url: URL, method: string,
			requestHeaders: http.OutgoingHttpHeaders, requestBody: Buffer,
			erroMessage: string, innerException?: FException
		) {
			super(url, method, requestHeaders, requestBody, erroMessage, innerException);
		}

		public get code(): string | null {
			const innerException: FException | null = this.innerException;
			if (innerException !== null && innerException instanceof FExceptionNativeErrorWrapper) {
				const error: Error & { code?: any } = innerException.nativeError;
				if ("code" in error) {
					const code = error.code;
					if (typeof (code) === "string") {
						return code;
					}
				}
			}
			return null;
		}
	}
}
