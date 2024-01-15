import { assert } from "chai";

import { FEnsure, FEnsureException } from "../src/index.js";

describe("FEnsure tests", function () {
	let ensure: FEnsure;
	let ensureWithCustomError: FEnsure;
	beforeEach(function () {
		ensure = FEnsure.create();
		ensureWithCustomError = FEnsure.create((m, _) => { throw new Error(m); });
	});

	const specs = {
		s: [
			"array", "arrayBuffer", "boolean", "date", "defined", "integer",
			"number", "string", "undefined",
			"arrayNullable", "arrayBufferNullable",
			"booleanNullable", "dateNullable", "definedNullable",
			"integerNullable", "numberNullable", "stringNullable"
		],
		useCases: [
			{
				name: "array",
				data: [1, 2, 3],
				should: ["array", "defined", "arrayNullable", "definedNullable"]
			},
			{
				name: "ArrayBuffer",
				data: new ArrayBuffer(0),
				should: ["arrayBuffer", "defined", "arrayBufferNullable", "definedNullable"]
			},
			{
				name: "Boolean (true)",
				data: true,
				should: ["boolean", "defined", "booleanNullable", "definedNullable"]
			},
			{
				name: "Boolean (false)",
				data: false,
				should: ["boolean", "defined", "booleanNullable", "definedNullable"]
			},
			{
				name: "date",
				data: new Date(),
				should: ["date", "defined", "dateNullable", "definedNullable"]
			},
			{
				name: "integer",
				data: 42,
				should: ["defined", "definedNullable", "integer", "integerNullable", "numberNullable", "number"]
			},
			{
				name: "number",
				data: 42.42,
				should: ["defined", "definedNullable", "numberNullable", "number"]
			},
			{
				name: "string",
				data: "42",
				should: ["defined", "definedNullable", "stringNullable", "string"]
			},
			{
				name: "null",
				data: null,
				should: [
					"arrayNullable", "arrayBufferNullable", "booleanNullable",
					"dateNullable", "definedNullable", "integerNullable",
					"numberNullable", "stringNullable"
				]
				},
				{
					name: "undefined",
					data: undefined,
					should: ["undefined"]
			}
		]
	};

	specs.useCases.forEach(useCase => {
		useCase.should.forEach(should => {
			it(`Default FEnsure ${useCase.name} should work with ${should}`, function () {
				const data = useCase.data;
				const result = (ensure as any)[should](data);
				assert.equal(data, result);
			});
			it(`Custom FEnsure ${useCase.name} should work with ${should}`, function () {
				const data = useCase.data;
				const result = (ensureWithCustomError as any)[should](data);
				assert.equal(data, result);
			});
		});
		specs.s.forEach(shouldNot => {
			const applyShouldNot: boolean = useCase.should.indexOf(shouldNot) === -1;
			if (applyShouldNot) {
				it(`Default FEnsure ${useCase.name} should NOT work with ${shouldNot}`, function () {
					const data = useCase.data;
					let expectedError;
					try {
						(ensure as any)[shouldNot](data);
					} catch (e) {
						expectedError = e;
					}
					assert.isDefined(expectedError);
				});
				it(`Default FEnsure ${useCase.name} should NOT work with ${shouldNot} (custom err message)`, function () {
					const data = useCase.data;
					let expectedError: any;
					try {
						(ensure as any)[shouldNot](data, "Custom err message");
					} catch (e) {
						expectedError = e;
					}
					assert.isDefined(expectedError);
					assert.instanceOf(expectedError, FEnsureException);
					assert.include(expectedError.message, "Custom err message");
				});
				it(`Custom FEnsure ${useCase.name} should NOT work with ${shouldNot}`, function () {
					const data = useCase.data;
					let expectedError;
					try {
						(ensureWithCustomError as any)[shouldNot](data);
					} catch (e) {
						expectedError = e;
					}
					assert.isDefined(expectedError);
				});
				it(`Custom FEnsure ${useCase.name} should NOT work with ${shouldNot} (custom err message)`, function () {
					const data = useCase.data;
					let expectedError: any;
					try {
						(ensureWithCustomError as any)[shouldNot](data, "Custom err message");
					} catch (e) {
						expectedError = e;
					}
					assert.isDefined(expectedError);
					assert.instanceOf(expectedError, Error);
					assert.include(expectedError.message, "Custom err message");
				});
			}
		});
	});

	it(`FEnsure undefined should NOT work defined()`, function () {
		let expectedError;
		try {
			ensure.defined(undefined);
		} catch (e) {
			expectedError = e;
		}
		assert.isDefined(expectedError);
	});
	it(`FEnsure undefined should NOT work definedNullable()`, function () {
		let expectedError;
		try {
			ensure.definedNullable(undefined);
		} catch (e) {
			expectedError = e;
		}
		assert.isDefined(expectedError);
	});
	it(`FEnsure undefined should NOT work defined()`, function () {
		let expectedError;
		try {
			ensureWithCustomError.defined(undefined);
		} catch (e) {
			expectedError = e;
		}
		assert.isDefined(expectedError);
	});
	it(`FEnsure undefined should NOT work definedNullable()`, function () {
		let expectedError;
		try {
			ensureWithCustomError.definedNullable(undefined);
		} catch (e) {
			expectedError = e;
		}
		assert.isDefined(expectedError);
	});
	it(`FEnsure undefined should NOT work defined()`, function () {
		let expectedError: any;
		try {
			ensure.defined(undefined, "Custom err message");
		} catch (e) {
			expectedError = e;
		}
		assert.isDefined(expectedError);
		assert.instanceOf(expectedError, FEnsureException);
		assert.include(expectedError.message, "Custom err message");
	});
	it(`FEnsure undefined should NOT work definedNullable()`, function () {
		let expectedError: any;
		try {
			ensure.definedNullable(undefined, "Custom err message");
		} catch (e) {
			expectedError = e;
		}
		assert.isDefined(expectedError);
		assert.instanceOf(expectedError, FEnsureException);
		assert.include(expectedError.message, "Custom err message");
	});
	it(`FEnsure undefined should NOT work defined()`, function () {
		let expectedError: any;
		try {
			ensure.defined(undefined, "Custom err message");
		} catch (e) {
			expectedError = e;
		}
		assert.isDefined(expectedError);
		assert.instanceOf(expectedError, FEnsureException);
		assert.include(expectedError.message, "Custom err message");
	});
	it(`FEnsure undefined should NOT work definedNullable()`, function () {
		let expectedError: any;
		try {
			ensure.definedNullable(undefined, "Custom err message");
		} catch (e) {
			expectedError = e;
		}
		assert.isDefined(expectedError);
		assert.instanceOf(expectedError, FEnsureException);
		assert.include(expectedError.message, "Custom err message");
	});
	it(`FEnsure undefined should NOT work stringNullable()`, function () {
		let expectedError: any;
		try {
			ensure.stringNullable(undefined as any, "Custom err message");
		} catch (e) {
			expectedError = e;
		}
		assert.isDefined(expectedError);
		assert.instanceOf(expectedError, FEnsureException);
		assert.include(expectedError.message, "Custom err message");
	});
});
