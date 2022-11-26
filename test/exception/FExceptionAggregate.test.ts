import { FException, FExceptionAggregate } from "../../src/index";

import { assert } from "chai";

describe("FExceptionAggregate test", function () {
	it("should be instantable without inner errors", function () {
		const aggrError = new FExceptionAggregate([]);
		assert.equal(aggrError.message, FExceptionAggregate.name);
	});

	it("should concatenate messages from inner errors", function () {
		let err1: FException;
		let err2: FException;
		let err3: FException;

		try { throw new FException("Err1"); } catch (e) { err1 = e as FException; }
		try { throw new FException("Err2"); } catch (e) { err2 = e as FException; }
		try { throw new FException("Err3"); } catch (e) { err3 = e as FException; }

		const aggrError = new FExceptionAggregate([err1, err2, err3]);

		assert.equal(aggrError.message, "Err1\nErr2\nErr3");
		assert.equal(aggrError.toString(), `${err1.toString()}\n${err2.toString()}\n${err3.toString()}`);
	});
});
