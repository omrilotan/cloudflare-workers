type Env = {
	TV_HOST: string;
	TV_PORT: string;
};

const handler: ExportedHandler = {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		const url = new URL(request.url);
		url.host = env.TV_HOST;
		url.port = env.TV_PORT;
		url.protocol = url.port === "443" ? "https" : "http";
		const req = new Request(url.toString(), request);
		req.headers.set("host", env.TV_HOST);
		return fetch(url.toString(), req);
	},
};

export default handler;
