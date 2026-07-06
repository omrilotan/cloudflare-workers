class ResponseError extends Error {
	status?: number;
}

export async function send(...args: any): Promise<string | undefined> {
	const response = await fetch.apply(null, args);
	if (response?.ok) {
		const { success, message } = (await response.json()) as {
			success: boolean;
			message: string;
		};
		if (!success) throw new ResponseError(message || "Unknown error");
		return message;
	}

	if (response instanceof Response) {
		const error = new ResponseError(await response.clone().text());
		error.status = response.status;

		throw error;
	}
}
