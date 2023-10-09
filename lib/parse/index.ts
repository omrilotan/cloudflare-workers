export function parse(
	json: string,
	reviver?: (this: any, key: string, value: any) => any,
): any {
	try {
		return JSON.parse(json, reviver);
	} catch (error) {
		// ignore
	}
}
