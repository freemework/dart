import { FAggregateException, FException } from "../src/index";

import { assert } from "chai";

describe("FAggregateException test", function () {
	it("should NOT be instantable without inner errors", function () {
		let expectedErr: any;
		try {
			// tslint:disable-next-line: no-unused-expression
			new (FAggregateException as any)();
		} catch (e) {
			expectedErr = e;
		}
		assert.isDefined(expectedErr);
	});

	it("should be instantable without inner errors", function () {
		const aggrError = new FAggregateException([]);
		assert.equal(aggrError.message, FAggregateException.name);
	});

	it("should concatenate messages from inner errors", function () {
		let err1: FException;
		let err2: FException;
		let err3: FException;

		try { throw new FException("Err1"); } catch (e) { err1 = e as FException; }
		try { throw new FException("Err2"); } catch (e) { err2 = e as FException; }
		try { throw new FException("Err3"); } catch (e) { err3 = e as FException; }

		const aggrError = new FAggregateException([err1, err2, err3]);

		assert.equal(aggrError.message, "Err1\nErr2\nErr3");
		assert.equal(aggrError.toString(), `${err1.toString()}\n${err2.toString()}\n${err3.toString()}`);
	});
});
