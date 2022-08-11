import { assert } from "chai";

import { FEventChannel, FEventChannelMixin, FException, FExceptionAggregate, FExecutionContext } from "../../src";

describe("FEventChannelMixin tests", function () {
	class MyNotifier implements FEventChannel<string> {
		public test(data: string) {
			return this.notify(FExecutionContext.Empty, { data });
		}
	}
	interface MyNotifier extends FEventChannelMixin<string> { }
	FEventChannelMixin.applyMixin(MyNotifier);


	it("Positive test", async function () {
		const instance = new MyNotifier();

		let callCount = 0;
		let eventData: Array<string> = [];

		async function handler(executionContext: FExecutionContext, event: FEventChannel.Event<string>) {
			await new Promise(wakeup => setTimeout(wakeup, 50));
			++callCount;
			eventData.push(event.data);
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

		class MyTestError extends FException { }

		async function handler(executionContext: FExecutionContext, event: FEventChannel.Event<string>) {
			await new Promise(wakeup => setTimeout(wakeup, 50));
			++callCount;
			throw new MyTestError(event.data);
		}
		instance.addHandler(handler);
		instance.addHandler(handler);

		let expectedError: FException | undefined = undefined;
		try {
			await instance.test("nonce");
		} catch (e) {
			const ex = FException.wrapIfNeeded(e);
			expectedError = ex;
		}

		assert.equal(callCount, 2);
		assert.isDefined(expectedError);
		assert.instanceOf(expectedError, FExceptionAggregate);
		assert.equal((expectedError as FExceptionAggregate).innerExceptions.length, 2);
		assert.instanceOf((expectedError as FExceptionAggregate).innerExceptions[0], MyTestError);
		assert.instanceOf((expectedError as FExceptionAggregate).innerExceptions[1], MyTestError);
		assert.equal((expectedError as FExceptionAggregate).innerExceptions[0].message, "nonce");
		assert.equal((expectedError as FExceptionAggregate).innerExceptions[1].message, "nonce");
	});
});
