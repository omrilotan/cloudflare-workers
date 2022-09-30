const dataCentreASNList = new Set<string>([
	"Aixit GmbH",
	"Alibaba",
	"Amazon",
	"Amazon.com",
	"Digital Ocean",
	"DigitalOcean",
	"Flyservers S.A.",
	"GoDaddy.com, LLC",
	"Google Cloud",
	"GTHost",
	"Hetzner Online GmbH",
	"Hosteur SAS",
	"Hostwinds LLC.",
	"Intergrid Group Pty",
	"Internet Archive",
	"Ispconnected",
	"Limestone Networks",
	"Meverywhere sp. z o.o.",
	"Microsoft Azure",
	"Oracle Cloud",
	"OVH SAS",
	"Tencent cloud computing",
	"Vivid Hosting",
	"Web Hosted Group Ltd",
]);

export const isDataCentreASN = (asn: string): boolean =>
	dataCentreASNList.has(asn);
