export function isPrefetchPage(request: Request, response: Response): boolean {
	if (request.headers.get("purpose") === "prefetch") {
		return true;
	}
	if (
		request.headers.get("sec-fetch-mode") === "cors" &&
		request.headers.get("sec-fetch-dest") === "empty" &&
		response.headers.get("content-type") === "text/html"
	) {
		return true;
	}
	return false;
}
