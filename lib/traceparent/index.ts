import { v4 as uuidv4 } from "uuid";

/**
 * Add a traceparent header to the request if it doesn't already exist.
 */
export function createTraceparentHeader(request) {
	if (request.headers.has("traceparent")) {
		return;
	}
	const requestID = request.headers.get("cloudflare-request-id") || request.headers.get("trace-id") || uuidv4();
	const traceId = requestID.replace(/([^-]+)-([^-]+)-([^-]+)-([^-]+)-([^-]+)/, "$1$2$3$4$5");

	const traceparent = [
		"00",
		traceId,
		"696c6f7665796f75",
		"01"
	].join("-");
	request.headers.set("traceparent", traceparent);
}

