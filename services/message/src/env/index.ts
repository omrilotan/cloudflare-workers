export interface Env {
	DISCORD_WEBHOOK: string;
	HANDSHAKE_TOKEN: string;
	LOGZIO_TOKEN: string;
	SENDGRID_TOKEN: string;
	VERIFIED_SENDGRID_EMAIL: string;
	VERSION: string;
}

export const envVars: string[] = [
	"DISCORD_WEBHOOK",
	"HANDSHAKE_TOKEN",
	"LOGZIO_TOKEN",
	"SENDGRID_TOKEN",
	"VERIFIED_SENDGRID_EMAIL",
	"VERSION",
];
