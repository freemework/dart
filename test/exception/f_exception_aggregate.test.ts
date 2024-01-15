import { FException, FExceptionAggregate } from "../../src/index.js";

import { EOL } from "os";
import { assert } from "chai";

describe("FExceptionAggregate test", function () {
	it("should be instantable without inner errors", function () {
		new FExceptionAggregate([]);
	});

	it("should concatenate messages from inner errors", function () {
		let err1: FException;
		let err2: FException;
		let err3: FException;

		try {
			throw new FException("Err1");
		} catch (e) {
			err1 = e as FException;
		}
		try {
			throw new FException("Err2");
		} catch (e) {
			err2 = e as FException;
		}
		try {
			throw new FException("Err3");
		} catch (e) {
			err3 = e as FException;
		}

		let aggrError: FExceptionAggregate;
		try {
			throw new FExceptionAggregate([err1, err2, err3]);
		} catch (e) {
			aggrError = e as FExceptionAggregate;
		}

		assert.equal(aggrError.message, "One or more errors occurred.");
		assert.equal(
			aggrError.toString().split(EOL)[0],
			"FExceptionAggregate: One or more errors occurred. ---> FException: Err1",
		);
	});
});
