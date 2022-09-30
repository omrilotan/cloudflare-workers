export class MockExecutionContext implements ExecutionContext {
	#promises: Promise<any>[] = [];
	waitUntil(promise) {
		this.#promises.push(promise);
	}
	passThroughOnException() {}
	async drain() {
		await Promise.all(this.#promises);
		this.#promises.length = 0;
	}
}
