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

		const valueFromKV = await env.ROLLOUT.get("traffic-logger-canary");
		const percentage = Number(valueFromKV) || 0;
		const service = percentage > Math.random() * 100 ? env.CANARY : env.MAIN;
		return service.fetch(request);
	},
};

export default handler;
