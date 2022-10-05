import type { Env } from "./env";

const handler: ExportedHandler = {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		ctx.passThroughOnException();

		const valueFromKV = await env.ROLLOUT.get("canary");
		const percentage = Number(valueFromKV) || 0;
		const service =
			percentage > Math.random() * 100 ? env.CANARY : env.APPLICATION;
		return service.fetch(request);
	},
};

export default handler;
