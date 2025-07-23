export interface Env {
	DISCORD_WEBHOOK: string;
	HANDSHAKE_TOKEN: string;
	MAILEROO_API_KEY: string;
	SENDER_EMAIL: string;
	VERSION: string;
}

export const envVars: string[] = [
	"DISCORD_WEBHOOK",
	"HANDSHAKE_TOKEN",
	"MAILEROO_API_KEY",
	"SENDER_EMAIL",
	"VERSION",
];
