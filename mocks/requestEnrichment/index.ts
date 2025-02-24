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
						detectionIds: [],
					},
					city: "Austin",
					clientAcceptEncoding: "gzip, deflate, br",
					clientTcpRtt: 0,
					clientTrustScore: 0,
					colo: "DFW",
					continent: "NA",
					country: "US",
					edgeRequestKeepAliveStatus: 0,
					hostMetadata: null,
					httpProtocol: "HTTP/2.0",
					isEUCountry: "1",
					latitude: "30.27130",
					longitude: "-97.74260",
					metroCode: "635",
					postalCode: "78701",
					region: "Texas",
					regionCode: "TX",
					requestPriority: "weight=192;exclusive=0;group=3;group-weight=127",
					timezone: "America/Chicago",
					tlsCipher: "AEAD-AES128-GCM-SHA256",
					tlsClientAuth: null,
					tlsVersion: "TLSv1.3",
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
