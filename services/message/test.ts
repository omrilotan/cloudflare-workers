import { MockExecutionContext } from "../../mocks/executionContext";
import { fetchMock } from "../../mocks/fetchMock";
import { requestEnrichment } from "../../mocks/requestEnrichment";
import type { Env } from "./src/env";

const log = jest.fn();
let worker: any;

const objectifyFormdata = (data: any) => {
	return data
		.getBuffer()
		.toString()
		.split(data.getBoundary())
		.filter((e: string) => e.includes("form-data"))
		.map((e: string) =>
			e
				.replace(/[\-]+$/g, "")
				.replace(/^[\-]+/g, "")
				.match(/\; name\=\"([^\"]+)\"(.*)/s)
				?.filter((v, i) => i == 1 || i == 2)
				.map((e: string) => e.trim()),
		)
		.reduce((acc: Record<string, string>, cur: string[]) => {
			acc[cur[0]] = cur[1];
			return acc;
		}, {});
};

const env: Env = {
	DISCORD_WEBHOOK: "https://discord.com/api/webhooks/test/test",
	HANDSHAKE_TOKEN: "test-handshake-token",
	MAILEROO_API_KEY: "test-maileroo-api-key",
	SENDER_EMAIL: "sender@domain.net",
	VERSION: "a3b445d",
};
const ctx = new MockExecutionContext();

const recipient = "username@domain.com";
const from = "Shmuel";
const contact = "07873670381";

describe("services/message", () => {
	beforeAll(async () => {
		requestEnrichment.mount();
		await fetchMock.mount();
		(globalThis.fetch as jest.Mock).mockImplementation(
			async () =>
				new Response('{"success":true,"message":"okay"}', { status: 200 }),
		);
		jest.mock("../../lib/log", () => ({ log }));
		worker = (await import("./src/index.ts")).default;
	});
	afterEach(async () => {
		await fetchMock.drain();
		jest.resetAllMocks();
	});
	afterAll(async () => {
		requestEnrichment.unmount();
		fetchMock.unmount();
		jest.restoreAllMocks();
	});
	describe("sending messages", () => {
		test("Simple JSON request", async () => {
			const request = new Request("http://localhost:8080", {
				method: "POST",
				headers: new Headers({
					"Content-Type": "application/json",
					Authorization: `Bearer ${env.HANDSHAKE_TOKEN}`,
					Referer: "https://www.website.com/contact",
				}),
				body: JSON.stringify({ recipient, from, contact }),
			});
			const response = await worker.fetch(request, env, ctx);

			const [[url, options]] = (globalThis.fetch as jest.Mock).mock.calls;
			expect(url).toBe("https://smtp.maileroo.com/send");

			const payload = objectifyFormdata(options.body);
			expect(payload.to).toBe("username@domain.com");
			expect(payload.from).toBe("sender@domain.net");
			expect(payload.subject).toBe("Received email from www.website.com");
			expect(payload.plain).toMatch(/^from: Shmuel\ncontact: 07873670381/);

			expect(response.status).toBe(200);
		});
		test('JSON request with "to" query param', async () => {
			const request = new Request(
				`http://localhost:8080?to=${encodeURIComponent(recipient)}`,
				{
					method: "POST",
					headers: new Headers({
						"Content-Type": "application/json",
						Authorization: `Bearer ${env.HANDSHAKE_TOKEN}`,
					}),
					body: JSON.stringify({
						from,
						contact,
					}),
				},
			);
			await worker.fetch(request, env, ctx);

			const [[url, options]] = (globalThis.fetch as jest.Mock).mock.calls;
			expect(url).toBe("https://smtp.maileroo.com/send");

			const payload = objectifyFormdata(options.body);
			expect(payload.to).toBe("username@domain.com");
			expect(payload.from).toBe("sender@domain.net");
			expect(payload.subject).toBe("Received email");
			expect(payload.plain).toMatch(/^from: Shmuel\ncontact: 07873670381/);
		});
	});
	describe("errors", () => {
		test("Got an error from email provider", async () => {
			(globalThis.fetch as jest.Mock).mockImplementationOnce(
				async (request) => new Response("Error sending email", { status: 500 }),
			);
			const request = new Request("http://localhost:8080", {
				method: "POST",
				headers: new Headers({
					"Content-Type": "application/json",
					Authorization: `Bearer ${env.HANDSHAKE_TOKEN}`,
					Referer: "https://www.website.com/contact",
				}),
				body: JSON.stringify({ recipient, from, contact }),
			});
			const response = await worker.fetch(request, env, ctx);

			expect(response.status).toBe(500);

			await ctx.drain();
		});
		test("missing authorization header", async () => {
			const request = new Request("http://localhost:8080", {
				method: "POST",
				headers: new Headers({
					"Content-Type": "application/json",
					Referer: "https://www.website.com/contact",
				}),
				body: JSON.stringify({ recipient, from, contact }),
			});
			const response = await worker.fetch(request, env, ctx);
			expect(response.status).toBe(401);
			expect(globalThis.fetch as jest.Mock).not.toHaveBeenCalled();
		});
		test("missing recipient", async () => {
			const request = new Request("http://localhost:8080", {
				method: "POST",
				headers: new Headers({
					"Content-Type": "application/json",
					Authorization: `Bearer ${env.HANDSHAKE_TOKEN}`,
				}),
				body: JSON.stringify({ from, contact }),
			});
			const response = await worker.fetch(request, env, ctx);
			expect(globalThis.fetch as jest.Mock).not.toHaveBeenCalled();
			expect(response.status).toBe(400);
		});
	});
});
