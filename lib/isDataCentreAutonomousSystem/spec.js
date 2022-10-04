import { isDataCentreAutonomousSystem } from ".";

describe("lib/isDataCentreAutonomousSystem", () => {
	test.each([
		"Aixit GmbH",
		"Alibaba",
		"Amazon.com",
		"Amazon",
		"DATACITY",
		"Digital Ocean",
		"DigitalOcean",
		"Flyservers S.A.",
		"GoDaddy.com, LLC",
		"Google Cloud",
		"GTHost",
		"Hetzner Online GmbH",
		"Hosteur SAS",
		"Hostwinds LLC.",
		"InterBS S.R.L. BAEHOST",
		"Intergrid Group Pty",
		"Internet Archive",
		"Ispconnected",
		"Limestone Networks",
		"Meverywhere sp. z o.o.",
		"Microsoft Azure",
		"Microsoft Corporation",
		"Namecheap",
		"Oracle Cloud",
		"OVH SAS",
		"Petersburg Internet Network Hosting",
		"ServerMania",
		"Strato AG",
		"Tencent cloud computing",
		"Vivid Hosting",
		"Web Hosted Group Ltd",
	])("%s is a data centre", (dataCentre) => {
		expect(isDataCentreAutonomousSystem(dataCentre)).toBe(true);
	});
});
