import isbot from "isbot";
import { v4 as uuidv4 } from "uuid";
import { appName } from "../../../lib/appName";
import { discord } from "../../../lib/discord";
import { isDataCentreAutonomousSystem } from "../../../lib/isDataCentreAutonomousSystem";
import { locationDeails } from "../../../lib/locationDetails";
import { log } from "../../../lib/log";
import { parseCHUA } from "../../../lib/parse-ch-ua";
import { type } from "../../../lib/type";
import { cacheHit } from "./cacheHit";
import type { CacheStatus } from "./cacheHit";

export interface Env {
	DISCORD_WEBHOOK: string;
	LOGZIO_TOKEN: string;
	VERSION: string;
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		ctx.passThroughOnException();
		const start = Date.now();
		const url = new URL(request.url);
		const app = appName(url);

		try {
			const url = new URL(request.url);
			const uuid = uuidv4();

			const originalResponse = await fetch(request, {
				headers: new Headers([
					...Array.from(request.headers),
					["X-Request-Id", uuid],
				]),
				cf: {
					cacheTtl: 600,
					cacheEverything: true,
					cacheKey: request.url,
				},
			});
			const cacheStatus = originalResponse.headers.get(
				"cf-cache-status"
			) as CacheStatus;
			const mutableResponse = new Response(
				originalResponse.body,
				originalResponse
			);

			// Replace headers
			[
				[
					"Accept-CH",
					[
						"UA",
						"Sec-CH-UA",
						"Sec-CH-UA-Mobile",
						"Sec-CH-UA-Full-Version",
						"Sec-CH-UA-Full-Version-List",
						"Sec-CH-UA-Model",
						"Sec-CH-UA-Platform",
						"Sec-CH-UA-Platform-Version",
						"ECT",
					].join(","),
				],
				["Strict-Transport-Security", "max-age=31536000; includeSubDomains"],
				["Timing-Allow-Origin", "*"],
				["Vary", "Accept, Accept-Encoding, User-Agent"],
			].forEach(([name, value]) => mutableResponse.headers.set(name, value));

			// Add headers
			[
				["App-Version", env.VERSION],
				[
					"Server-Timing",
					`CDN-Origin-Fetch; dur=${Date.now() - start}; desc="origin rtt"`,
				],
				[
					"Server-Timing",
					`Cache-Status; dur=${cacheHit(
						cacheStatus
					)}; desc="cache ${cacheStatus}"`,
				],
			].forEach(([name, value]) => mutableResponse.headers.append(name, value));

			["alt-svc", "etag", "via", "x-github-request-id", "x-powered-by"].forEach(
				(header) => mutableResponse.headers.delete(header)
			);
			const userAgent = request.headers.get("user-agent");
			if (isbot(userAgent)) {
				return mutableResponse;
			}

			const { continent, country, city, ip, asOrg, asn } =
				locationDeails(request);

			if (isDataCentreAutonomousSystem(asOrg)) {
				return mutableResponse;
			}
			const contentType = type(originalResponse.headers.get("content-type"));
			if (["css", "image", "js"].includes(contentType)) {
				return mutableResponse;
			}
			const { status } = originalResponse;
			const location = [city, country, continent].filter(Boolean).join(", ");
			const message = `${status} "${url.href}" from ${location}`;

			ctx.waitUntil(
				log(
					"traffic",
					{
						level: "info",
						app,
						message,
						duration: Date.now() - start,
						request: [request.method, url.href].join(" "),
						location,
						ip,
						as: [asOrg, asn].filter(Boolean).join(", "),
						status,
						content_type: contentType,
						cache_status: cacheStatus,
						browser: parseCHUA(request.headers.get("sec-ch-ua")) || userAgent,
						referrer: request.headers.get("referer"),
						request_id: uuid,
					},
					env.LOGZIO_TOKEN
				)
			);
			return mutableResponse;
		} catch (error) {
			const { message, stack } = error as Error;
			ctx.waitUntil(
				log(
					"error",
					{
						level: "error",
						app,
						message: `Error fetching "${request.url}"`,
						duration: Date.now() - start,
						request: [request.method, request.url].join(" "),
						error: message,
						stack,
					},
					env.LOGZIO_TOKEN
				)
			);
			ctx.waitUntil(
				discord(
					`Error fetching "${request.url}"\n\`\`\`\n${message}\n\`\`\``,
					env.DISCORD_WEBHOOK
				)
			);
			throw error;
		}
	},
};
