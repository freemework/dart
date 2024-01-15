import { assert } from "chai";

import {
	FConfiguration,
	FConfigurationChain,
	FConfigurationException,
	FConfigurationValue
} from "../../src/index.js";

describe("FConfigurationChain tests", function () {

	it("Generic test", function () {
		const fakeConfiguration0: FConfiguration = FConfiguration.factoryJson({
			ageString: "0",
			ageInt: "0",
			ageFloat: "0"
		});
		const fakeConfiguration1: FConfiguration = FConfiguration.factoryJson({
			ageString: "1",
			ageInt: "1",
		});
		const fakeConfiguration2: FConfiguration = FConfiguration.factoryJson({
			ageString: "2",
		});

		const chain = new FConfigurationChain(fakeConfiguration2, fakeConfiguration1, fakeConfiguration0);

		const ageStringValue: FConfigurationValue = chain.get("ageString");
		assert.equal(ageStringValue.asString, "2", "Should take value from fakeConfiguration2");
		assert.isNotNull(ageStringValue.sourceURI);
		assert.equal(ageStringValue.sourceURI!.protocol, "configuration:");

		const ageIntValue: FConfigurationValue = chain.get("ageInt");
		assert.equal(ageIntValue.asInteger, 1, "Should take value from fakeConfiguration1");
		assert.isNotNull(ageIntValue.sourceURI);
		assert.equal(ageIntValue.sourceURI!.protocol, "configuration:");

		const ageFloatValue: FConfigurationValue = chain.get("ageFloat");
		assert.equal(ageFloatValue.asNumber, 0, "Should take value from fakeConfiguration0");
		assert.isNotNull(ageFloatValue.sourceURI);
		assert.equal(ageFloatValue.sourceURI!.protocol, "configuration:");
	});

	it("issues/1", function () {
		const commonConfig: FConfiguration = FConfiguration.factoryJson({
			"boo": 12,
			"foo": 42
		});

		const overrideConfig: FConfiguration = FConfiguration.factoryJson({
			"foo": ""
		});

		const chain = new FConfigurationChain(overrideConfig, commonConfig);
		assert.equal(chain.get("boo").asInteger, 12, "Should take value from commonConfig");

		assert.isTrue(chain.has("foo"));
		assert.isTrue(chain.get("foo").isNull, "Should take empty value from overrideConfig");
		assert.throw(function () { chain.get("foo").asInteger; }, FConfigurationException);
	});

	it("Bug: legacy#6.0.33", function () {
		const cfg1 = FConfiguration.factoryJson({
			"bla": "bla"
		});
		const cfg2 = FConfiguration.factoryJson({
			"endpoint.0.type": "rest",
			"endpoint.0.servers": "main",
			"endpoint.0.bindPath": "/",
			"endpoints": "0"
		});

		const chainConfiguration = new FConfigurationChain(cfg2, cfg1);

		const endpointsConfiguration = chainConfiguration.get("endpoints").asString;
		assert.equal(endpointsConfiguration, "0");

		const endpointRootConfiguration = chainConfiguration.getNamespace(`endpoint`);
		assert.equal(endpointRootConfiguration.namespaceFull, "endpoint");

		const endpointConfiguration = endpointRootConfiguration.getNamespace(`0`);
		assert.equal(endpointConfiguration.namespaceFull, "endpoint.0");
		assert.equal(endpointConfiguration.get("type").asString, "rest");
		assert.equal(endpointConfiguration.get("servers").asString, "main");
		assert.equal(endpointConfiguration.get("bindPath").asString, "/");
	});

	it("Bug: legacy#6.0.33 (array)", function () {
		const cfg1 = FConfiguration.factoryJson({
			"bla": "bla"
		});
		const cfg2 = FConfiguration.factoryJson({
			"endpoint.0.type": "rest0",
			"endpoint.0.servers": "main0",
			"endpoint.0.bindPath": "/path0",
			"endpoint.1.type": "rest1",
			"endpoint.1.servers": "main1",
			"endpoint.1.bindPath": "/path1",
			"endpoint.2.type": "rest2",
			"endpoint.2.servers": "main2",
			"endpoint.2.bindPath": "/path2",
			"endpoint.list": "0 1 2"
		});
		const cfg3 = FConfiguration.factoryJson({
			"endpoint.list": "0 2"
		});

		const chainConfiguration = new FConfigurationChain(cfg3, cfg2, cfg1);
		assert.isObject(chainConfiguration);

		const endpointConfigurations = chainConfiguration.getArray("endpoint", "list");
		assert.equal(endpointConfigurations.length, 2);

		const endpointConfiguration0 = endpointConfigurations[0]!;
		assert.equal(endpointConfiguration0.namespaceFull, "endpoint.0");
		assert.equal(endpointConfiguration0.get("type").asString, "rest0");
		assert.equal(endpointConfiguration0.get("servers").asString, "main0");
		assert.equal(endpointConfiguration0.get("bindPath").asString, "/path0");

		const endpointConfiguration2 = endpointConfigurations[1]!;
		assert.equal(endpointConfiguration2.namespaceFull, "endpoint.2");
		assert.equal(endpointConfiguration2.get("type").asString, "rest2");
		assert.equal(endpointConfiguration2.get("servers").asString, "main2");
		assert.equal(endpointConfiguration2.get("bindPath").asString, "/path2");
	});

	it("Should return Default value", function () {
		const cfg1 = FConfiguration.factoryJson({
			"bla": "bla"
		});
		const cfg2 = FConfiguration.factoryJson({
			"la": "la"
		});

		const chainConfiguration = new FConfigurationChain(cfg2, cfg1);

		const value: FConfigurationValue = chainConfiguration.get("non", "non");
		assert.equal(value.asString, "non");
		assert.isNull(value.sourceURI);
	});

	it("Should raise error for not existing namespace", function () {
		const cfg1 = FConfiguration.factoryJson({
			"bla": "bla"
		});
		const cfg2 = FConfiguration.factoryJson({
			"la": "la"
		});

		const chainConfiguration = new FConfigurationChain(cfg2, cfg1);

		let expectedErr;
		try {
			chainConfiguration.getNamespace("none");
		} catch (e) {
			expectedErr = e;
		}

		assert.isDefined(expectedErr);
		assert.instanceOf(expectedErr, FConfigurationException);
		assert.include((expectedErr as FConfigurationException).message, "There are a problem with configuration key 'none'.");
	});

	it("Merge array items from several inner configurations", function () {
		const cfg1 = FConfiguration.factoryJson({
			"endpoint.1.type": "rest1",
			"endpoint.1.servers": "main1",
			"endpoint.indexes": "1"
		});
		const cfg2 = FConfiguration.factoryJson({
			"endpoint.2.type": "rest2",
			"endpoint.2.servers": "main2",
			"endpoint.indexes": "2"
		});
		const cfg3 = FConfiguration.factoryJson({
			"endpoint.3.type": "rest3",
			"endpoint.3.servers": "main3",
			"endpoint.indexes": "1 2"
		});

		const chainConfiguration = new FConfigurationChain(cfg3, cfg2, cfg1);

		const endpointsIndexerValue = chainConfiguration.get("endpoint.indexes");
		assert.equal(endpointsIndexerValue.asString, "1 2");

		const arrayConfigs = chainConfiguration.getArray("endpoint");
		assert.equal(arrayConfigs.length,2, "Expect two items. Only 1 and 2 defined by indexes.");

		assert.equal(arrayConfigs[0]!.get("type").asString, "rest1");
		assert.equal(arrayConfigs[0]!.get("servers").asString, "main1");

		assert.equal(arrayConfigs[1]!.get("type").asString, "rest2");
		assert.equal(arrayConfigs[1]!.get("servers").asString, "main2");
	});
});
