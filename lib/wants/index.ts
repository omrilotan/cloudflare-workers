/**
 * Use weakmap to allow for the memoised request access to be garbage collected
 */
const requestMap = new WeakMap<Request, Wants>();

export interface Wants {
	get any(): boolean;
	get css(): boolean;
	get html(): boolean;
	get image(): boolean;
	get json(): boolean;
}

/**
 * Type check logic on request "accept" header
 */
const checkers = new Map<keyof Wants, (values: string[]) => boolean>([
	["any", (values) => values.includes("*/*")],
	["css", (values) => values.includes("text/css")],
	["html", (values) => values.includes("text/html")],
	["image", (values) => values.some((value) => /^image\//.test(value))],
	[
		"json",
		(values) => values.some((value) => /^application\/json/.test(value)),
	],
]);

/**
 * Returns a Wants object that can be used to determine what type of response is wanted
 */
function memoisedRequestAccess(request: Request): Wants {
	const values =
		request.headers
			.get("accept")
			?.split(",")
			.map((string: string): string => string.trim()) || [];
	const types = new Map<keyof Wants, boolean>();
	return new Proxy<Wants>({} as Wants, {
		get(_: Object, prop: string | symbol): boolean {
			if (typeof prop !== "string") {
				return false;
			}
			const existing = types.get(prop as keyof Wants);
			if (typeof existing === "boolean") {
				return existing;
			}

			const checker = checkers.get(prop as keyof Wants);

			if (!checker) {
				throw new RangeError(`wants does not support ${prop}`);
			}
			const result = checker(values);

			types.set(prop as keyof Wants, result);
			return result;
		},
	});
}

/**
 * Memoisation logic wrapper for the requests and their respective Wants API
 */
export function wants(request: Request): Wants {
	let wantsInterface = requestMap.get(request);

	if (!wantsInterface) {
		wantsInterface = memoisedRequestAccess(request);
		requestMap.set(request, wantsInterface);
	}
	return wantsInterface;
}
