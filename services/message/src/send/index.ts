class ResponseError extends Error {
	status?: number;
}

export async function send(...args: any): Promise<Response | undefined> {
	const response = await fetch.apply(null, args);
	if (response?.ok) {
		return response;
	}

	const error = new ResponseError(await response.clone().text());
	error.status = response.status;

	throw error;
}
