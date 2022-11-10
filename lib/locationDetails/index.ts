import { continentName } from "../continentName";
import { countryName } from "../countryName";

interface LocationDetails {
	continent: string;
	country: string;
	city: string;
	ip: string;
	asOrg: string;
	asn: number;
}

export function locationDeails(request: Request): LocationDetails {
	const {
		continent: continentCode,
		country: countryCode,
		city,
		asOrganization: asOrg,
		asn,
	} = request.cf as IncomingRequestCfProperties as any;

	return Object.defineProperties({} as LocationDetails, {
		continent: {
			get: () => continentName(continentCode),
		},
		country: {
			get: () => countryName(countryCode),
		},
		city: {
			get: () => city,
		},
		ip: {
			get: () =>
				request.headers.get("true-client-ip") ||
				request.headers.get("cf-connecting-ip") ||
				"unknown",
		},
		asOrg: {
			get: () => asOrg,
		},
		asn: {
			get: () => asn,
		},
	});
}
