export const template = ({ Section }) => ({
	name: "traffic-logger-local",
	main: "src/app/index.ts",
	compatibility_date: "2024-11-11",
	env: {
		gateway: Section({
			name: "traffic-logger-gateway",
			main: "src/app/index.ts",
			routes: [],
			analytics_engine_datasets: [
				{
					binding: "TRAFFIC_ANALYTICS",
					dataset: "TRAFFIC_ANALYTICS",
				},
			],
			vars: {
				SEND_ANALYTICS: true,
				SEND_LOGS: false,
			},
		}),
	},
});
