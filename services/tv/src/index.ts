type Env = {
	TV_HOST: string;
	TV_PORT: string;
}

const handler: ExportedHandler = {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {

		const url = new URL(request.url);
		url.protocol = 'http';
		url.host = env.TV_HOST;
		url.port = env.TV_PORT;
		return fetch(url.toString(), request);
	},
};

export default handler;
