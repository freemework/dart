import { FException } from "../../src/index.js";

import { EOL } from "os";
import { assert } from "chai";

describe("FException test", function () {
	it("should NOT be instantable without inner errors", function () {
		let testEx: FException | undefined = undefined;
		try {
			throw new FException("Inner2");
		}
		catch (ex0) {
			try {
				throw new FException("Inner1", ex0 as FException);
			} catch (ex1) {
				try {
					throw new FException("Main", ex1 as FException);
				} catch (ex2) {
					testEx = ex2 as FException;
					// 	Console.WriteLine(ex2.Message);
					// Console.WriteLine(ex2.ToString());
				}
			}
		}

		assert.isDefined(testEx);
		assert.strictEqual(testEx.message, "Main");
		// TODO
	});

	it("should NOT be instantable without inner errors", function () {
		let testEx: FException | null = null;
		try {
			throw new FException("Inner2");
		} catch (ex0) {
			try {
				throw new FException("Inner1", ex0 as FException);
			} catch (ex1) {
				try {
					throw new FException("Main", ex1 as FException);
				} catch (ex2) {
					testEx = ex2 as FException;
				}
			}
		}

		assert.isNotNull(testEx);
		assert.equal(testEx.message, "Main");
		assert.equal(testEx.innerException!.message, "Inner1");
		assert.equal(testEx.innerException!.innerException!.message, "Inner2");
		assert.equal(
			testEx.toString().split(EOL)[0],
			"FException: Main ---> FException: Inner1 ---> FException: Inner2",
		);

		//
	});

});


