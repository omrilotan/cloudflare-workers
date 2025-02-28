import { appName } from "../../../lib/appName";
import { CORSHeaderEntries } from "../../../lib/CORSHeaderEntries";
import { discord } from "../../../lib/discord";
import { locationDeails } from "../../../lib/locationDetails";
import { envVars } from "./env";
import type { Env } from "./env";
import { fromSite } from "./fromSite";
import { readRequestBody } from "./readRequestBody";
import { send } from "./send";

const handler: ExportedHandler = {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
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
			} = ((await readRequestBody(request)) ?? {}) as Record<string, string>;

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
				const message =
					rest.message || rest.subject || `Email sent to ${recipient}`;
			} catch (error) {
				console.error(error);
				ctx.waitUntil(
					discord(
						`Error handling "${url}"\n\`\`\`\n${error.message}\n\`\`\``,
						env.DISCORD_WEBHOOK,
					),
				);
				return new Response("Failed to send", {
					status: 500,
					headers: new Headers([versionHeaderEntry]),
				});
			}

			return new Response("Sent", {
				status: 200,
				headers: new Headers([...CORSHeaderEntries, versionHeaderEntry]),
			});
		} catch (error: any) {
			console.error(error);
			ctx.waitUntil(
				discord(
					`Error handling "${url}"\n\`\`\`\n${error.message}\n\`\`\``,
					env.DISCORD_WEBHOOK,
				),
			);
			return new Response(error?.message, {
				status: 500,
			});
		}
	},
};

export default handler;
