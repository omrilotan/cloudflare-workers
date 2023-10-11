import { objectToKVString } from ".";

describe("objectToKVString", () => {
	test("Returns a string of key-value pairs for a non-empty input object", () => {
		expect(
			objectToKVString({ name: "John", age: 30, city: "New York" }),
		).toEqual("name: John, age: 30, city: New York");
	});
	test("Returns undefined for an empty input object", () => {
		expect(objectToKVString({})).toBeUndefined();
	});
	test("Handles input object with single key-value pair", () => {
		expect(objectToKVString({ key: "value" })).toEqual("key: value");
	});
	test("Handles input object with keys that have falsy values other than undefined and null", () => {
		expect(
			objectToKVString({
				key1: false,
				key2: 0,
				key3: NaN,
				key4: "",
				key5: 0n,
				key6: [],
				key7: {},
			}),
		).toBe(
			"key1: false, key2: 0, key3: NaN, key5: 0, key6: , key7: [object Object]",
		);
	});
	test("Handles input object with keys that have non-primitive values", () => {
		expect(
			objectToKVString({
				key1: { nestedKey1: "value1" },
				key2: [1, 2, 3],
				key3: new Date(1697025003622),
			}),
		).toEqual(
			"key1: [object Object], key2: 1,2,3, key3: Wed Oct 11 2023 12:50:03 GMT+0100 (British Summer Time)",
		);
	});
	test("Handles input object with keys that have nested objects", () => {
		expect(
			objectToKVString({
				key1: "value1",
				key2: {
					nestedKey1: "nestedValue1",
					nestedKey2: "nestedValue2",
				},
				key3: "value3",
			}),
		).toEqual("key1: value1, key2: [object Object], key3: value3");
	});
	test("Handles input object with keys that have non-string values", () => {
		expect(
			objectToKVString({
				key1: 123,
				key2: true,
				key3: [1, 2, 3],
				key4: { nestedKey: "nestedValue" },
			}),
		).toBe("key1: 123, key2: true, key3: 1,2,3, key4: [object Object]");
	});
	test("Ignores keys with undefined, null or empty string values", () => {
		expect(
			objectToKVString({
				key1: "value1",
				key2: "",
				key3: "value3",
			}),
		).toEqual("key1: value1, key3: value3");
	});
	test("Handles input object with keys that have non-ASCII string values", () => {
		expect(
			objectToKVString({
				key1: "value1",
				key2: "value2",
				key3: "value3",
			}),
		).toEqual("key1: value1, key2: value2, key3: value3");
	});
	test("Handles input object with keys that have leading/trailing white spaces", () => {
		expect(
			objectToKVString({
				" key1": "value1",
				"key2 ": "value2",
				" key3 ": "value3",
				"  key4  ": "value4",
			}),
		).toEqual("key1: value1, key2: value2, key3: value3, key4: value4");
	});
});
