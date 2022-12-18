import { FCancellationTokenSourceManual, FCancellationException, FExceptionInvalidOperation, FExecutionContext, FCancellationExecutionContext, FHttpClient } from "../../src";

import { assert } from "chai";
import { URL } from "url";

import { Socket, Server } from "net";
import * as http from "http";

function nextTick() {
	return new Promise(resolve => process.nextTick(resolve));
}

describe("FHttpClient tests", function () {
	describe("Tests without proxy", function () {
		it("FHttpClient should GET http:", async function () {
			const httpClient = new FHttpClient({ timeout: 5000 });
			await httpClient.invoke(FExecutionContext.Default, {
				//				url: new URL("?a", "http://www.google.com"),
				url: new URL("?a", "https://echo.zxteam.org"),
				method: "GET",
				headers: { test: "test" }
			});
		});

		it("FHttpClient should GET https:", async function () {
			const httpClient = new FHttpClient({ timeout: 5000 });
			await httpClient.invoke(FExecutionContext.Default, {
				//url: new URL("?a", "https://www.google.com"),
				url: new URL("?a", "https://echo.zxteam.org"),
				method: "GET",
				headers: { test: "test" }
			});
		});

		it("FHttpClient should cancel() invoke", async function () {
			const cts = new FCancellationTokenSourceManual();
			const cancellationExecutionContext: FExecutionContext = new FCancellationExecutionContext(
				FExecutionContext.Default,
				cts.token
			);

			let expectedError;
			let thenCalled = false;

			const httpClient = new FHttpClient({ timeout: 5000 });
			httpClient.invoke(cancellationExecutionContext, {
				url: new URL("?a", "http://www.google.com"),
				method: "GET",
				headers: { test: "test" }
			})
				.then(() => { thenCalled = true; })
				.catch((reason) => { expectedError = reason; });

			await nextTick();
			cts.cancel();
			await nextTick();

			assert.isFalse(thenCalled);
			assert.isDefined(expectedError);
			assert.instanceOf(expectedError, FCancellationException);
		});

		it("Should handle HTTP 301 as normal response", async function () {
			const listeningDefer: any = {};
			listeningDefer.promise = new Promise(r => { listeningDefer.resolve = r; });
			const fakeServer = new http.Server((req, res) => {
				res.writeHead(301, "Fake moved");
				res.end("Fake data");
			});
			fakeServer.listen(65535, "127.0.0.1", () => {
				listeningDefer.resolve();
			});
			await listeningDefer.promise;
			try {
				const httpClient = new FHttpClient({ timeout: 500 });
				const response = await httpClient.invoke(FExecutionContext.Default, { url: new URL("http://127.0.0.1:65535"), method: "GET" });

				assert.isDefined(response);
				assert.equal(response.statusCode, 301);
				assert.equal(response.statusDescription, "Fake moved");
				assert.equal((response.body as Buffer).toString(), "Fake data");
			} finally {
				const closeDefer: any = {};
				closeDefer.promise = new Promise(r => { closeDefer.resolve = r; });
				fakeServer.close(() => closeDefer.resolve());
				await closeDefer.promise;
			}
		});

		describe("Error handling tests", async function () {
			/*
				Possible socket errors:
					CommunicationError wraps following cases:
						- Refused,
						- DNS Resolve problem
						- Connection Timeout
						- Connection closed by server
						- etc
					WebError wraps HTTP errors

			 */


			it("Should handle Socket Refused as CommunicationError", async function () {
				const httpClient = new FHttpClient();
				let expectedError;
				try {
					await httpClient.invoke(FExecutionContext.Default, { url: new URL("http://localhost:1"), method: "GET" });
				} catch (e) {
					expectedError = e;
				}
				assert.isDefined(expectedError);
				assert.instanceOf(expectedError, FHttpClient.CommunicationError);
				assert.instanceOf((expectedError as FHttpClient.CommunicationError).innerException, Error);
				assert.include((expectedError as FHttpClient.CommunicationError).code, "ECONNREFUSED");
			});
			it("Should handle DNS Resolve problem as CommunicationError", async function () {
				const httpClient = new FHttpClient();
				let expectedError;
				try {
					await httpClient.invoke(FExecutionContext.Default, { url: new URL("http://not.existing.domain.local"), method: "GET" });
				} catch (e) {
					expectedError = e;
				}
				assert.isDefined(expectedError);
				assert.instanceOf(expectedError, FHttpClient.CommunicationError);
				assert.instanceOf((expectedError as FHttpClient.CommunicationError).innerException, Error);
				const code = (expectedError as FHttpClient.CommunicationError).code;
				assert.isTrue(code === 'ENOTFOUND' || code ==='EAI_AGAIN', `Expected code '${code}' of CommunicationError should be 'ENOTFOUND' or 'EAI_AGAIN'`);
			});
			it("Should handle Connection Timeout (before connect) as CommunicationError", async function () {
				const httpClient = new FHttpClient({ timeout: 50 });
				let expectedError;
				try {
					// Connecting to NON existng IP to emulate connect timeout
					await httpClient.invoke(FExecutionContext.Default, { url: new URL("http://192.168.255.255:65535"), method: "GET" });
				} catch (e) {
					expectedError = e;
				}
				assert.isDefined(expectedError);
				assert.instanceOf(expectedError, FHttpClient.CommunicationError);
				assert.instanceOf((expectedError as FHttpClient.CommunicationError).innerException, Error);
				assert.include((expectedError as FHttpClient.CommunicationError).innerException!.message, "socket hang up");
			});
			it("Should handle Connection Timeout (after connect) as CommunicationError", async function () {
				const listeningDefer: any = {};
				listeningDefer.promise = new Promise(r => { listeningDefer.resolve = r; });
				const fakeServer = new Server();
				let serverSocket: any = null;
				fakeServer.on("connection", (socket) => {
					// Do nothing with socket. Emulate timeout after connect
					serverSocket = socket;
				});
				fakeServer.listen(65535, "127.0.0.1", () => {
					listeningDefer.resolve();
				});
				await listeningDefer.promise;
				try {
					const httpClient = new FHttpClient({ timeout: 50 });
					let expectedError;
					try {
						await httpClient.invoke(FExecutionContext.Default, { url: new URL("http://127.0.0.1:65535"), method: "GET" });
					} catch (e) {
						expectedError = e;
					}
					assert.isDefined(expectedError);
					assert.instanceOf(expectedError, FHttpClient.CommunicationError);
					assert.instanceOf((expectedError as FHttpClient.CommunicationError).innerException, Error);
					assert.include((expectedError as FHttpClient.CommunicationError).innerException!.message, "socket hang up");
				} finally {
					const closeDefer: any = {};
					closeDefer.promise = new Promise(r => { closeDefer.resolve = r; });
					fakeServer.close(() => closeDefer.resolve());
					if (serverSocket !== null) { (serverSocket as Socket).destroy(); }
					await closeDefer.promise;
				}
			});
			it("Should handle Connection closed by server as CommunicationError", async function () {
				const listeningDefer: any = {};
				listeningDefer.promise = new Promise(r => { listeningDefer.resolve = r; });
				const fakeServer = new Server();
				fakeServer.on("connection", (socket) => {
					setTimeout(() => socket.destroy(), 10);
				});
				fakeServer.listen(65535, "127.0.0.1", () => {
					listeningDefer.resolve();
				});
				await listeningDefer.promise;
				try {
					const httpClient = new FHttpClient({ timeout: 1000 });
					let expectedError;
					try {
						await httpClient.invoke(FExecutionContext.Default, { url: new URL("http://127.0.0.1:65535"), method: "GET" });
					} catch (e) {
						expectedError = e;
					}
					assert.isDefined(expectedError);
					assert.instanceOf(expectedError, FHttpClient.CommunicationError);
					assert.instanceOf((expectedError as FHttpClient.CommunicationError).innerException, Error);
					assert.include((expectedError as FHttpClient.CommunicationError).code, "ECONNRESET");
				} finally {
					const closeDefer: any = {};
					closeDefer.promise = new Promise(r => { closeDefer.resolve = r; });
					fakeServer.close(() => closeDefer.resolve());
					await closeDefer.promise;
				}
			});
			it("Should handle HTTP 404 as WebError", async function () {
				const listeningDefer: any = {};
				listeningDefer.promise = new Promise(r => { listeningDefer.resolve = r; });
				const fakeServer = new http.Server((req, res) => {
					res.writeHead(404, "Fake not found");
					res.end("Fake data");
				});
				fakeServer.listen(65535, "127.0.0.1", () => {
					listeningDefer.resolve();
				});
				await listeningDefer.promise;
				try {
					const httpClient = new FHttpClient({ timeout: 500 });
					let expectedError;
					try {
						await httpClient.invoke(FExecutionContext.Default, { url: new URL("http://127.0.0.1:65535"), method: "GET" });
					} catch (e) {
						expectedError = e;
					}
					assert.isDefined(expectedError);
					assert.instanceOf(expectedError, FHttpClient.WebError);
					assert.instanceOf((expectedError as FHttpClient.WebError).body, Buffer);
					assert.equal((expectedError as FHttpClient.WebError).body.toString(), "Fake data");
				} finally {
					const closeDefer: any = {};
					closeDefer.promise = new Promise(r => { closeDefer.resolve = r; });
					fakeServer.close(() => closeDefer.resolve());
					await closeDefer.promise;
				}
			});
			it("Should provide requestObject on WebError for application/json content", async function () {
				const listeningDefer: any = {};
				listeningDefer.promise = new Promise(r => { listeningDefer.resolve = r; });
				const fakeServer = new http.Server((req, res) => {
					res.writeHead(404, "Fake not found");
					res.end("Fake data");
				});
				fakeServer.listen(65535, "127.0.0.1", () => {
					listeningDefer.resolve();
				});
				await listeningDefer.promise;
				try {
					const httpClient = new FHttpClient({ timeout: 500 });
					let expectedError;
					try {
						await httpClient.invoke(FExecutionContext.Default, {
							url: new URL("http://127.0.0.1:65535"),
							headers: {
								"Content-Type": "application/json"
							},
							method: "POST",
							body: Buffer.from(JSON.stringify({ test: 42 }))
						});
					} catch (e) {
						expectedError = e;
					}
					assert.isDefined(expectedError);
					assert.instanceOf(expectedError, FHttpClient.WebError);
					assert.instanceOf((expectedError as FHttpClient.WebError).body, Buffer);
					assert.instanceOf((expectedError as FHttpClient.WebError).requestBody, Buffer);
					assert.deepEqual((expectedError as FHttpClient.WebError).requestObject, { test: 42 });
				} finally {
					const closeDefer: any = {};
					closeDefer.promise = new Promise(r => { closeDefer.resolve = r; });
					fakeServer.close(() => closeDefer.resolve());
					await closeDefer.promise;
				}
			});
			it("Should NOT provide requestObject on WebError for non application/json content", async function () {
				const listeningDefer: any = {};
				listeningDefer.promise = new Promise(r => { listeningDefer.resolve = r; });
				const fakeServer = new http.Server((req, res) => {
					res.writeHead(404, "Fake not found");
					res.end("Fake data");
				});
				fakeServer.listen(65535, "127.0.0.1", () => {
					listeningDefer.resolve();
				});
				await listeningDefer.promise;
				try {
					const httpClient = new FHttpClient({ timeout: 500 });
					let expectedError;
					try {
						await httpClient.invoke(FExecutionContext.Default, {
							url: new URL("http://127.0.0.1:65535"),
							headers: {
								"Content-Type": "text/plain"
							},
							method: "POST",
							body: Buffer.from("test")
						});
					} catch (e) {
						expectedError = e;
					}
					assert.isDefined(expectedError);
					assert.instanceOf(expectedError, FHttpClient.WebError);
					assert.instanceOf((expectedError as FHttpClient.WebError).body, Buffer);
					assert.instanceOf((expectedError as FHttpClient.WebError).requestBody, Buffer);

					let expectedError2;
					try { const dummy = (expectedError as FHttpClient.WebError).requestObject; } catch (e) { expectedError2 = e; }
					assert.isDefined(expectedError2);
					assert.instanceOf(expectedError2, FExceptionInvalidOperation);
				} finally {
					const closeDefer: any = {};
					closeDefer.promise = new Promise(r => { closeDefer.resolve = r; });
					fakeServer.close(() => closeDefer.resolve());
					await closeDefer.promise;
				}
			});
		});
	});

	describe.skip("Tests with proxy", function () {
		const proxyOpts: FHttpClient.ProxyOpts = {
			type: "http",
			host: "localhost",
			port: 3128
		};
		it("FHttpClient should GET http: with proxy", async function () {
			const httpClient = new FHttpClient({ proxyOpts });
			const res = await httpClient.invoke(FExecutionContext.Default, {
				method: "GET",
				url: new URL("http://www.google.com?a"),
				headers: { test: "test" }
			});
		});

		it("FHttpClient should GET https: with proxy", async function () {
			const httpClient = new FHttpClient({ proxyOpts });
			const res = await httpClient.invoke(FExecutionContext.Default, {
				method: "GET",
				url: new URL("http://www.google.com?a"),
				headers: { test: "test" }
			});
		});

		it("FHttpClient should GET data from Poloniex: with proxy", async function () {
			const httpClient = new FHttpClient({ proxyOpts });
			const res = await httpClient.invoke(FExecutionContext.Default, {
				method: "GET",
				url: new URL("https://poloniex.com/public?command=returnTicker")
			});
			assert.hasAnyKeys(JSON.parse(res.toString()), ["BTC_BCN", "BTC_ZEC", "ETH_ZEC"]);
		});
	});
});
