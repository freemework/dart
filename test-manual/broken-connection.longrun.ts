/*
// Launch:
//   node --require=ts-node/register test/broken-connection.longrun.ts
*/


import {
	FException,
	FExecutionContext,
	FSleep,
	FUsing,
} from "@freemework/common";

import { FSqlConnectionFactoryPostgres } from "../src";

function getOpts(): FSqlConnectionFactoryPostgres.Opts {
	function parseDbServerUrl(url: string): URL {
		try {
			return new URL(url);
		} catch (e) {
			const ex: FException = FException.wrapIfNeeded(e);
			throw new Error(`Wrong TEST_DB_URL = ${url}. ${ex.message}.`);
		}
	}

	if ("TEST_DB_URL" in process.env) {
		const urlStr = process.env.TEST_DB_URL as string;
		switch (urlStr) {
			case "postgres://": {
				const host = "localhost";
				const port = 5432;
				const user = "devuser";
				const postgresUrl = new URL(`postgres://${user}@${host}:${port}/devdb`);
				return { url: postgresUrl };
			}
		}

		const url = parseDbServerUrl(urlStr);
		switch (url.protocol) {
			case "postgres:": return { url };
			default:
				throw new Error(`Not supported DB Server protocol = ${process.env.TEST_DB_URL}`);
		}
	} else {
		throw new Error("TEST_DB_URL environment is not defined. Please set the variable to use these tests.");
	}
}

(async function main() {
	await FUsing(
		FExecutionContext.Empty,
		() => new FSqlConnectionFactoryPostgres(getOpts()),
		async (cancellationToken, sqlConnectionFactory) => {
			await sqlConnectionFactory.usingConnection(cancellationToken, async (sqlConnection) => {
				return (await sqlConnection.statement("SELECT 1").executeScalar(cancellationToken)).asInteger;
			});

			console.log("First query was completed. Please disconnect and connect your network adapter to force terminate SQL connection. Expectation no any unhandled errors.");
			console.log("Sleeping 30 seconds...");
			await FSleep(cancellationToken, 30000);

			await sqlConnectionFactory.usingConnection(cancellationToken, async (sqlConnection) => {
				return (await sqlConnection.statement("SELECT 1").executeScalar(cancellationToken)).asInteger;
			});
			console.log("Second query was completed.");
		}
	);

})().catch(console.error);
