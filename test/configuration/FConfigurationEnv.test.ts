import { assert } from "chai";

import { FConfiguration, FConfigurationException } from "@freemework/common";

import { FConfigurationEnv } from "../../src/index.js";

describe("FConfigurationEnv basic tests", function () {
	it("Should get value of 'a.a.a'", function () {
		process.env["a.a.a"] = "env-own-a";
		try {
			const config = new FConfigurationEnv();

			// Env 'a__a__a' should loaded as 'a.a.a'.
			assert.equal(config.get("a.a.a").asString, "env-own-a");
		} finally {
			delete process.env["a.a.a"];
		}
	});

	it("Should get value of 'a__a__a' via 'a.a.a'", function () {
		process.env["a__a__a"] = "env-own-a";
		try {
			const config = new FConfigurationEnv();

			// Env 'a__a__a' should loaded as 'a.a.a'.
			assert.equal(config.get("a.a.a").asString, "env-own-a");
		} finally {
			delete process.env["a__a__a"];
		}
	});

	it("Should NOT get value of 'a__a__a' via 'a__a__a'", function () {
		process.env["a__a__a"] = "env-own-a";
		try {
			const config = new FConfigurationEnv();
			// Env 'a__a__a' should loaded as 'a.a.a'.
			assert.throw(() => config.get("a__a__a"), FConfigurationException);
		} finally {
			delete process.env["a__a__a"];
		}
	});
});

describe("FConfigurationEnv Regression 0.10.11", function () {
	it("FConfigurationEnv.getArray should provide index key", function () {

		process.env["edgebus.setup.topic.indexes"] = "TOPC201f5dddf40e4ef9b6b9de17ad37bb76";
		process.env["edgebus.setup.topic.TOPC201f5dddf40e4ef9b6b9de17ad37bb76.name"] = "my-topic";
		process.env["edgebus.setup.topic.TOPC201f5dddf40e4ef9b6b9de17ad37bb76.description"] = "Some messages";
		process.env["edgebus.setup.topic.TOPC201f5dddf40e4ef9b6b9de17ad37bb76.mediaType"] = "application/json";
		try {
			const config: FConfigurationEnv = new FConfigurationEnv();

			const setupNamespace: FConfiguration = config.getNamespace("edgebus.setup");
			const topics: Array<FConfiguration> = setupNamespace.getArray("topic");

			assert.equal(topics.length, 1);

			const topic: FConfiguration = topics[0]!;

			const topicKeys: ReadonlyArray<string> = topic.keys;

			assert.notInclude(topicKeys, "index");
		} finally {
			delete process.env["edgebus.setup.topic.indexes"];
			delete process.env["edgebus.setup.topic.TOPC201f5dddf40e4ef9b6b9de17ad37bb76.name"];
			delete process.env["edgebus.setup.topic.TOPC201f5dddf40e4ef9b6b9de17ad37bb76.description"];
			delete process.env["edgebus.setup.topic.TOPC201f5dddf40e4ef9b6b9de17ad37bb76.mediaType"];
		}
	});
});
