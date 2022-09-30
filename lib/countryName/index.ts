import lookup from "country-code-lookup";

export const countryName = (code: string | undefined): string =>
	code ? lookup.byIso(code)?.country || code : "unknown";
