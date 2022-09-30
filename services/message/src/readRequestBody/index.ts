/**
 * readRequestBody reads in the incoming request body
 */
export async function readRequestBody(
	request: Request
): Promise<{ [name: string]: string }> {
	const { headers } = request;
	const contentType = headers.get("content-type") || "";

	if (contentType.includes("application/json")) {
		return request.json();
	}
	if (contentType.includes("form")) {
		const formData = await request.formData();
		return Promise.resolve(
			Object.assign(
				{},
				...Array.from(formData.entries()).map(
					([key, value]: [string, string | File]) => ({ [key]: value })
				)
			)
		);
	}
	return {};
}
