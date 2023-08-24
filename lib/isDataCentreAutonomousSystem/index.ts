const dataCentreAutonomousSystemList = new Set<string>([
	"Aixit GmbH",
	"Alibaba",
	"Amazon.com",
	"Amazon",
	"Digital Ocean",
	"DigitalOcean",
	"Flyservers S.A.",
	"GoDaddy.com, LLC",
	"Hetzner Online GmbH",
	"Intergrid Group Pty",
	"Internet Archive",
	"Ispconnected",
	"Limestone Networks",
	"Meverywhere sp. z o.o.",
	"Microsoft Azure",
	"Microsoft Corporation",
	"Namecheap",
	"OVH SAS",
	"Strato AG",
]);

const dataCentreAutonomousSystemPattern = new RegExp(
	["cloud", "data", "host", "server"].join("|"),
	"i",
);

export const isDataCentreAutonomousSystem = (as: string): boolean =>
	dataCentreAutonomousSystemPattern.test(as) ||
	dataCentreAutonomousSystemList.has(as);
