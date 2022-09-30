import { wants } from ".";

describe("lib/wants", () => {
	test.each([
		["any", "*/*"],
		["css", "text/css,*/*;q=0.1"],
		[
			"html",
			"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
		],
		["json", "application/json"],
		["json", "application/json;q=0.9,text/plain"],
		[
			"image",
			"image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
		],
		["image", "image/avif,image/webp,*/*"],
	])("%s request", (method, accept) => {
		const request = new Request("https://website.net", {
			headers: new Headers([["accept", accept]]),
		});
		expect(wants(request)[method]).toBe(true);
	});
});
