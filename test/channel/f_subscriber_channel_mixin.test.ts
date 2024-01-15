import { assert } from "chai";

import { FException, FExecutionContext, FChannelSubscriber, FChannelSubscriberMixin } from "../../src/index.js";

describe("FChannelSubscriberMixin tests", function () {
	class MyNotifier implements FChannelSubscriber<string> {
		public crash(ex: FException) {
			return this.notify(FExecutionContext.Empty, ex);
		}
		public test(data: string) {
			return this.notify(FExecutionContext.Empty, { data });
		}
	}
	interface MyNotifier extends FChannelSubscriberMixin<string> { }
	FChannelSubscriberMixin.applyMixin(MyNotifier);


	it("Positive test", async function () {
		const instance = new MyNotifier();

		let callCount = 0;
		let eventData: Array<string> = [];

		function handler(_: FExecutionContext, event: FChannelSubscriber.Event<string> | FException) {
			++callCount;

			if (event instanceof Error) { return Promise.resolve(); }

			eventData.push(event.data);

			return Promise.resolve();
		}
		instance.addHandler(handler);
		instance.addHandler(handler);
		await instance.test("one");
		await instance.test("two");
		instance.removeHandler(handler);
		await instance.test("three");
		instance.removeHandler(handler);
		await instance.test("four");

		assert.equal(callCount, 5);
		assert.equal(eventData.length, 5);
		assert.equal(eventData[0], "one");
		assert.equal(eventData[1], "one");
		assert.equal(eventData[2], "two");
		assert.equal(eventData[3], "two");
		assert.equal(eventData[4], "three");
	});

	it("Negative test", async function () {
		const instance = new MyNotifier();

		let callCount = 0;

		let errors: Array<Error> = [];

		function handler(_: FExecutionContext, event: FChannelSubscriber.Event<string> | FException) {
			++callCount;

			if (event instanceof Error) {
				errors.push(event);
			}

			return Promise.resolve();
		}
		instance.addHandler(handler);
		instance.addHandler(handler);
		await instance.crash(new FException("one"));
		instance.removeHandler(handler);
		await instance.crash(new FException("two"));
		instance.removeHandler(handler);
		await instance.crash(new FException("three"));

		assert.equal(callCount, 2);
		assert.equal(errors.length, 2);
		assert.equal(errors[0]!.message, "one");
		assert.equal(errors[1]!.message, "one", "handler should called twice with first exception.");
	});
});
