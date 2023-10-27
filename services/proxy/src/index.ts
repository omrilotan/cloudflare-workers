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
		return fetch(url.toString(), req);
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
