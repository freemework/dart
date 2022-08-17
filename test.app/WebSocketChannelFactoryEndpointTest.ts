import { FCancellationToken, FDisposable, FDisposableBase, FExecutionContext, FLogger, FSubscriberChannel } from "@freemework/common";
import * as _ from "lodash";
import * as WebSocket from "ws";

import * as THE from "../src/index";

class BinaryEchoChannel extends FDisposableBase implements THE.FWebSocketChannelSupplyEndpoint.BinaryChannel {
	private readonly _timeout: number;
	private readonly _handlers: Set<FSubscriberChannel.Callback<Uint8Array>>;
	private readonly _subProtocol: string;
	private _timer?: NodeJS.Timeout;
	private _echoMessage: string;

	public constructor(timeout: number, subProtocol: string) {
		super();
		this._timeout = timeout;
		this._subProtocol = subProtocol;
		this._echoMessage = "";
		this._handlers = new Set();
		console.log(`${this.constructor.name} constructed`);
	}

	public async send(executionContext: FExecutionContext, data: Uint8Array): Promise<void> {
		await sleep(50);
		const echoMessage = data.toString();
		console.log(this._subProtocol, "Receive:", echoMessage);
		this._echoMessage = echoMessage;
		if (echoMessage === "stop") {
			if (this._timer !== undefined) {
				clearTimeout(this._timer);
				delete this._timer;
			}
		} else {
			if (this._timer === undefined) {
				this._timer = setInterval(this.onTimer.bind(this), this._timeout);
			}
		}
	}

	public addHandler(cb: FSubscriberChannel.Callback<Uint8Array>): void {
		this._handlers.add(cb);
	}

	public removeHandler(cb: FSubscriberChannel.Callback<Uint8Array>): void {
		this._handlers.delete(cb);
	}

	protected onDispose() {
		if (this._timer !== undefined) {
			clearInterval(this._timer);
			delete this._timer;
		}
		this._handlers.clear();
		console.log(`${this.constructor.name} disposed`);
	}

	private onTimer() {
		const now = new Date();
		this._handlers.forEach(h => h(FExecutionContext.Empty, {
			data: Buffer.from(JSON.stringify({
				subProtocol: this._subProtocol,
				format: "text",
				data: now.toISOString(),
				echoMessage: this._echoMessage
			}))
		}));
	}
}
class TextEchoChannel extends FDisposableBase implements THE.FWebSocketChannelSupplyEndpoint.TextChannel {
	private readonly _timeout: number;
	private readonly _handlers: Set<FSubscriberChannel.Callback<string>>;
	private readonly _subProtocol: string;
	private _timer?: NodeJS.Timeout;
	private _echoMessage: string;

	public constructor(timeout: number, subProtocol: string) {
		super();
		this._timeout = timeout;
		this._subProtocol = subProtocol;
		this._echoMessage = "";
		this._handlers = new Set();
		console.log(`${this.constructor.name} constructed`);
	}

	public async send(executionContext: FExecutionContext, data: string): Promise<void> {
		await sleep(50);
		const echoMessage = data;
		console.log(this._subProtocol, "Receive:", echoMessage);
		this._echoMessage = echoMessage;
		if (echoMessage === "stop") {
			if (this._timer !== undefined) {
				clearTimeout(this._timer);
				delete this._timer;
			}
		} else {
			if (this._timer === undefined) {
				this._timer = setInterval(this.onTimer.bind(this), this._timeout);
			}
		}
	}

	public addHandler(cb: FSubscriberChannel.Callback<string>): void {
		this._handlers.add(cb);
	}

	public removeHandler(cb: FSubscriberChannel.Callback<string>): void {
		this._handlers.delete(cb);
	}

	protected onDispose() {
		if (this._timer !== undefined) {
			clearInterval(this._timer);
			delete this._timer;
		}
		this._handlers.clear();
		console.log(`${this.constructor.name} disposed`);
	}

	private onTimer() {
		const now = new Date();
		this._handlers.forEach(h => h(FExecutionContext.Empty, {
			data: JSON.stringify({
				subProtocol: this._subProtocol,
				format: "text",
				data: now.toISOString(),
				echoMessage: this._echoMessage
			})
		}));
	}
}

class TestWebSocketChannelsEndpoint extends THE.WebSocketChannelFactoryEndpoint {
	protected async createBinaryChannel(
		cancellationToken: FCancellationToken, webSocket: WebSocket, subProtocol: string
	): Promise<BinaryEchoChannel> {
		await sleep(250);
		return new BinaryEchoChannel(500, subProtocol);
	}
	protected async createTextChannel(
		cancellationToken: FCancellationToken, webSocket: WebSocket, subProtocol: string
	): Promise<TextEchoChannel> {
		await sleep(250);
		return new TextEchoChannel(500, subProtocol);
	}
}

async function main() {
	const server = new THE.UnsecuredWebServer({
		type: "http",
		listenHost: "0.0.0.0",
		listenPort: 8080,
		name: "Unsecured Server"
	});

	const wsEndpoint = new TestWebSocketChannelsEndpoint(
		[server],
		{
			bindPath: "/ws",
			defaultProtocol: "text",
			allowedProtocols: ["bin" /*, "text" - will be included automatically*/]
		}
	);

	await wsEndpoint.init(FExecutionContext.Empty);
	await server.init(FExecutionContext.Empty);

	let destroyRequestCount = 0;
	async function gracefulShutdown(signal: string) {
		if (destroyRequestCount++ === 0) {
			console.log(`Interrupt signal received: ${signal}`);
			await wsEndpoint.dispose();
			await sleep(500);
			await server.dispose();
			await sleep(500);
			process.exit(0);
		} else {
			console.log(`Interrupt signal (${destroyRequestCount}) received: ${signal}`);
		}
	}

	(["SIGTERM", "SIGINT"] as Array<NodeJS.Signals>).forEach(signal => process.on(signal, () => gracefulShutdown(signal)));
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});


function sleep(ms: number): Promise<void> {
	return new Promise(r => setTimeout(r, ms));
}

namespace ArrayBufferUtils {
	export function fromBuffer(buf: Uint8Array): ArrayBuffer {
		const ab = new ArrayBuffer(buf.length);
		const view = new Uint8Array(ab);
		for (let i = 0; i < buf.length; ++i) {
			view[i] = buf[i];
		}
		return ab;
	}

	export function toBuffer(ab: ArrayBuffer): Buffer {
		const buf = Buffer.alloc(ab.byteLength);
		const view = new Uint8Array(ab);
		for (let i = 0; i < buf.length; ++i) {
			buf[i] = view[i];
		}
		return buf;
	}
}
