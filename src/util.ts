import axios from "axios";
import { parseStringPromise as parseXML } from "xml2js";

export const SECTIONS = {
	IN: "informatique",
	AR: "architecture",
	CGC: "chimie-et-genie-chimique",
	GC: "genie-civil",
	GM: "genie-mecanique",
	EL: "genie-electrique-et-electronique",
	SV: "ingenierie-des-sciences-du-vivant",
	MA: "mathematiques",
	MT: "microtechnique",
	PH: "physique",
	MX: "science-et-genie-des-materiaux",
	SIE: "sciences-et-ingenierie-de-l-environnement",
	SC: "systemes-de-communication",
};

export const SECTION_NAMES = {
	IN: "Informatique",
	AR: "Architecture",
	CGC: "Chimie et génie chimique",
	GC: "Génie civil",
	GM: "Génie mécanique",
	EL: "Génie électrique et électronique",
	SV: "Ingénierie des sciences du vivant",
	MA: "Mathématiques",
	MT: "Microtechnique",
	PH: "Physique",
	MX: "Science et génie des matériaux",
	SIE: "Sciences et ingénierie de l'environnement",
	SC: "Systèmes de communication",
};

export const getXML = async (url: string) =>
	axios
		.get(url, { responseType: "text" })
		.then((res) => res.data)
		.then((data) => parseXML(data, { strict: false }))
		.then((xml) => xml);
