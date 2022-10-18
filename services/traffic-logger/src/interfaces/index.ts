/**
 * @example
SELECT
	intDiv(toUInt32(timestamp), 300) * 300 AS t,
	blob4 AS url,
	double1 AS status,
	double2 AS duration,
	blob5 AS content_type,
	blob6 AS cache_status
FROM
	TRAFFIC_ANALYTICS
WHERE
	timestamp >= NOW() - INTERVAL '1' DAY
GROUP BY
	t,
	url,
	status,
	duration,
	cache_status,
	content_type
ORDER BY
	t ASC
LIMIT
	10
 */
export interface DataPoint {
	blobs: [
		app: string,
		app_version: string,
		method: string,
		url: string,
		content_type: string,
		cache_status: string
	];
	doubles: [status: number, duration: number];
	indexes: [request_id: string];
}

export interface AnalyticsEngine {
	writeDataPoint(dataPoint: DataPoint): void;
}

export interface Env {
	DISCORD_WEBHOOK: string;
	LOGZIO_TOKEN: string;
	RELEASE: string;
	SEND_ANALYTICS: boolean;
	SEND_LOGS: boolean;
	TRAFFIC_ANALYTICS: AnalyticsEngine;
	VARIATION: string;
	VERSION: string;
}
