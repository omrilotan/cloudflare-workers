import { CacheStorageMock } from "../cachesMock/index.ts";
const { fetch } = globalThis;

/**
 * A series of helper functions to mock and spy on the global fetch function
 */
export const fetchMock = {
	fetchCount: 0,

	promises: new Set<Promise<Response>>(),

	makePromise: async (promise: Promise<Response>): Promise<Response> => {
		fetchMock.promises.add(promise);
		const result = await promise;
		fetchMock.promises.delete(promise);
		return result;
	},

	/**
	 * Mount the global fetch with a Jest function
	 */
	mount: async (): Promise<void> => {
		const caches = new CacheStorageMock();
		const cache = await caches.open("fetchMockCache");
		(globalThis.fetch as jest.Mock) = jest.fn(
			async function (): Promise<Response> {
				let response;

				arguments as unknown as Parameters<typeof fetch>;
				const [request, init] = arguments;
				const cf: RequestInitCfProperties = init?.cf || {};
				if (!(request instanceof Request))
					throw new Error("Request must be an instance of Request");

				const cached = await fetchMock.makePromise(
					cache.match(request) as Promise<any>,
				);
				if (cached) {
					response = cached;
				} else {
					response = await fetchMock.makePromise(
						fetch.apply(this, arguments as unknown as [Request, RequestInit]),
					);
					fetchMock.fetchCount++;
				}
				if (cf.cacheTtl! > 0 && response.ok && response.status !== 206) {
					await cache.put(request, response);
				}
				return response;
			},
		);
	},

	/**
	 * Reset Counters
	 */
	reset: (): void => {
		fetchMock.fetchCount = 0;
	},

	/**
	 * Await any hanging promises
	 */
	drain: async (): Promise<void> => {
		await Promise.all(Array.from(fetchMock.promises));
	},

	/**
	 * Restore the global fetch
	 */
	unmount: async (): Promise<void> => {
		await fetchMock.drain();
		fetchMock.reset();
		globalThis.fetch = fetch;
	},
};
