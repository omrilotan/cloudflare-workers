const DROPPED_VALUES = [undefined, null, ""];

/**
 * Represents an object as a string of key-value pairs.
 */
export function objectToKVString(input: Record<string, any>): string {
	return (
		Object.entries(input)
			.filter(([, value]) => !DROPPED_VALUES.includes(value))
			.map(([key, value]: [string, any]): string => `${key.trim()}: ${value}`)
			.join(", ") || undefined
	);
}
