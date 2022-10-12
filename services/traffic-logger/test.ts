import { CacheStatus } from "../../lib/cacheHit";
import { MockExecutionContext } from "../../mocks/executionContext";
import { fetchMock } from "../../mocks/fetchMock";
import { requestEnrichment } from "../../mocks/requestEnrichment";
import type { DataPoint, Env } from "./src/interfaces";

const env: Env = {
	DISCORD_WEBHOOK: "https://discord.com/api/webhooks/1234567890/1234567890",
	LOGZIO_TOKEN: "xmC8duHhUaqqYoBWbMgGq1g6jxUJwtPG",
	VERSION: "a3b445d",
	RELEASE: "2022-10-11",
	SEND_ANALYTICS: true,
	SEND_LOGS: true,
	VARIATION: "test",
	TRAFFIC_ANALYTICS: {
		writeDataPoint: jest.fn(),
	},
};

const log = jest.fn();
const discord = jest.fn();
let worker;
const ctx = new MockExecutionContext();
const UID_PATTERN =
	/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
const INDEX_PATTERN = /[0-9a-f]{32}/;

describe("traffic-logger", (): void => {
	beforeAll(async (): Promise<void> => {
		requestEnrichment.mount();
		await fetchMock.mount();
		(globalThis.fetch as jest.Mock).mockImplementation(
			async (): Promise<Response> => new Response("Ok", { status: 200 })
		);
		jest.mock("../../lib/log", () => ({ log }));
		jest.mock("../../lib/discord", () => ({ discord }));
		worker = (await import("./src/app")).default;
	});
	afterEach(async (): Promise<void> => {
		await fetchMock.drain();
		jest.resetAllMocks();
	});
	afterAll(async (): Promise<void> => {
		requestEnrichment.unmount();
		await fetchMock.unmount();
		jest.restoreAllMocks();
	});

	test.each([
		[
			"logs traffic for",
			"https://httpbin.org/index.html",
			"MISS",
			"text/html",
			true,
		],
		[
			"does not log traffic for",
			"https://httpbin.org/script.239874.js",
			"HIT",
			"application/javascript",
			false,
		],
	])(
		"%s %s",
		async (
			description: string,
			url: string,
			cacheStatus: CacheStatus,
			contentType: string,
			shouldLog: boolean
		): Promise<void> => {
			(globalThis.fetch as jest.Mock).mockImplementationOnce(
				async () =>
					new Response("Ok", {
						status: 200,
						headers: new Headers([
							["CF-Cache-Status", cacheStatus],
							["Content-Type", contentType],
							["ETag", "u6LbP7BGEntOvnXR3SchEDg7KX2WW72Q"],
							["X-Powered-By", "Fiber"],
						]),
					})
			);
			const request = new Request(url, {
				method: "GET",
				headers: new Headers([
					[
						"Accept",
						"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					],
					["CF-Connecting-IP", "203.0.113.1"],
					["Referer", "https://www.duckduckgo.com/"],
					[
						"Sec-CH-UA",
						'"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
					],
					[
						"User-Agent",
						"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:106.0) Gecko/20100101 Firefox/106.0",
					],
				]),
			});
			const response = await worker.fetch(request, env, ctx);

			expect(log).toHaveBeenCalledTimes(shouldLog ? 1 : 0);
			if (shouldLog) {
				const [[type, record, token]] = log.mock.calls;
				expect(type).toBe("traffic");
				expect(token).toBe(env.LOGZIO_TOKEN);
				expect(record.request_id).toMatch(UID_PATTERN);
				expect(record.duration).toBeGreaterThan(-1);
				delete record.request_id;
				delete record.duration;
				expect(record).toMatchSnapshot();
				const [[analytics_record]] = (
					env.TRAFFIC_ANALYTICS.writeDataPoint as jest.Mock
				).mock.calls;
				expect(analytics_record.indexes.pop()).toMatch(INDEX_PATTERN);
				const duration = analytics_record.doubles.splice(1, 1)[0];
				expect(duration).toBeGreaterThan(-1);
				expect(analytics_record).toMatchSnapshot();
			}

			expect(response.status).toBe(200);
			expect(response.headers.get("server-timing")).toMatch(
				new RegExp(
					`CDN-Origin-Fetch; dur=\\d+; desc="origin rtt",\\s*Cache-Status; dur=[01]; desc="${cacheStatus}"`
				)
			);
			response.headers.delete("server-timing");
			expect(Array.from(response.headers)).toMatchSnapshot();
		}
	);
});
