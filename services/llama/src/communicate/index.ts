import type { Env } from "../env";

import { Ai } from "@cloudflare/ai";
import { parse } from "../../../../lib/parse";

/**
 * Instanse of Ai
 */
let ai: Ai | undefined; // memoize

const wait = (ms: number): Promise<void> =>
	new Promise((r) => setTimeout(r, ms));

export const communicate = ({
	client,
	server,
	env,
}: {
	client: WebSocket;
	server: WebSocket;
	env: Env;
}): Promise<CloseEvent> =>
	new Promise((resolve, reject) => {
		ai = ai || new Ai(env.AI);
		server.accept();
		server.addEventListener("message", async (event: MessageEvent) => {
			const { message: prompt } = parse(event.data.toString()) ?? {};
			const { response } = await ai.run("@cf/meta/llama-2-7b-chat-int8", {
				prompt,
			});
			server.send(
				JSON.stringify({
					message: response,
				}),
			);
		});
		server.addEventListener("close", (event: CloseEvent) => {
			server.close();
			resolve(event);
		});
	});
