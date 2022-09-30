export const CORSHeaderEntries: [string, string][] = [
	["Access-Control-Allow-Origin", "*"],
	["Access-Control-Allow-Credentials", "true"],
	["Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE"],
	["Access-Control-Expose-Headers", "Content-Length"],
	[
		"Access-Control-Allow-Headers",
		"Accept, Authorization, Content-Type, X-Requested-With, Range",
	],
];
