import { appName } from "../../../lib/appName";
import { CORSHeaderEntries } from "../../../lib/CORSHeaderEntries";
import { discord } from "../../../lib/discord";
import { locationDeails } from "../../../lib/locationDetails";
import { log } from "../../../lib/log";
import { parseCHUA } from "../../../lib/parse-ch-ua";
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
		const app = appName(url);
		try {
			if (envVars.some((key) => !env[key])) {
				throw new Error("Missing environment variables");
			}

			const versionHeaderEntry: [key: string, value: string] = [
				"App-Version",
				env.VERSION,
			];

			if (!/post/i.test(request.method)) {
				return new Response(null, {
					status: 200,
					headers: new Headers([...CORSHeaderEntries, versionHeaderEntry]),
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
						versionHeaderEntry,
						["WWW-Authenticate", 'Basic realm="Include Brarer Token"'],
					]),
				});
			}

			if (!recipient) {
				return new Response("No Recipient", {
					status: 400,
					headers: new Headers([...CORSHeaderEntries, versionHeaderEntry]),
				});
			}

			const { country, city, ip } = locationDeails(request);
			const location = [city, country].filter(Boolean).join(", ");
			location && Object.assign(rest, { location });

			const content = Object.entries(rest)
				.map(([key, value]) => [key, value].join(": "))
				.join("\n");

			try {
				const response = await send("https://api.sendgrid.com/v3/mail/send", {
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
							["Received email", fromSite(request)].filter(Boolean).join(" "),
						content: [
							{
								type: "text/plain",
								value: content,
							},
						],
					}),
				});
				if (!response.ok) {
					throw new Error(`Sendgrid responded with ${response.status}`);
				}
				ctx.waitUntil(
					log(
						"email",
						{
							level: "info",
							app,
							message: `Email sent to ${recipient}`,
							details: content,
							browser: parseCHUA(request.headers.get("sec-ch-ua")) || request.headers.get("user-agent"),
							location,
							ip,
						},
						env.LOGZIO_TOKEN
					)
				);
			} catch (error) {
				ctx.waitUntil(
					Promise.all([
						log(
							"error",
							{
								level: "error",
								app,
								message: error.message,
								stack: error.stack,
								status: error.status,
							},
							env.LOGZIO_TOKEN
						),
						discord(
							`Error handling "${url}"\n\`\`\`\n${error.message}\n\`\`\``,
							env.DISCORD_WEBHOOK
						),
					])
				);
			}

			return new Response("Sent", {
				status: 200,
				headers: new Headers([...CORSHeaderEntries, versionHeaderEntry]),
			});
		} catch (error: any) {
			console.error(error);
			ctx.waitUntil(
				log(
					"error",
					{
						level: "error",
						app,
						message: error.message,
						stack: error.stack,
						status: error.status,
					},
					env.SENDGRID_TOKEN
				)
			);
			ctx.waitUntil(
				discord(
					`Error handling "${url}"\n\`\`\`\n${error.message}\n\`\`\``,
					env.DISCORD_WEBHOOK
				)
			);
			return new Response(error?.message, {
				status: 500,
			});
		}
	},
};
