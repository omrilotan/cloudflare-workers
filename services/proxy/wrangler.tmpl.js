export const template = ({ Section }) => {
	const { PROXY_HOSTMAP } = process.env;
	try {
		JSON.parse(PROXY_HOSTMAP);
	} catch (e) {
		throw new Error(
			`PROXY_HOSTMAP must be a valid JSON. Instead got: ${PROXY_HOSTMAP}`,
		);
	}
	return {
		name: "proxy",
		main: "src/index.ts",
		compatibility_date: "2022-07-22",
		routes: [
			{ pattern: "gerbil.omrilotan.com", custom_domain: true },
			{ pattern: "tv.omrilotan.com", custom_domain: true },
		],
		vars: Section({
			PROXY_HOSTMAP,
		}),
	};
};
