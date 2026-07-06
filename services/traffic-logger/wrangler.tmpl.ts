export const template = ({ Section }: { Section: any }) => ({
	name: "traffic-logger-local",
	main: "src/app/index.ts",
	compatibility_date: "2026-07-06",
	compatibility_flags: ["nodejs_compat"],
	workers_dev: false,
	env: {
		main: Section({
			name: "traffic-logger-gateway",
			main: "src/app/index.ts",
			routes: [
				{ pattern: "omrilotan.com/*", zone_name: "omrilotan.com" },
				{ pattern: "do.omrilotan.com/*", zone_name: "omrilotan.com" },
				{ pattern: "*ci-cd.net/*", zone_name: "ci-cd.net" },
			],
			analytics_engine_datasets: [
				{
					binding: "TRAFFIC_ANALYTICS",
					dataset: "TRAFFIC_ANALYTICS",
				},
			],
			vars: {
				SEND_ANALYTICS: true,
			},
		}),
	},
});
