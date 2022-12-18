import { FDisposableBase } from "../lifecycle";
import { FExecutionContext } from "../execution_context";
import { FHttpClient } from "./FHttpClient";
import { FLimit } from "../limit/FLimit";
import { FCancellationExecutionContext, FCancellationToken } from "../cancellation";
import { FLimitInMemory } from "../limit/FLimitInMemory";

import * as http from "http";
import * as querystring from "querystring";

export class FWebClient extends FDisposableBase {
	protected readonly _baseUrl: URL;
	protected readonly _userAgent?: string;
	private readonly _httpClient: FHttpClient.HttpInvokeChannel;
	private readonly _limitHandle?: { instance: FLimit, timeout: number, isOwnInstance: boolean };

	public constructor(url: URL | string, opts?: FWebClient.Opts) {
		super();
		this._baseUrl = typeof url === "string" ? new URL(url) : url;
		if (opts !== undefined) {
			const { limit, httpClient, userAgent } = opts;
			if (limit !== undefined) {
				this._limitHandle = FLimit.isLimitOpts(limit.instance)
					? { instance: new FLimitInMemory(limit.instance), isOwnInstance: true, timeout: limit.timeout }
					: { instance: limit.instance, isOwnInstance: false, timeout: limit.timeout };
			}
			if (httpClient !== undefined) {
				if ("invoke" in httpClient) {
					this._httpClient = httpClient;
				} else {
					this._httpClient = new FHttpClient({ ...httpClient });
				}
			} else {
				this._httpClient = new FHttpClient();
			}
			if (userAgent !== undefined) {
				this._userAgent = userAgent;
			}
		} else {
			this._httpClient = new FHttpClient();
		}
	}

	public get(
		executionContext: FExecutionContext,
		urlPath: string,
		opts?: {
			queryArgs?: { [key: string]: string },
			headers?: http.OutgoingHttpHeaders,
			limitWeight?: number
		}
	): Promise<FWebClient.Response> {
		super.verifyNotDisposed();

		const { queryArgs = undefined, headers = undefined, limitWeight = undefined } = (() => opts || {})();
		const path = queryArgs !== undefined ?
			urlPath + "?" + querystring.stringify(queryArgs) :
			urlPath;

		return this.invoke(executionContext, path, "GET", { headers, limitWeight });
	}

	public postJson(
		executionContext: FExecutionContext,
		urlPath: string,
		opts: {
			postData: any,
			headers?: http.OutgoingHttpHeaders,
			limitWeight?: number
		}
	): Promise<FWebClient.Response> {
		// Serialize JSON if body is object
		const friendlyBody: Buffer = Buffer.from(JSON.stringify(opts.postData));
		const friendlyHeaders: http.OutgoingHttpHeaders = opts.headers !== undefined ? { ...opts.headers } : {};
		if (!("Content-Type" in friendlyHeaders)) {
			friendlyHeaders["Content-Type"] = "application/json";
		}
		friendlyHeaders["Content-Length"] = friendlyBody.byteLength;

		return this.invoke(executionContext, urlPath, "POST", {
			headers: friendlyHeaders,
			body: friendlyBody
		});
	}

	public postForm(
		executionContext: FExecutionContext,
		urlPath: string,
		opts: {
			postArgs: { [key: string]: string },
			headers?: http.OutgoingHttpHeaders,
			limitWeight?: number
		}
	): Promise<FWebClient.Response> {
		super.verifyNotDisposed();

		const { postArgs = undefined, headers = undefined, limitWeight = undefined } = (() => opts || {})();

		const bodyStr = postArgs && querystring.stringify(postArgs);
		const { body, bodyLength } = (() => {
			if (bodyStr !== undefined) {
				const bodyBuffer = Buffer.from(bodyStr);
				return { body: bodyBuffer, bodyLength: bodyBuffer.byteLength };
			} else {
				return { body: undefined, bodyLength: 0 };
			}
		})();

		const friendlyHeaders = (() => {
			const baseHeaders: http.OutgoingHttpHeaders = {
				"Content-Type": "application/x-www-form-urlencoded",
				"Content-Length": bodyLength
			};
			return headers !== undefined ? { ...baseHeaders, ...headers } : baseHeaders;
		})();

		return this.invoke(executionContext, urlPath, "POST", {
			body,
			headers: friendlyHeaders,
			limitWeight
		});
	}

	protected async invoke(
		executionContext: FExecutionContext,
		path: string,
		method: FHttpClient.HttpMethod | string,
		opts?: {
			headers?: http.OutgoingHttpHeaders,
			body?: Buffer,
			limitWeight?: number
		}): Promise<FWebClient.Response> {
		super.verifyNotDisposed();

		const cancellationToken: FCancellationToken = FCancellationExecutionContext.of(executionContext).cancellationToken;

		let friendlyBody: Buffer | null = null;
		let friendlyHeaders: http.OutgoingHttpHeaders = {};
		let limitToken: FLimit.Token | null = null;
		let limitWeight: number = 1;

		if (opts !== undefined) {
			const { headers, body } = opts;

			if (headers !== undefined) {
				friendlyHeaders = { ...headers };
			}

			if (this._userAgent !== undefined && !("User-Agent" in friendlyHeaders)) {
				friendlyHeaders["User-Agent"] = this._userAgent;
			}

			if (body !== undefined) {
				friendlyBody = body;
			}

			if (opts.limitWeight !== undefined) {
				limitWeight = opts.limitWeight;
			}
		}

		try {
			if (this._limitHandle !== undefined) {
				const a = await this._limitHandle.instance.accrueTokenLazy(limitWeight, this._limitHandle.timeout, cancellationToken);
				limitToken = a;
			} else {
				friendlyHeaders["X-FLimit-Weight"] = limitWeight;
			}

			const url: URL = new URL(path, this._baseUrl);

			const invokeArgs: { -readonly [P in keyof FHttpClient.Request]: FHttpClient.Request[P]; } = {
				url, method, headers: friendlyHeaders
			};
			if (friendlyBody !== null) {
				invokeArgs.body = friendlyBody;
			}
			const invokeResponse: FHttpClient.Response =
				await this._httpClient.invoke(executionContext, invokeArgs);

			const { statusCode, statusDescription, headers: responseHeaders, body } = invokeResponse;

			const response: FWebClient.Response = {
				get statusCode() { return statusCode; },
				get statusDescription() { return statusDescription; },
				get headers() { return responseHeaders; },
				get body() { return body; },
				get bodyAsJson() { return JSON.parse(body.toString()); }
			};

			if (limitToken !== null) {
				limitToken.commit();
			}

			return response;
		} catch (e) {
			if (limitToken !== null) {
				if (e instanceof FHttpClient.CommunicationError) {
					// Token was not spent due server side did not do any jobs
					limitToken.rollback();
				} else {
					limitToken.commit();
				}
			}
			throw e;
		}
	}

	protected async onDispose(): Promise<void> {
		if (this._limitHandle !== undefined) {
			if (this._limitHandle.isOwnInstance) {
				await this._limitHandle.instance.dispose();
			}
		}
	}
}
export namespace FWebClient {
	export interface LimitOpts {
		instance: FLimit.Opts | FLimit;
		timeout: number;
	}

	export interface Opts {
		readonly httpClient?: FHttpClient.Opts | FHttpClient.HttpInvokeChannel;
		readonly limit?: LimitOpts;
		readonly userAgent?: string;
	}

	export interface Response extends FHttpClient.Response {
		readonly bodyAsJson: any;
	}
}
