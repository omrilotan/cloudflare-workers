export const template = ({ Section }) => ({
	name: "traffic-logger-local",
	main: "src/app/index.ts",
	compatibility_date: "2022-07-22",
	env: {
		gateway: Section({
			name: "traffic-logger-gateway",
			main: "src/gateway/index.ts",
			routes: [
				{ pattern: "omrilotan.com/*", zone_name: "omrilotan.com" },
				{ pattern: "briefly.omrilotan.com/*", zone_name: "omrilotan.com" },
				{ pattern: "do.omrilotan.com/*", zone_name: "omrilotan.com" },
			],
			services: [
				{
					binding: "MAIN",
					service: "traffic-logger-main",
					environment: "production",
				},
				{
					binding: "CANARY",
					service: "traffic-logger-canary",
					environment: "production",
				},
			],
			kv_namespaces: [
				{ binding: "ROLLOUT", id: "309b38e6127b48eb86ff9a58e715ac15" },
			],
			vars: Section({
				ROLLOUT_KEY: "traffic-logger-canary",
				ROLLOUT_HEADER: "force-rollout",
			}),
		}),
		canary: Section({
			name: "traffic-logger-canary",
			unsafe: {
				bindings: [
					Section({
						type: "analytics_engine",
						name: "TRAFFIC_ANALYTICS",
						dataset: "TRAFFIC_ANALYTICS",
					}),
				],
			},
			vars: {
				VARIATION: "canary",
				SEND_ANALYTICS: true,
				SEND_LOGS: true,
			},
		}),
		main: Section({
			name: "traffic-logger-main",
			routes: [
				{ pattern: "*ci-cd.net/*", zone_name: "ci-cd.net" },
				{ pattern: "*danisilas.com/*", zone_name: "danisilas.com" },
			],
			unsafe: {
				bindings: [
					{
						type: "analytics_engine",
						name: "TRAFFIC_ANALYTICS",
						dataset: "TRAFFIC_ANALYTICS",
					},
				],
			},
			vars: {
				VARIATION: "main",
				SEND_ANALYTICS: false,
				SEND_LOGS: true,
			},
		}),
	},
});
