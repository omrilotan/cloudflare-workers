import { Buffer } from 'node:buffer';

type Env = {};

/**
 * Display a list of entries in HTML
 */
function displayEntries(entries: [string, any][], indentation = 1): string {
	return entries
		.map(([key, value]: [string, any]): string =>
			value
				? `${Array.from({ length: indentation }).join("\t")}<b>${key}</b>: ${
						typeof value === "object"
							? `\n${displayEntries(Object.entries(value), indentation + 1)}`
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

		const content = `<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>Request details</title>
	</head>
	<body>
		<h1>Request details</h1>
		<h2>Request</h2>
		<pre>${request.method} ${request.url}</pre>
		<h2>Headers</h2>
		<pre>${displayEntries(Array.from(request.headers))}</pre>
		<h2>CF</h2>
		<pre>${displayEntries(Object.entries(request.cf))}</pre>
		<h2>Body</h2>
		<pre>${await request.text()}</pre>

	</body>
</html>`;

		return new Response(Buffer.from(content), {
			status: 200,
			headers: new Headers([["Content-Type", "text/html"]]),
		});
	},
};

export default handler;
