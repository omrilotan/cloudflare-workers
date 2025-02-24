const memory = new Map<string, CacheMock>();
const { caches } = globalThis as any;

class CacheMock implements Cache {
	private static map = new Map<string, Response>();

	// add, addAll, keys, matchAll
	async add(URL): Promise<void> {
		throw new Error("Method not implemented.");
	}
	async addAll(requestInfo: RequestInfo[]): Promise<void> {
		throw new Error("Method not implemented.");
	}
	async keys(): Promise<Request[]> {
		throw new Error("Method not implemented.");
	}
	async matchAll(
		requestInfo: RequestInfo,
		options?: CacheQueryOptions,
	): Promise<Response[]> {
		throw new Error("Method not implemented.");
	}
	async match(
		request: Request,
		options?: CacheQueryOptions,
	): Promise<Response> {
		if (CacheMock.map.has(request.url)) {
			return CacheMock.map.get(request.url);
		}
		return undefined;
	}
	async put(request: Request, response: Response): Promise<void> {
		CacheMock.map.set(request.url, response);
	}
	async delete(
		request: Request,
		options?: CacheQueryOptions,
	): Promise<boolean> {
		if (CacheMock.map.has(request.url)) {
			CacheMock.map.delete(request.url);
			return true;
		}
		return false;
	}
}

export class CacheStorageMock implements CacheStorage {
	readonly default: Cache;
	open(cacheName: string): Promise<CacheMock> {
		let cache = memory.get(cacheName);
		if (cache === undefined) {
			cache = new CacheMock();
			memory.set(cacheName, cache);
		}

		jest.spyOn(cache, "match");
		jest.spyOn(cache, "put");

		return Promise.resolve(cache);
	}
	delete(): Promise<boolean> {
		throw new Error("Method not implemented.");
	}
	has(): Promise<boolean> {
		throw new Error("Method not implemented.");
	}
	keys(): Promise<string[]> {
		throw new Error("Method not implemented.");
	}
	match(
		request: RequestInfo | URL,
		options?: MultiCacheQueryOptions,
	): Promise<Response | undefined> {
		throw new Error("Method not implemented.");
	}
}

/**
 * A series of helper functions to mock and spy on the global caches API
 */
export const cachesMock = {
	mount: async (): Promise<void> => {
		(globalThis as any).caches = new CacheStorageMock();
	},
	clear: async (): Promise<void> => {
		memory.clear();
	},
	restore: async (): Promise<void> => {
		memory.clear();
		(globalThis as any).caches = caches;
	},
};
