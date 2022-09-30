import { type } from ".";

describe("lib/type", () => {
	test.each([
		["application/json", "json"],
		["application/manifest+json; charset=utf-8", "json"],
		["application/javascript", "js"],
		["application/javascript; charset=utf-8", "js"],
		["application/x-javascript", "js"],
		["application/javascript1.4", "js"],
		["application/ecmascript", "js"],
		["text/html; charset=utf-8", "html"],
		["text/css", "css"],
		["text/plain", "text"],
		["image/vnd.microsoft.icon", "image"],
		["image/svg+xml", "image"],
		["font/woff2", "font"],
		["video/mp4", "video"],
		["application/xml;foo=bar", "xml"],
		["application/opensearchdescription+xml", "xml"],
	])("%s is %s", (header, expected) => expect(type(header)).toBe(expected));
});
