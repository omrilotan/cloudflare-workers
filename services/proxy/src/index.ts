type Env = {
	PROXY_HOSTMAP: string;
};

type ProxyHostmap = {
	[host: string]: string;
};

const handler: ExportedHandler = {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		const start = Date.now();
		const url = new URL(request.url);
		const hostmap = parse(env.PROXY_HOSTMAP) as ProxyHostmap;
		if (hostmap === null) {
			console.error("Invalid hostmap", env.PROXY_HOSTMAP);
			return new Response("Invalid hostmap", { status: 500 });
		}
		const destination = hostmap[url.host];
		if (!destination) {
			return new Response("Not found", { status: 404 });
		}
		url.host = destination;
		url.protocol = "https:";
		url.port = "443";
		const req = new Request(url.toString(), request);
		req.headers.set("host", destination);
		const originalResponse = await fetch(url.toString(), req);
		const response = new Response(originalResponse.body, originalResponse);
		response.headers.set(
			"server-timing",
			`proxy; dur=${Date.now() - start}; desc=${destination}`,
		);
		return response;
	},
};

function parse(json: string): any {
	try {
		return JSON.parse(json);
	} catch (err) {
		return null;
	}
}

export default handler;
