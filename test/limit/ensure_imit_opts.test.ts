import { assert } from "chai";

import { FLimit } from "../../src/index.js";

describe("ensureLimitOpts() tests", function () {
	it(`Should pass`, function () {
		FLimit.ensureLimitOpts({ perSecond: 1 });
	});
	it(`Should raise`, function () {
		assert.throw(() => FLimit.ensureLimitOpts({ perSecond: "1" }), Error, "Wrong argument for FLimit Opts");
	});
});
