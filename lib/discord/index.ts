export const discord = (content: string, webhook: string): Promise<Response> =>
	fetch(webhook, {
		method: "POST",
		headers: new Headers([["Content-Type", "application/json"]]),
		body: JSON.stringify({ content }),
	});
