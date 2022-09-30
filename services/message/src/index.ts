import { CORSHeaderEntries } from "../../../lib/CORSHeaderEntries";
import { log } from "../../../lib/log";
import { envVars } from "./env";
import type { Env } from "./env";
import { fromSite } from "./fromSite";
import { readRequestBody } from "./readRequestBody";
import { send } from "./send";

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		const url = new URL(request.url);
		try {
			if (envVars.some((key) => !env[key])) {
				throw new Error("Missing environment variables");
			}

			if (!/post/i.test(request.method)) {
				return new Response(null, {
					status: 200,
					headers: new Headers(CORSHeaderEntries),
				});
			}

			const authorization = request.headers
				.get("authorization")
				?.replace?.("Bearer ", "");
			const to = url.searchParams.get("to");
			const {
				recipient = to,
				token = authorization,
				...rest
			} = await readRequestBody(request);

			if (token !== env.HANDSHAKE_TOKEN) {
				return new Response("Ok", {
					status: 401,
					headers: new Headers([
						...CORSHeaderEntries,
						["WWW-Authenticate", 'Basic realm="Include Brarer Token"'],
					]),
				});
			}

			if (!recipient) {
				return new Response("No Recipient", {
					status: 400,
					headers: new Headers(CORSHeaderEntries),
				});
			}

			ctx.waitUntil(
				send("https://api.sendgrid.com/v3/mail/send", {
					method: "POST",
					headers: new Headers([
						["Authorization", `Bearer ${env.SENDGRID_TOKEN}`],
						["Content-Type", "application/json"],
					]),
					body: JSON.stringify({
						personalizations: [
							{
								to: [
									{
										email: recipient,
									},
								],
							},
						],
						from: { email: env.VERIFIED_SENDGRID_EMAIL },
						subject:
							rest.subject ||
							["Receved email", fromSite(request)].filter(Boolean).join(" "),
						content: [
							{
								type: "text/plain",
								value: Object.entries(rest)
									.map(([key, value]) => [key, value].join(": "))
									.join("\n"),
							},
						],
					}),
				}).catch((error) =>
					log(
						{
							app: url.hostname,
							level: "error",
							message: error.message,
							stack: error.stack,
							status: error.status,
						},
						env.SENDGRID_TOKEN
					)
				)
			);

			return new Response("Sent", {
				status: 200,
				headers: new Headers(CORSHeaderEntries),
			});
		} catch (error: any) {
			ctx.waitUntil(
				log(
					{
						app: url.hostname,
						level: "error",
						message: error.message,
						stack: error.stack,
						status: error.status,
					},
					env.SENDGRID_TOKEN
				)
			);
			return new Response(error?.message, {
				status: 500,
			});
		}
	},
};
