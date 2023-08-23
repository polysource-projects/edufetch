import { parseBloc } from "./bloc";
import { SECTIONS, SECTION_NAMES, getXML } from "./util";

export async function fetchSection(section: keyof typeof SECTIONS) {
	const url = `https://edu.epfl.ch/studyplan/fr/propedeutique/${SECTIONS[section]}/`;
	const xml = await getXML(url);

	// App container
	const app = xml.HTML.BODY[0].DIV[2];
	// Main content
	const main = app.DIV[0].DIV[1].DIV[0].MAIN[0].DIV[0];

	const blocsXml = main.DIV as any[];

	const blocs = await Promise.all(blocsXml.map((xml) => parseBloc(xml)));

	// Flatten to a list of courses
	const courses = blocs.map((b) => b.courses).flat();

	const grouped = [];

	// Group by name
	for (const course of courses) {
		const normalName = course.name;
		// Find standard name, and precision
		const groupName = normalName.split(" (")[0];
		const precision = normalName.split(" (")[1]?.split(")")[0] || undefined;

		const augmentedCourse = {
			...course,
			groupName,
			precision,
		};

		const i = grouped.findIndex((c) => c.groupName === groupName);
		if (i === -1) {
			grouped.push({
				groupName,
				courses: [augmentedCourse],
			});
		} else {
			// If no precision = default course, put it at the beginning
			if (!precision) grouped[i].courses.unshift(augmentedCourse);
			// Else push to the end of the list
			else grouped[i].courses.push(augmentedCourse);
		}
	}

	return {
		sectionCode: section,
		sectionName: SECTION_NAMES[section],
		groups: grouped,
	};
}
