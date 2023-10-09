export const template = ({ Section }) => ({
	name: "llama",
	main: "src/index.ts",
	compatibility_date: "2022-07-22",
	env: Section({
		LOGZIO_TOKEN: process.env.LOGZIO_TOKEN,
	}),
	ai: Section({
		binding: "AI",
	}),
});
