import { parse } from ".";

describe("parse", () => {
	test("return parsed JSON object when valid JSON string is provided", () => {
		const json = '{"name": "John", "age": 30}';
		const result = parse(json);
		expect(result).toEqual({ name: "John", age: 30 });
	});
	test("return undefined when invalid JSON string is provided and reviver is not provided", () => {
		const json = '{"name": "John", "age": 30';
		const result = parse(json);
		expect(result).toBeUndefined();
	});
	test("return parsed JSON object with reviver applied when valid JSON string is provided and reviver is provided", () => {
		const json = '{"name": "John", "age": 30}';
		const reviver = (key, value) => {
			if (key === "age") {
				return value + 10;
			}
			return value;
		};
		const result = parse(json, reviver);
		expect(result).toEqual({ name: "John", age: 40 });
	});
	test("return undefined when empty string is provided", () => {
		const json = "";
		const result = parse(json);
		expect(result).toBeUndefined();
	});
	test("return undefined when null is provided", () => {
		const json = null;
		const result = parse(json);
		expect(result).toBe(null);
	});
	test("return undefined when undefined is provided", () => {
		const json = undefined;
		const result = parse(json);
		expect(result).toBeUndefined();
	});
});
