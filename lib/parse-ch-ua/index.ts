export function parseCHUA(header: string): string | undefined {
	if (!header) {
		return;
	}
	const dict = header
		.split(",")
		.map((i) => i.trim())
		.map((i) =>
			i.split(";v=").map((i) => {
				try {
					return JSON.parse(i);
				} catch (e) {
					return i;
				}
			})
		)
		.filter(([k]) => !k.includes("Brand"));

	if (dict.length > 1) {
		// Remove "chromium" user agent
		const index = dict.findIndex(([k]) => /^chromium$/i.test(k));
		index > -1 && dict.splice(index, 1);
	}

	return dict.flat().join(" ");
}
