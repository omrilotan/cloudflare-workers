export class MockExecutionContext implements ExecutionContext {
	exports: Cloudflare.Exports = {} as Cloudflare.Exports;
	cache?: CacheContext | undefined;
	access?: CloudflareAccessContext | undefined;
	tracing: Tracing = {} as Tracing;
	#promises: Promise<unknown>[] = [];
	#passThroughOnException = false;
	props: Record<string, any> = {};

	constructor(init?: {
		exports?: Cloudflare.Exports;
		cache?: CacheContext;
		access?: CloudflareAccessContext;
		tracing?: Tracing;
		props?: Record<string, any>;
	}) {
		if (init?.exports) this.exports = init.exports;
		if (init?.cache) this.cache = init.cache;
		if (init?.access) this.access = init.access;
		if (init?.tracing) this.tracing = init.tracing;
		if (init?.props) this.props = { ...init.props };
	}

	waitUntil(promise: Promise<unknown>) {
		this.#promises.push(Promise.resolve(promise));
	}

	passThroughOnException() {
		this.#passThroughOnException = true;
	}

	get shouldPassThroughOnException() {
		return this.#passThroughOnException;
	}

	async drain() {
		const pending = this.#promises.splice(0);
		const settled = await Promise.allSettled(pending);
		const errors = settled
			.filter(
				(result): result is PromiseRejectedResult =>
					result.status === "rejected",
			)
			.map((result) => result.reason);

		if (errors.length === 1) {
			throw errors[0];
		}

		if (errors.length > 1) {
			throw new AggregateError(errors, "Multiple waitUntil promises rejected");
		}
	}
}
