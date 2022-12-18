import { assert } from "chai";
import _ = require("lodash");

import { FConfiguration, FConfigurationException, FConfigurationValue } from "../../src";

describe("FConfiguration tests", function () {
	it("factoryJson should should contains proper sourceURI 'configuration:json?data=%7B%22a%22%3A%2242%22%7D'", function () {
		const data = {
			"a": "42"
		};

		const config = FConfiguration.factoryJson(data);

		assert.equal(config.sourceURI.toString(), `configuration:json?data=%7B%22a%22%3A%2242%22%7D`);
	});

	it("factoryJson should get value of 'a.a.a'", function () {
		const config = FConfiguration.factoryJson({
			"a.a.a": "env-own-a"
		});

		assert.equal(config.get("a.a.a").asString, "env-own-a");
	});

	it('factoryJson should expand json of {"a":{"b":{"c":42}}} into {"a.b.c":42}', function () {
		const config = FConfiguration.factoryJson(
			{
				a: {
					b: {
						c: 42
					}
				}
			}
		);

		assert.equal(config.get("a.b.c").asInteger, 42);
	});

	it('factoryJson should expand json of {"a":{"b":[{"c":40},{"c":41},{"c":42}]}} into {"a.b.0.c":40,"a.b.1.c":41,"a.b.2.c":42}', function () {
		const config = FConfiguration.factoryJson(
			{
				a: {
					b: [
						{
							c: 40
						},
						{
							c: 41
						},
						{
							c: 42
						}
					],
					"b.indexes": "0 2"
				}
			}
		);

		assert.equal(config.get("a.b.0.c").asString, "40");
		assert.equal(config.get("a.b.1.c").asString, "41");
		assert.equal(config.get("a.b.2.c").asString, "42");

		const array: ReadonlyArray<FConfiguration> = config.getArray("a.b");
		assert.equal(array.length, 2);
		assert.equal(array[0].get("c").asInteger, 40);
		assert.equal(array[1].get("c").asInteger, 42);
	});

	it('factoryJson should expand json of {"a":{"b":[{"c":40,"index":"ix0"},{"c":41,"index":"ix1"},{"c":42,"index":"ix2"}]}} into {"a.b.ix0.c":40,"a.b.ix1.c":41,"a.b.ix2.c":42}', function () {
		const config = FConfiguration.factoryJson(
			{
				a: {
					b: [
						{
							c: 40,
							index: "ix0"
						},
						{
							c: 41,
							index: "ix1",
						},
						{
							c: 42,
							index: "ix2",
						}
					],
					"b.indexes": "ix0 ix2"
				}
			}
		);

		assert.equal(config.get("a.b.ix0.c").asString, "40");
		assert.equal(config.get("a.b.ix1.c").asString, "41");
		assert.equal(config.get("a.b.ix2.c").asString, "42");

		const array: ReadonlyArray<FConfiguration> = config.getArray("a.b");
		assert.equal(array.length, 2);
		assert.equal(array[0].get("c").asInteger, 40);
		assert.equal(array[1].get("c").asInteger, 42);
	});

	it('factoryJson should expand json of {"a":{"b":[{"c":40,"idx":"ix0"},{"c":41,"idx":"ix1"},{"c":42,"idx":"ix2"}]}} into {"a.b.ix0.c":40,"a.b.ix1.c":41,"a.b.ix2.c":42}', function () {
		const config = FConfiguration.factoryJson(
			{
				a: {
					b: [
						{
							c: 40,
							idx: "ix0"
						},
						{
							c: 41,
							idx: "ix1",
						},
						{
							c: 42,
							idx: "ix2",
						}
					],
					"b.indexes": "ix0 ix2"
				}
			},
			"idx"
		);

		assert.equal(config.get("a.b.ix0.c").asString, "40");
		assert.equal(config.get("a.b.ix1.c").asString, "41");
		assert.equal(config.get("a.b.ix2.c").asString, "42");

		const array: ReadonlyArray<FConfiguration> = config.getArray("a.b");
		assert.equal(array.length, 2);
		assert.equal(array[0].get("c").asInteger, 40);
		assert.equal(array[1].get("c").asInteger, 42);
	});

	it("Empty strings should be presented as null value", function () {
		const data = { "a": "" };

		const config = FConfiguration.factoryJson(data);

		const aValueNullable: FConfigurationValue = config.get("a");
		assert.throw(() => { const _ = aValueNullable.asString; }, FConfigurationException);
		assert.isNull(aValueNullable.asStringNullable);
	});

	it("Should be able to obtain empty string via default value", function () {
		const emptyString = "";

		const data = { "a": emptyString };

		const config = FConfiguration.factoryJson(data);

		const aValueDefault: FConfigurationValue = config.get("a", emptyString);
		assert.equal(aValueDefault.asString, emptyString);
		assert.equal(aValueDefault.asStringNullable, emptyString);
	});
});
