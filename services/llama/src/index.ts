import { Env } from "./env";
import { log } from "../../../lib/log";
import { appName } from "../../../lib/appName";
import { communicate } from "./communicate";
import "../dist/index.js";

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		try {
			const start = Date.now();
			const url = new URL(request.url);
			const isUpgradeRequest = request.headers
				.get("Upgrade")
				?.includes("websocket");

			if (isUpgradeRequest) {
				const { 0: client, 1: server } = new WebSocketPair();
				ctx.waitUntil(communicate({ client, server, env }));
				return new Response(null, {
					status: 101,
					webSocket: client,
					headers: {
						"server-timing": `worker;dur=${Date.now() - start};desc="Llama WS"`,
					},
				});
			}
			const webSocketProtocol = url.protocol === "https:" ? "wss:" : "ws:";
			return new Response(
				globalThis.markup([webSocketProtocol, url.hostname].join("//")),
				{
					status: 200,
					headers: {
						"content-type": "text/html;charset=UTF-8",
						"server-timing": `worker;dur=${
							Date.now() - start
						};desc="Llama Chat"`,
					},
				},
			);
		} catch (error: any) {
			env.LOGZIO_TOKEN
				? ctx.waitUntil(
						Promise.all([
							log(
								"error",
								{
									level: "error",
									app: appName(new URL(request.url)),
									message: error.message,
									stack: error.stack,
									status: error.status,
								},
								env.LOGZIO_TOKEN,
							),
						]),
				  )
				: console.error(error);
			return new Response(error?.message, {
				status: 500,
			});
		}
	},
};
