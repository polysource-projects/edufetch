// Parse study plan of each section
// Parse course times

import { getXML } from "./util";

function parseStudyplan(xml: any) {
	return undefined;
}

function parseEvents(xml: any) {
	return xml;
}

export async function fetchCourse(url: string) {
	// Check if it's a course
	if (!url.includes("/coursebook")) return;
	const xml = await getXML(url);

	const main = xml.HTML.BODY[0].DIV[2].DIV[0].DIV[1].DIV[0].MAIN[0].DIV[0];
	// console.log(url);
	// console.log(main.HEADER[0].H1);
	const courseName = main.HEADER[0].H1[0]._;

	const obselete = (main.DIV as any[]).some(
		(div) =>
			div.$.CLASS.split(" ").includes("alert-container") &&
			div.DIV[0]?._?.includes("année passée")
	);
	const rows = main.DIV[main.DIV.length - 1];

	const [_, info] = rows.DIV;
	const [studyPlans, schedule] = info.DIV;

	//! Parse schedule
	const timetable = (schedule.TABLE[0].TBODY[0].TR as any[]).map((h) => {
		const elems = h.TD as any[];
		elems.shift();
		return elems.map((elem) => {
			if (
				typeof elem === "string" ||
				!(elem.$.CLASS as string).split(" ").includes("taken")
			)
				return null;

			const duration = +elem.$.ROWSPAN || 1;
			const classes = (elem.$.CLASS as string).split(" ");
			const type = classes.find((c) =>
				["cours", "exercice", "projet"].includes(c)
			)! as "cours" | "exercice" | "projet";
			return { duration, type };
		});
	});
	timetable.shift();

	// Account for gaps below where there are events
	for (const [h, events] of timetable.entries()) {
		for (const [i, event] of events.entries()) {
			if (!event || event.duration === 1) continue;
			// There is an event, its index is i
			for (let j = 1; j <= event.duration - 1; j++) {
				// Add gap filler at hour h + j, at index i
				timetable[h + j];
				timetable[h + j].splice(i, 0, null);
			}
		}
	}

	// Timetable is now adjusted and can be used properly!
	// List every event

	const listed = [];

	for (const [h, events] of timetable.entries()) {
		const hour = h + 8;
		for (const [d, event] of events.entries()) {
			const day = d + 1;
			if (!event) continue;
			listed.push({
				day,
				time: hour,
				...event,
			});
		}
	}

	return { obselete, events: listed };
}

// fetchCourse(
// 	"https://edu.epfl.ch/studyplan/fr/propedeutique/microtechnique/coursebook/information-calcul-communication-CS-119-C"
// );
