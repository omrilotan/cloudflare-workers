export const template = ({ Section }) => ({
	name: "tv",
	main: "src/index.ts",
	compatibility_date: "2022-07-22",
	routes: [{ pattern: "tv.omrilotan.com", custom_domain: true }],
	vars: Section({
		TV_HOST: process.env.TV_HOST,
		TV_PORT: process.env.TV_PORT,
	}),
});
