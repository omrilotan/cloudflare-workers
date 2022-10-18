interface Env {
	MAIN: Fetcher;
	CANARY: Fetcher;
	ROLLOUT: KVNamespace;
}

const handler: ExportedHandler = {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		ctx.passThroughOnException();

		const inCanary = await inRollout(request, env);
		const service = inCanary ? env.CANARY : env.MAIN;

		return service.fetch(request);
	},
};

/**
 * Determine if the request should be routed to the canary service.
 */
async function inRollout(request: Request, env: Env): Promise<boolean> {
	if (request.headers.get("force-rollout") === "true") {
		return true;
	}
	const valueFromKV = await env.ROLLOUT.get("traffic-logger-canary");
	const rollout = Number(valueFromKV) || 0;
	const percent = Math.random() * 100;
	return rollout > percent;
}

export default handler;
