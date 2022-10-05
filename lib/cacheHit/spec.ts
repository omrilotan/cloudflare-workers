import { cacheHit } from ".";
import type { CacheStatus } from ".";

describe("lib/cacheHit", () => {
	test.each(["HIT", "Revalidated", "stream hit"])(
		"%s is considered cache hit",
		(status) => {
			expect(cacheHit(status as CacheStatus)).toBe(1);
		}
	);
	test.each([
		"BYPASS",
		"DEFERRED",
		"DYNAMIC",
		"EXPIRED",
		"IGNORED",
		"MISS",
		"NONE",
		"STALE",
		"UPDATING",
		null,
		undefined,
	])("%s is considered cache miss", (status) => {
		expect(cacheHit(status as CacheStatus)).toBe(0);
	});
});
