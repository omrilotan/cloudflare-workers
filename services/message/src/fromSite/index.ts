/**
 * Get the referer site or the origin of the request
 */
export function fromSite(request: Request): string {
	const url =
		request.headers.get("referer") ||
		request.headers.get("origin") ||
		request.headers.get("referrer");

	return url ? `from ${new URL(url).hostname}` : "";
}
