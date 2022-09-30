export interface Env {
	HANDSHAKE_TOKEN: string;
	LOGZIO_TOKEN: string;
	SENDGRID_TOKEN: string;
	VERIFIED_SENDGRID_EMAIL: string;
}

export const envVars: string[] = [
	"HANDSHAKE_TOKEN",
	"LOGZIO_TOKEN",
	"SENDGRID_TOKEN",
	"VERIFIED_SENDGRID_EMAIL",
];
