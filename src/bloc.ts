import { fetchCourse } from "./course";

export type Bloc = ReturnType<typeof parseBloc>;
export type Course = ReturnType<typeof parseCourse>;

export async function parseBloc(xml: any, onlyBa1 = true) {
	const blocName = xml.H4[0];
	const tableRows = xml.DIV as any[];
	// Remove first element, which is table header
	tableRows.shift();
	const courses = await Promise.all(tableRows.map((xml) => parseCourse(xml)));
	return {
		name: blocName,
		courses: onlyBa1
			? courses.filter(
					(c) => c.courseload.ba1.reduce((sum, x) => sum + x, 0) > 0
			  )
			: courses,
	};
}

async function parseCourse(xml: any, fetch = true) {
	const columns = xml.DIV[0].DIV;

	const [metaXml, langXml, ba1Xml, ba2Xml, _, creditsXml] = columns;

	//! Parse courseload
	const ba1Courseload = parseCourseload(ba1Xml);
	const ba2Courseload = parseCourseload(ba2Xml);

	const courseload = {
		ba1: ba1Courseload,
		ba2: ba2Courseload,
	};

	//! Parse Meta
	//? Parse Name & Link
	const courseName = metaXml.$["DATA-TITLE"];

	const courseHasLink = !!metaXml.DIV[0].A;
	const courseUrl = courseHasLink
		? "https://edu.epfl.ch" + (metaXml.DIV[0].A[0].$.HREF as string)
		: undefined;

	//TODO Fetch additional data
	const { obselete, events } = (courseUrl &&
		fetch &&
		(await fetchCourse(courseUrl))) || { obselete: false, events: [] };

	//? Parse Code & Section
	const courseInfo = (metaXml.DIV[1]._ as string).split(" / ");
	const courseCode = courseInfo[0] || undefined;
	const courseSection = courseInfo[1].substring("Section ".length);

	//? Parse Teachers
	const teachersXml = (metaXml.DIV[2].A ?? []) as any[];
	const courseTeachers = teachersXml.map((xml) => {
		const name = xml._ as string;
		const url = xml.$.HREF as string;
		const id = +(new URL(url).searchParams.get("id") as string);
		return { name, id };
	});

	const info = {
		name: courseName as string,
		code: courseCode,
		section: courseSection,
		url: courseUrl,
		teachers: courseTeachers,
	};

	//! Parse Lang
	const courseLang = langXml.DIV[0].ABBR[0];
	const langCode = courseLang._;
	const langName = courseLang.$.TITLE;

	const lang = {
		code: langCode,
		name: langName,
	};

	//! Not parsing exams.
	// bc why the fuck not

	//! Parse credits
	const credits = +creditsXml.DIV[0]._;

	return {
		...info,
		lang,
		courseload,
		credits,
		timetable: {
			obselete,
			events,
		},
	};
}

function parseCourseload(xml: any): [number, number, number] {
	function parseHours(hours: string): number {
		if (hours === "-") return 0;
		const n = hours.slice(0, -1);
		return +n;
	}

	const courseloadXml = xml.DIV[0].DIV as any[];
	const [cours, exercice, projet] = courseloadXml.map((xml) =>
		parseHours(xml._ as string)
	);

	return [cours, exercice, projet];
}
