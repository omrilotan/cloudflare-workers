interface Record {
	level: "debug" | "verbose" | "info" | "warn" | "error" | "critical";
	app: string;
	[key: string]: string;
}

export async function log(record: Record, token: string): Promise<Response> {
	if (typeof record !== "object") {
		throw new TypeError("record must be an object");
	}
	if (typeof token !== "string" || token === "") {
		throw new TypeError("token must be non empty a string");
	}

	const response = await fetch(
		`https://listener.logz.io:8071/?token=${token}&type=traffic`,
		{
			method: "POST",
			headers: new Headers([
				["Content-Type", "text/plain"],
				["Accept", "*/*"],
			]),
			body: JSON.stringify(record),
		}
	);

	if (!response.ok) {
		throw new Error(`Logz.io responded with ${response.status}`);
	}

	return response;
}
