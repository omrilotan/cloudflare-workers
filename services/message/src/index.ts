import FormData from "form-data";
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
				const formData = new FormData();
				[
					["from", env.SENDER_EMAIL],
					["to", recipient],
					[
						"subject",
						rest.subject ||
							["Received email", fromSite(request)].filter(Boolean).join(" "),
					],
					["plain", content],
				].forEach(([key, value]) => formData.append(key, value));
				const message = await send("https://smtp.maileroo.com/send", {
					method: "POST",
					headers: new Headers([["X-API-Key", env.MAILEROO_API_KEY]]),
					body: formData,
				});
				return new Response(message, {
					status: 200,
					headers: new Headers([...CORSHeaderEntries, versionHeaderEntry]),
				});
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
