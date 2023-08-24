import { MockExecutionContext } from "../../mocks/executionContext";
import { fetchMock } from "../../mocks/fetchMock";
import { requestEnrichment } from "../../mocks/requestEnrichment";
import type { Env } from "./src/env";

const log = jest.fn();
let worker;

const env: Env = {
	DISCORD_WEBHOOK: "https://discord.com/api/webhooks/1234567890/1234567890",
	HANDSHAKE_TOKEN: "OaOkHIXAluv9EF941cQuYUEeWfep4x9b",
	LOGZIO_TOKEN: "xmC8duHhUaqqYoBWbMgGq1g6jxUJwtPG",
	SENDGRID_TOKEN: "451ECD88-AA68-401F-906C-D0E29D2A8D33",
	VERIFIED_SENDGRID_EMAIL: "authorised.with.sendgrid@domain.net",
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
			async () => new Response("Ok", { status: 200 }),
		);
		jest.mock("../../lib/log", () => ({ log }));
		worker = (await import("./src")).default;
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
			expect(url).toBe("https://api.sendgrid.com/v3/mail/send");

			const payload = JSON.parse(options.body);
			expect(payload.personalizations[0].to[0].email).toBe(
				"username@domain.com",
			);
			expect(payload.from.email).toBe("authorised.with.sendgrid@domain.net");
			expect(payload.subject).toBe("Received email from www.website.com");
			expect(payload.content[0].value).toMatch(
				/^from: Shmuel\ncontact: 07873670381/,
			);

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
			expect(url).toBe("https://api.sendgrid.com/v3/mail/send");

			const payload = JSON.parse(options.body);
			expect(payload.personalizations[0].to[0].email).toBe(
				"username@domain.com",
			);
			expect(payload.from.email).toBe("authorised.with.sendgrid@domain.net");
			expect(payload.subject).toBe("Received email");
			expect(payload.content[0].value).toMatch(
				/^from: Shmuel\ncontact: 07873670381/,
			);
		});
	});
	describe("errors", () => {
		test("Got an error from SendGrid", async () => {
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

			expect(response.status).toBe(200);

			await ctx.drain();
			const [[type, { level, message, stack, status }]] = log.mock.calls;
			expect(level).toBe("error");
			expect(message).toBe("Error sending email");
			expect(typeof stack).toBe("string");
			expect(status).toBe(500);
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
