const codes = new Map<string, string>([
	["AF", "Africa"],
	["AN", "Antarctica"],
	["AS", "Asia"],
	["EU", "Europe"],
	["NA", "North America"],
	["OC", "Oceania"],
	["SA", "South America"],
]);

export const continentName = (code: string | undefined): string | undefined =>
	code && codes.get(code);
