/**
 * Get the type from Content-Type header
 */
export function type(header: ReturnType<typeof Headers.prototype.get>): string {
	if (typeof header !== "string") return "unknown";
	try {
		const [type, subtype] = header
			.split(";")[0]
			.trim()
			.toLowerCase()
			.split("/");
		if (["image", "font", "video"].includes(type)) {
			return type;
		}
		if (subtype.endsWith("json")) {
			return "json";
		}
		if (subtype.includes("javascript")) {
			return "js";
		}
		if (subtype.includes("ecmascript")) {
			return "js";
		}
		if (subtype === "css") {
			return "css";
		}
		if (subtype === "plain") {
			return "text";
		}
		if (subtype.includes("html")) {
			return "html";
		}
		if (subtype.endsWith("xml")) {
			return "xml";
		}
		return "unknown";
	} catch (error) {
		return "unknown";
	}
}
