import { parseCHUA } from ".";

describe("parseCHUA", () => {
	test.each([
		['"(Not(A:Brand";v="8", "Chromium";v="98"', "Chromium 98"],
		[
			'" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
			"Google Chrome 96",
		],
		[
			'"(Not(A:Brand";v="8", "Chromium";v="98", "Google Chrome";v="98")',
			'Google Chrome "98")',
		],
		['"Opera";v="81", " Not;A Brand";v="99", "Chromium";v="95"', "Opera 81"],
		[
			'" Not A;Brand";v="99", "Chromium";v="96", "Microsoft Edge";v="96"',
			"Microsoft Edge 96",
		],
	])("should parse %s", (ua, expected) => {
		expect(parseCHUA(ua)).toEqual(expected);
	});
});
