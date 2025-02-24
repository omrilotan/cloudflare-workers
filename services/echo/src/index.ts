import { Buffer } from "node:buffer";
import { wants } from "../../../lib/wants";

type Env = {};

/**
 * Display a list of entries in HTML
 */
function displayEntries(
	entries: [string, any][],
	{
		indentation = 1,
		wrapper,
	}: {
		indentation?: number;
		wrapper?: string;
	} = {},
): string {
	return entries
		.map(([key, value]: [string, any]): string =>
			value
				? `${Array.from({ length: indentation }).join("\t")}${wrapper ? `<${wrapper}>` : ""}${key}${wrapper ? `</${wrapper}>` : ""}: ${
						typeof value === "object"
							? `\n${displayEntries(Object.entries(value), { indentation: indentation + 1, wrapper })}`
							: `${value}`
					}`
				: "",
		)
		.filter(Boolean)
		.join("\n");
}

const handler: ExportedHandler = {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		ctx.passThroughOnException();
		const whatItWants = wants(request);
		let content = "";

		if (whatItWants.html) {
			content = `<!DOCTYPE html>
<html lang="en-GB">
	<head>
		<meta charset="utf-8">
		<title>Request details</title>
		<meta name="viewport" content="width=device-width,minimum-scale=1">
	</head>
	<body>
		<h1>Request details</h1>
		<h2>Request</h2>
		<pre>${request.method} ${request.url}</pre>
		<h2>Headers</h2>
		<pre>${displayEntries(Array.from(request.headers), { wrapper: "b" })}</pre>
		<h2>CF</h2>
		<pre>${displayEntries(Object.entries(request.cf), { wrapper: "b" })}</pre>
		<h2>Body</h2>
		<pre>${await request.text()}</pre>

	</body>
</html>`;
		} else if (whatItWants.json) {
			content = JSON.stringify({
				method: request.method,
				url: request.url,
				headers: Object.fromEntries(request.headers),
				cf: request.cf,
				body: await request.text(),
			});
		} else {
			content = `Request: ${request.method} ${request.url}
Headers: ${displayEntries(Array.from(request.headers))}
CF: ${displayEntries(Object.entries(request.cf))}
Body: ${await request.text()}`;
		}

		return new Response(Buffer.from(content), {
			status: 200,
			headers: new Headers([["Content-Type", "text/html"]]),
		});
	},
};

export default handler;
