/**
 * readRequestBody reads in the incoming request body
 */
export async function readRequestBody(
	request: Request,
): Promise<Record<string, string> | unknown> {
	const { headers } = request;
	const contentType = headers.get("content-type") || "";

	if (contentType.includes("application/json")) {
		const data = await request.json();
		return data ?? {};
	}
	if (contentType.includes("form")) {
		const formData = await request.formData();
		return Promise.resolve(
			Object.assign(
				{},
				...Array.from(formData.entries()).map(
					([key, value]: [string, string | File | FormDataEntryValue]) => ({
						[key]: value,
					}),
				),
			),
		);
	}
	return {};
}
