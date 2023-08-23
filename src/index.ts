import { fetchSection } from "./section";
import { SECTIONS } from "./util";
import fs from "fs";

// Go and get that damn data

const data: Record<string, any> = {};

async function main() {
	const writeSections = false;

	for (const code of Object.keys(SECTIONS)) {
		// if (code !== "MT") continue;
		console.log(code);
		const section = await fetchSection(code as keyof typeof SECTIONS);
		if (writeSections)
			fs.writeFile(
				`data/${code}.json`,
				JSON.stringify(section, null, 4),
				(err) => {}
			);

		data[code] = section;
	}

	fs.writeFile(
		"data/sections.json",
		JSON.stringify(data, null, 4),
		(err) => {}
	);
}

main();
