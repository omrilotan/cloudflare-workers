import { appName } from ".";

describe("lib/appName", () => {
	test.each([
		["https://www.example.com/foo/bar", "example.com"],
		["https://example.com/foo/bar", "example.com"],
		["https://subdomain.example.com/foo/bar", "subdomain.example.com"],
	])("%s is %s", (url, expected) => {
		expect(appName(new URL(url))).toBe(expected);
	});
});
