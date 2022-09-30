export type CacheStatus =
	| "HIT"
	| "MISS"
	| "REVALIDATED"
	| "BYPASS"
	| "EXPIRED"
	| "DYNAMIC";

export const cacheHit = (status: CacheStatus): 0 | 1 =>
	["HIT", "REVALIDATED"].includes(status) ? 1 : 0;
