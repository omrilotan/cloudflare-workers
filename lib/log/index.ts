export async function log(record: object, token: string): Promise<Response> {
	if (typeof record !== "object") {
		throw new TypeError("record must be an object");
	}
	if (typeof token !== "string") {
		throw new TypeError("token must be a string");
	}
	if (!Object.hasOwn(record, "level")) {
		throw new RangeError("record must have a level");
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
}
