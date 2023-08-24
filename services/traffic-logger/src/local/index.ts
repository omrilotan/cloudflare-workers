import app from "../app";
import gateway from "../gateway";
import { Miniflare } from "miniflare";

type Env = {
	[key: string]: any;
};

const LOCAL_DEVELOPMENT_HOSTNAMES =
	/(localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):\d{3,5}/;

const handler: ExportedHandler = {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		const { fetch: appFetch } = app;

		app.fetch = function (request: Request): Response | Promise<Response> {
			return appFetch(modifyRequest(request), env, ctx);
		};

		env.ROLLOUT_HEADER = "force-rollout";
		env.ROLLOUT_KEY = "traffic-logger-canary";
		env.ROLLOUT = {
			get: async (key: string): Promise<string> => "0",
		} as Partial<KVNamespace>;
		env.MAIN = app;
		env.CANARY = app;
		env.VERSION = "local";

		return gateway.fetch(modifyRequest(request), env, ctx);
	},
};

/**
 * Convert a request to HTTPS
 */
function modifyRequest(
	request: Request,
): Request<unknown, IncomingRequestCfProperties<unknown>> {
	const url = new URL(request.url);
	url.protocol = "https:";
	const modifiedRequest = new Request(url.toString(), request);
	modifiedRequest.headers.set("origin", url.origin);
	modifiedRequest.headers.set("host", url.host);
	const referer = request.headers.get("referer");
	const refererURL = referer && new URL(referer);
	if (refererURL?.hostname?.match(LOCAL_DEVELOPMENT_HOSTNAMES)) {
		const refererURL = new URL(referer);
		refererURL.protocol = "https:";
		refererURL.host = url.host;
		modifiedRequest.headers.set("referer", refererURL.toString());
	}

	return modifiedRequest as Request<
		unknown,
		IncomingRequestCfProperties<unknown>
	>;
}

export default handler;
