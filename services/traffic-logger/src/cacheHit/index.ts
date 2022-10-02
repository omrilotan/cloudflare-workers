export type CacheStatus =
	| "BYPASS"
	| "DEFERRED"
	| "DYNAMIC"
	| "EXPIRED"
	| "HIT"
	| "IGNORED"
	| "MISS"
	| "NONE"
	| "REVALIDATED"
	| "STALE"
	| "STREAM HIT"
	| "UPDATING";

export const cacheHit = (status: CacheStatus): 0 | 1 =>
	["HIT", "STREAM HIT", "REVALIDATED"].includes(status.toUpperCase()) ? 1 : 0;
