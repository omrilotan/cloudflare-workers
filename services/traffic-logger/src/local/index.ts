import type { Env } from "../interfaces/index.ts";
import worker from "../app/index.ts";

const LOCAL_DEVELOPMENT_HOSTNAMES =
	/(localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):\d{3,5}/;

const handler: ExportedHandler<Env> = {
	async fetch(request, env, ctx) {
		return (
			worker.fetch?.(modifyRequest(request), env, ctx) ||
			new Response("Server Error", { status: 500 })
		);
	},
};

/**
 * Convert a request to HTTPS
 */
function modifyRequest(
	request:
		| Request<unknown, IncomingRequestCfProperties<unknown>>
		| Request<unknown, CfProperties<unknown>>,
): Request<unknown, IncomingRequestCfProperties<unknown>> {
	const url = new URL(request.url);
	url.protocol = "https:";
	const modifiedRequest = new Request(
		url.toString(),
		request as Request<unknown, IncomingRequestCfProperties<unknown>>,
	) as Request<unknown, IncomingRequestCfProperties<unknown>>;
	modifiedRequest.headers.set("origin", url.origin);
	modifiedRequest.headers.set("host", url.host);
	const referer = request.headers.get("referer");
	const refererURL = referer && new URL(referer);
	if (
		refererURL instanceof URL &&
		refererURL.hostname?.match(LOCAL_DEVELOPMENT_HOSTNAMES)
	) {
		const refererURL = referer ? new URL(referer) : new URL(request.url);
		refererURL.protocol = "https:";
		refererURL.host = url.host;
		modifiedRequest.headers.set("referer", refererURL.toString());
	}

	return modifiedRequest;
}

export default handler;
