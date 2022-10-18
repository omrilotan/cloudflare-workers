export const requestEnrichment = {
	mount: () => {
		Object.defineProperty<Request>(Request.prototype, "cf", {
			get: function (): IncomingRequestCfProperties {
				return {
					asn: 395747,
					asOrganization: "Google Cloud",
					botManagement: {
						corporateProxy: false,
						ja3Hash: "",
						score: 0,
						staticResource: false,
						verifiedBot: false,
					},
					clientAcceptEncoding: "gzip, deflate, br",
					clientTcpRtt: 0,
					colo: "DFW",
					country: "US",
					isEUCountry: null || "1",
					httpProtocol: "HTTP/2.0",
					requestPriority: "weight=192;exclusive=0;group=3;group-weight=127",
					tlsCipher: "AEAD-AES128-GCM-SHA256",
					tlsClientAuth: null,
					tlsVersion: "TLSv1.3",
					city: "Austin",
					continent: "NA",
					latitude: "30.27130",
					longitude: "-97.74260",
					postalCode: "78701",
					metroCode: "635",
					region: "Texas",
					regionCode: "TX",
					timezone: "America/Chicago",
				};
			},
			enumerable: true,
			configurable: true,
		});
	},
	unmount: () => {
		Object.defineProperty(Request.prototype, "cf", {
			value: null,
			writable: true,
			enumerable: true,
			configurable: true,
		});
	},
};
