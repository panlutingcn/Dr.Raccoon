import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import {
  DIT_MODULES,
  SEMESTER_INFOS,
  detectScheduleConflicts,
  formatModuleScheduleSummary,
  type DitModule,
  type SemesterId,
} from "./src/data/ditCatalog.ts";
import {
  buildUserProfileContextJson,
  getTargetEctsForProfile,
  sanitizeAppLanguage,
  sanitizeUserProfile,
  type AppLanguage,
  type UserProfile,
} from "./src/types/userProfile.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function createGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function isRetryableGeminiError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return (
    msg.includes("503") ||
    msg.includes("502") ||
    msg.includes("504") ||
    msg.includes("500") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("DEADLINE_EXCEEDED") ||
    msg.includes("INTERNAL") ||
    msg.includes("ECONNRESET") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("fetch failed")
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface ChatRequestMessage {
  role: "user" | "assistant";
  content: string;
}

const LANGUAGE_DIRECTIVES: Record<
  AppLanguage,
  { name: string; instruction: string }
> = {
  de: {
    name: "Deutsch",
    instruction: "Antworte klar strukturiert, freundlich und auf Deutsch.",
  },
  en: {
    name: "English",
    instruction:
      "Respond clearly, concisely, and warmly in English. Keep official German/English core domain terms (such as Master DIT, Universität Kassel, DITraM, UCeDI, CIDA, ECTS, CP, eCampus, HISPOS, Auflagen (§ 6 FPO), Klausur, Hausarbeit, Studienverlaufsplan, official module codes like BWL-P2, and official module titles) in their original German or English.",
  },
  fa: {
    name: "فارسی (Persian)",
    instruction:
      "پاسخ خود را به صورت واضح، ساختاریافته و دوستانه به زبان فارسی (Persian) بنویس. اصطلاحات کلیدی رسمی دانشگاهی را به زبان اصلی آلمانی یا انگلیسی حفظ کن (مانند Dr. Raccoon، Master DIT، Universität Kassel، DITraM، UCeDI، CIDA، ECTS، CP، eCampus، HISPOS، Auflagen (§ 6 FPO)، Klausur، Hausarbeit، کدهای رسمی ماژول‌ها مثل BWL-P2 و عناوین رسمی دروس).",
  },
  fr: {
    name: "Français",
    instruction:
      "Réponds de manière claire, structurée et bienveillante en français. Conserve les termes clés officiels dans leur langue d'origine allemande ou anglaise (comme Master DIT, Universität Kassel, DITraM, UCeDI, CIDA, ECTS, CP, eCampus, HISPOS, Auflagen (§ 6 FPO), Klausur, Hausarbeit, les codes de modules officiels comme BWL-P2 et les intitulés officiels des modules).",
  },
  zh: {
    name: "中文 (Simplified Chinese)",
    instruction:
      "请使用清晰、有条理且友好的简体中文回答。将官方核心专有名词保留为德语或英语原文（例如：Master DIT、Universität Kassel、DITraM、UCeDI、CIDA、ECTS、CP、eCampus、HISPOS、Auflagen (§ 6 FPO)、Klausur、Hausarbeit、模块代码如 BWL-P2 以及官方模块名称）。",
  },
};

function buildSystemInstruction(
  selectedModuleIds: string[],
  completedMakeupIds: string[],
  activeSemester: SemesterId,
  customModules: DitModule[],
  moduleOverrides: Record<string, Partial<DitModule>> = {},
  userProfile: UserProfile | null = null,
  language: AppLanguage = "de"
): string {
  const targetEcts = getTargetEctsForProfile(userProfile);
  const userProfileJson = buildUserProfileContextJson(userProfile);
  const semesterInfo = SEMESTER_INFOS[activeSemester] ?? SEMESTER_INFOS.wise2627;
  const allModules = [...DIT_MODULES, ...customModules].map((m) =>
    moduleOverrides[m.id] ? { ...m, ...moduleOverrides[m.id] } : m
  );
  const semesterModules = allModules.filter(
    (m) =>
      m.semester === activeSemester ||
      m.semester === "alle" ||
      m.area === "Auflagen"
  );
  const selectedModules: DitModule[] = semesterModules.filter((m) =>
    selectedModuleIds.includes(m.id)
  );
  const regularCp = selectedModules
    .filter((m) => m.area !== "Auflagen")
    .reduce((sum, m) => sum + m.cp, 0);
  const makeupCp = selectedModules
    .filter((m) => m.area === "Auflagen")
    .reduce((sum, m) => sum + m.cp, 0);
  const conflicts = detectScheduleConflicts(selectedModules);

  const catalogLines = semesterModules
    .map((m) => {
      const slots = formatModuleScheduleSummary(m);
      return `- [${m.code}] "${m.title}" | eCampus-Titel: "${m.ecampusTitle}" | ${m.cp} ECTS | Bereich: ${m.area} | Sprache: ${m.language} | Sprachbrücke nötig: ${m.ecampusLanguageMismatch ? "JA (" + m.languageNote + ")" : "Nein"} | Prüfung: ${m.examType} | Workload: ${m.workload}/5 (${m.workloadComment}) | Zeiten: ${slots} | Voraussetzung: ${m.officialPrerequisite} | Studententipp: ${m.studentTip} | Lernziele: ${m.learningGoals.join(", ")}`;
    })
    .join("\n");

  const currentSelectionText =
    selectedModules.length > 0
      ? selectedModules
          .map((m) => `${m.code} (${m.title}, ${m.cp} CP)`)
          .join(", ")
      : "Noch keine Module ausgewählt.";

  const conflictText =
    conflicts.length > 0
      ? conflicts
          .map(
            (c) =>
              `${c.day} ${c.timeRangeLabel}: ${c.modules.map((m) => m.code).join(" vs. ")}`
          )
          .join("; ")
      : "Keine Zeitkonflikte";

  return `# Role
Du bist „Dr. Raccoon“, ein kompetenter, strukturierter und empathischer KI-Studienberater für Studierende aus dem Masterstudiengang Digitale Innovation und Transformation an der Universität Kassel (Fachbereich 07 Wirtschaftswissenschaften). Deine Aufgabe ist es, Studierende bei der Semesterplanung, Modulauswahl, Prüfungsübersicht und Studienstrategie zu unterstützen.

# Context & Knowledge Base
Nutze ausschließlich die im Anhang als PDF bereitgestellten Modulinformationen (sowie die vom Studierenden im aktuellen Dashboard hinterlegten eigenen Termine/Auswahlen) als Faktenbasis:

1. **Fachprüfungsordnung (FPO, Stand 23.04.2025 / PO-2024/2025) & Studienverlaufsplan (Stand 06.07.2026):**
   - **Abschluss & Umfang (§§ 2–4 FPO):** Master of Science (M.Sc.), stärker forschungsorientiert, 4 Semester Regelstudienzeit, **120 Credits (ECTS)** gesamt (~30 CP pro Semester empfohlen; 1 Credit ≈ 30 Stunden Arbeitszeit). Studienbeginn zum Wintersemester und Sommersemester möglich.
   - **Bereiche (§ 8 Abs. 2 FPO):**
     - **BWL-Pflicht (12 CP):** **BWL-P1** Digital Transformation (6 CP, V/S 4 SWS, 180 Std. = 60h Kontakt + 120h Selbststudium; S1 max. 60h; Prüfung: Klausur 90 Min. oder Referat ca. 20 Min. + Ausarbeitung ca. 12 S. oder Hausarbeit ca. 20 S.; laut SVP im 2. Sem./SoSe) und **BWL-P2** Informationsmanagement (6 CP, V/S 4 SWS, 180 Std.; S1 max. 60h; Prüfung: Klausur 90 Min. oder Referat ca. 20 Min. + Ausarbeitung ca. 12 S. oder Hausarbeit ca. 20 S.; laut SVP im 1. Sem./WiSe).
     - **Wirtschaftsinformatik-Pflicht (12 CP):** **WI-P1** Service-Engineering & -Management (6 CP, V/S 4 SWS, 180 Std.; Wahl zwischen „Dienstleistungsengineering und -management“ oder „Collaboration Engineering“; Prüfung: Klausur 90 Min. oder Referat ca. 20 Min. + Ausarbeitung ca. 12 S. oder Hausarbeit ca. 20 S.; laut SVP im 1. Sem./WiSe) und **WI-P2** Forschungsmethoden in der Wirtschaftsinformatik (6 CP, V/S 4 SWS, 180 Std.; Prüfung: schriftl. Ausarbeitung 15–20 S.; laut SVP im 2. Sem./SoSe).
     - **Weitere Grundlagen Wahlpflicht (12 CP):** **WAHL-48** Rechtliche Grundlagen für Wirtschaftsinformatik (6 CP, 2×2 SWS, 180 Std., P1 50% + P2 50% je Klausur 60–90 Min. oder Referat+Hausarbeit oder Hausarbeit 20.000–30.000 Zeichen), **WAHL-49** Introduction to Behavioral Economics (6 CP, VL 4 SWS, 180 Std., Klausur), **WAHL-50** Environmental Economics (6 CP, VL/S 4 SWS, 180 Std., S1, Klausur 45–90 Min. ggf. Vortrag/Hausarbeit), **WAHL-51** Leadership & Change Management (6 CP, V/S 4 SWS, 180 Std., S1 max. 60h, Klausur 90 Min. / Referat+Ausarbeitung 12 S. / Hausarbeit 20 S.), **WAHL-52** Umweltpsychologie (8 CP, VL 2 + S 2 SWS, 240 Std., S1, Klausur 30–90 Min. oder mündl. 10–60 Min.), **WAHL-53** Nachhaltige Unternehmensführung: Grundlagen (6 CP, VL 4 SWS, 180 Std., Klausur mind. 90 Min.), **WAHL-54** Arbeits- und Organisationspsychologie 1 (3 CP, VLmP 2 SWS, 60 Std., Klausur 90 Min. oder mündl. 30 Min.), **WAHL-55** Arbeits- und Organisationspsychologie 2 (3 CP, VLmP 2 SWS, 60 Std., baut auf A&O 1 auf, Klausur 90 Min. oder mündl. 30 Min.), **WAHL-58** Applied Research (6 CP, S 4 SWS, 180 Std., S1 Übungsaufgabe, Präsentation mit schriftl. Ausarbeitung) bzw. Analytics for Sustainable Marketing (6 CP, S 4 SWS, 180 Std., Group Project Report + Presentation).
     - **Informatik Wahlpflicht (12 CP):** **WAHL-1** PRML I (6 CP, VLmP 2 + Ü 2 SWS, S1, Klausur 120 Min. oder mündl. 20 Min.), **WAHL-2** PRML II (6 CP, VLmP 2 + Ü 2 SWS, S1, Klausur 120 Min. oder mündl. 20 Min.), **WAHL-3** Innovating Smart Things for the Home (6 CP, Pr 4 SWS, S1, mündl. 30 Min. oder schriftl. Ausarbeitung), **WAHL-4** Labor Deep Learning (6 CP, Pr 4 SWS, S1 Praktikumsaufgaben, Praktikumsarbeit und -bericht), **WAHL-6** Temporal and Spatial Data Mining (6 CP, VLmP 3 + Ü 1 SWS, S1, Klausur 120 Min. oder mündl. 20 Min.), **WAHL-7** Agent-Based Modelling Lab (6 CP, Pr 4 SWS, S1, Ergebnispräsentation + mündl. 25 Min.), **WAHL-8** Begriffliche Datenanalyse / Conceptual Data Analysis (6 CP, VLmP 2 + Ü 2 SWS, S1, mündl. ca. 30 Min. oder Klausur ca. 120 Min.), **WAHL-9** Experimentation and Evaluation in ML (6 CP, VLmP 2 + Ü 2 SWS, S1, mündl. 20 Min. oder Klausur 120 Min.), **WAHL-10** Funktionale Programmierung (6 CP, VLmP 2 + PrM 2 SWS, S1, Projektarbeit), **WAHL-11** Labor Grand Challenges of ML (6 CP, Pr 4 SWS, S1 Wettbewerb, Praktikumsarbeit und -bericht), **WAHL-12** Labor Intelligent Robots (6 CP, Pr 4 SWS, S1, Abschlussaufgabe mit Ausarbeitung und Präsentation), **WAHL-13** Labor Netzwerke (6 CP, Pr 4 SWS, Praktikumsaufgaben + mündl. ca. 30 Min.), **WAHL-14** Labor Qualitative Datenanalyse (6 CP, Pr 4 SWS, Praktikumsaufgaben + mündl. ca. 30 Min.), **WAHL-15** Parallele Algorithmen (6 CP, VLmP 2 + PrM 2 SWS, Projektarbeit), **WAHL-16** Parallele Programmierung (6 CP, VLmP 2 + PrM 2 SWS, Projektarbeit), **WAHL-17** Software-Verifikation (6 CP, VLmP 2 + Ü 2 SWS, S1, mündl. ca. 30 Min. oder Klausur ca. 120 Min.), **WAHL-18** Softwarequalität (6 CP, VLmP 2 + Ü 2 SWS, Klausur 120 Min. oder mündl. 40 Min. oder Hausarbeit), **WAHL-19** Soziale Netzwerkanalyse / Social Network Analysis (6 CP, VLmP 2 + Ü 2 SWS, mündl. ca. 30 Min. oder schriftl. ca. 120 Min.), **WAHL_05** Internet Measurements (6 CP, VLmP 2 + Ü 1 + Pr 1 SWS, S1 50% Aufgaben, Klausur 120 Min. oder mündl. 30 Min.).
     - **Masterprofil (24 CP – genau 1 Profil wählen):**
       - *DITraM (Digital Innovation & Transformation Management, BWL):* **WAHL-20** (6 CP), **WAHL-21** PM 1 (3 CP, S1, Klausur 60 Min.), **WAHL-22** PM 2 (3 CP, S1, Klausur 60 Min.), **WAHL-23** Strategic PM (3 CP, S1, Klausur 45 Min. / mündl. 20 Min.), **WAHL-24** Interorganisatorische Beziehungen (3 CP, S1, Klausur 45 Min. / Projektarbeit 20–30 S.), **WAHL-25** Cases & Debates in PM & Transformation (3 CP, S1, Vortrag 20 Min. + Ausarbeitung 30–40 S. Gruppe / mündl. 20 Min.), **WAHL-26** Forschungsseminar PM (6 CP, S 4 SWS, S1, Hausarbeit 15–30 S. + Vortrag 10–20 Min.), **WAHL-27** Research Methods and Analytics in Project Studies (3 CP, S 2 SWS, S1, Projektarbeit 20–30 S. + Vortrag 15 Min.), **WAHL-28** Digitalisierung Produktion & Logistik (6 CP, S 4 SWS, S1 Anwesenheit, Hausarbeit + Seminarvortrag 30 Min.), **WAHL-29** Business Model Innovation (6 CP, V/S 4 SWS, S1, Klausur 90 Min. / Referat + Ausarbeitung 12 S. / Hausarbeit 20 S.), **WAHL-30** Computing & Society (6 CP, VLmP 2 + Ü 2 SWS, S1, Hausarbeit ca. 4.000 Wörter / Präsentation / mündl. 20 Min.), **WAHL-31** Ausgewählte Themen TIME & Entrepreneurship (6 CP, 162 Std., Exposé / Ausarbeitung 5–10 S.), **WAHL-32** Customer Experience Management (6 CP, S 4 SWS, Präsentation mit schriftl. Ausarbeitung), **WAHL-33** Marketing Intelligence (6 CP, V/Ü 4 SWS, Klausur / mündl. / Referat+Hausarbeit), **WAHL-34** Digital Business (6 CP, V 4 SWS, Klausur 90 Min.), **WAHL-35** Cases of Digital Transformation (6 CP, S1 Zwischenpräsentation, Seminararbeit 4.000 Wörter), **WAHL-36** ML in the Context of Digital Transformation (6 CP, S 4 SWS, S1 Zwischenpräsentation + S2 ML-Anwendung, Hausarbeit 2.500 Wörter), **WAHL-37** Social and Ethical Implications of Digitalization (6 CP, S 4 SWS, S1 Zwischenpräsentation, Klausur 90 Min.), **WAHL-38** Ausgewählte Fragestellungen der digitalen Transformation (6 CP, Projektseminar, 30h Kontakt + 150h Selbststudium, S1 Referat 20 Min., Hausarbeit 12 S.), **WAHL-56** Software & Internet Economics (6 CP, V 4 SWS, Klausur 90 Min.), **WAHL-57** Advanced Supply Chain Management (6 CP, S 4 SWS, S1 Präsentation 15–20 Min., Seminararbeit 7.000–8.000 Wörter).
       - *UCeDI (User Centered Design of Digital Innovations, Wirtschaftsinformatik):* **WAHL-3** (6 CP), **WAHL-39** Einführung in die Projektarbeit (3 CP, davon 2 CP SK, S1 Anwesenheit), **WAHL-41** Mensch-Maschine-Systeme 1 (3 CP, S1 Anwesenheit, Klausur 90 Min. / mündl. 20 Min.), **WAHL-41** Vorbereitungsseminar Masterarbeit WI & Systementwicklung (6 CP, Präsentation + Ausarbeitung), **WAHL-42** Assistenzsysteme (4 CP, VLmP 2 + Ü 1 SWS, mündl. 20 Min.), **WAHL-43** Informationssysteme (3 CP, VLmP 2 SWS, Klausur 90 Min.), **WAHL-44** Mensch-Maschine-Systeme 2 (3 CP, VLmP 2 SWS, Klausur 90 Min. / mündl. 20 Min.), **WAHL-45** Praktikum Mensch-Maschine-Interaktion (3 CP, Pr 2 SWS, S1 Anwesenheit, Praktikumsberichte), **WAHL-46** Seminar Automatisierung (6 CP, S 4 SWS, S1 Anwesenheit, Seminarvortrag oder Hausarbeit), **WAHL-47** Forschung unter Anleitung (6 CP, Individualbetreuung 4 SWS, schriftl. Ausarbeitung 10–15 S.), **WAHL-58** Applied Research (6 CP), **WAHL-59** Prompt Engineering: Innovation Through Generative AI (6 CP, S 4 SWS, 40h Kontakt + 140h Selbststudium, Präsentation mit schriftl. Ausarbeitung nach ACM-Format), **WAHL-60** Skalierbare digitale Unternehmen (B2B) gründen (6 CP, S 4 SWS, S1 Übungsaufgabe, Präsentation mit Ausarbeitung). Zudem laut Vorstellung WiSe 26/27 neu im WS 26/27: „Responsible Design and Sustainable Operation of Enterprise Systems“, „Trustworthy Emerging Information Systems“, „Information Systems Research and Innovation Seminar“ (Semesterferienkurs, Plätze noch verfügbar).
       - *CIDA (Computational Intelligence & Data Analytics, Informatik):* **WAHL-1**, **WAHL-2**, **WAHL-4**, **WAHL-8**, **WAHL-9**, **WAHL-11**, **WAHL-12**, **WAHL-13**, **WAHL-14**, **WAHL-19** (je 6 CP). **Wichtig:** Keine Überschneidung / Doppelanrechnung zu Informatik-Wahlpflicht!
       - **Profilfestlegung (§ 8 Abs. 5 FPO / Vorstellung S. 13):** Mit Antritt zur ersten ausschließlich dem Profil anzurechnenden Modul-/Teilprüfung bzw. nach erfolgreichem Bestehen eines Profilmoduls ist das Profil festgelegt; ein Wechsel bedarf der Genehmigung des Prüfungsausschusses.
     - **Projektseminar entsprechend dem Masterprofil (PROJEKTSEMINAR, 12 CP):** Voraussetzung: Nachweis von **30 Credits** im Studium; 360 Std. (20h Kontakt + 340h Selbststudium); Präsentation mit Ausarbeitung oder Hausarbeit (Forschungsbericht); ggf. auch 2×6-CP-Kurse; laut SVP im 3. Semester.
     - **Additive Schlüsselkompetenzen (KOMPETENZ-K1, 6 CP):** Sprachkurse (z. B. ISZ), studentisches Engagement, Auslandsstudium, fachfremde B.Sc.-Kurse (ohne WI-Schwerpunkt), Praktika (1 CP pro 30 Std., bis 180 Std. = 6 CP ohne Praxisbericht auf Antrag beim Prüfungsausschuss). Anmeldung i. d. R. über das Prüfungsamt; laut SVP im 3. Semester.
     - **Abschlussmodul Masterarbeit (MASTER, 30 CP, § 9 FPO):** Voraussetzung: **84 Credits** + vollständige Erfüllung aller Auflagen; 720 Std. Selbststudium; Bearbeitungszeit **24 Wochen** (einmalige Themenrückgabe innerhalb der ersten 7 Wochen); Masterkolloquium (30–60 Min. oder 3 Präsentationen à 10–20 Min., 25% der Modulnote). Laut SVP im 4. Semester.

2. **Auflagen zum Masterstudium (§ 6 FPO & Empfehlungs-PDF):**
   - Fachliche Einschlägigkeit erfordert i. d. R. mind. 24 CP Informatik, 18 CP Mathe/Statistik, 12 CP WiWi, 6 CP Wirtschaftsinformatik. Fehlende Leistungen bis max. **30 CP** gesamt werden als Auflagen erteilt (Obergrenzen: Informatik max. 12 CP, Mathe/Statistik/Ökonometrie max. 18 CP, WiWi max. 12 CP, Wirtschaftsinformatik max. 6 CP).
   - Auflagen zählen nicht zu den 120 Master-CP und gehen nicht in die Abschlussnote ein, müssen aber bis zur Anmeldung der Masterarbeit bestanden sein. Anmeldung i. d. R. manuell über das Prüfungsamt (eCampus-Anmeldung in Vorbereitung).
   - *Empfohlene B.Sc.-Kurse:* Informatik: Einführung in die Informatik (9 CP), Algorithmen und Datenstrukturen (6 CP), Theoretische Grundlagen der Informatik (6 CP), Programmierung und Modellierung (6 CP), Datenbanken (6 CP). Mathe/Statistik: Mathematik (9 CP), Deskriptive Statistik (6 CP), Induktive Statistik (6 CP). WiWi (je 6 CP): Marketing, Strategie und Leistungsprozesse, Gründungs- und Innovationsmanagement, Finanzwirtschaft, Digitale Disruption, Bilanzielles Rechnungswesen, Entscheidungsorientierte Unternehmensrechnung, Mikroökonomik, Makroökonomik, Wirtschaftspolitik, Wirtschaftspsychologie, Grundlagen der Ökonometrie, Organizational und Consumer Behavior. Wirtschaftsinformatik (je 6 CP): Wirtschaftsinformatik, Betriebliche Informationssysteme, Information Systems Analysis and Design, Prozessmanagement (Digitalisierung von Geschäftsprozessen). Weitere/andere Kurse nach Absprache mit \`studienkoordination-dit@uni-kassel.de\` möglich.

3. **Termine WiSe 26/27 & offizielle Ansprechpersonen (Vorstellung Master DIT 2026):**
   - **Beispielhafte Kurse im WiSe 26/27 (Vorstellung S. 25):** BWL-P2 Informationsmanagement: Kickoff am 19.10.26, Raum 0422, Nora-Platiel-Str. 8 (Uhrzeit im PDF nicht angegeben); WI-P1 Service-Engineering & -Management: Kickoff am 15.10.26 um 10–11 Uhr via Zoom; WAHL-48 Rechtliche Grundlagen: Mi ab 14.10.26; WAHL-8 Begriffliche Datenanalyse: Di ab 20.10.26; WAHL-16 Parallele Programmierung: ab 26.10.26; WAHL-1 PRML I: Mo ab 19.10.26 (weitere Uhrzeiten/Räume sind nicht im PDF enthalten → eCampus prüfen).
   - **Ansprechpersonen (FB 07):** Studienfachberatung: Sophia Meywirth (\`fb07-dit@uni-kassel.de\`, Pfannkuchstraße 1, 34121 Kassel); Studentische Studienfachberatung: Alen Culina (\`fb07-ssb-dit@uni-kassel.de\`, Henschelstr. 2, R 3133, Sprechstunde Mo 13–14 Uhr oder nach Vereinbarung); Studiengangsverantwortlicher: Prof. Dr. Sebastian Lins (\`studienkoordination-dit@uni-kassel.de\`, Untere Königsstraße 71, 34117 Kassel); Prüfungsausschussvorsitzender: Prof. Dr. André Hanelt; Moodle-Kurs: \`https://moodle.uni-kassel.de/course/view.php?id=19889\`.

4. **Aktueller Semester- & Dashboard-Kontext (${semesterInfo.label} · ${semesterInfo.studySemesterLabel}):**
   - Aktuell vom Studierenden im Stundenplan ausgewählt: ${currentSelectionText}
   - Reguläre Master-CP im aktuellen Plan: ${regularCp} CP (Persönliches Semesterziel laut Profil: ${targetEcts} CP, Gesamtstudium: 120 CP)
   - Auflagen-CP im aktuellen Plan: ${makeupCp} CP (Als bestanden markiert: ${completedMakeupIds.length > 0 ? completedMakeupIds.join(", ") : "keine"})
   - Aktuelle Zeitkonflikte im Dashboard: ${conflictText}
   - Verfügbare Module & aktuell eingetragene Zeiten/Daten im Dashboard (${semesterInfo.shortLabel}):
${catalogLines}

5. **Aktuelles Studienprofil des Nutzers (Echtzeit-Kontext):**
<user_profile>
${userProfileJson}
</user_profile>

# Step-by-Step Reasoning (Chain-of-Thought)
Befolge bei jeder Beratungsanfrage intern diese Schritte, bevor du antwortest:
1. Bedarfsanalyse & Profil-Abgleich: Werte zuerst den \`<user_profile>\`-Block aus. Identifiziere Ziel (z. B. Stundenplan, Workload-Check, Karrierefokus) sowie Einschränkungen (z. B. Fachsemester, Nebenjob-Stunden, gewünschter Workload, Vorkenntnisse).
2. Personalisierung & Regelprüfung:
   - **Personalisierte Empfehlungen:** Berücksichtige immer den \`<user_profile>\`-Kontext. Bei einem nicht-technischen bzw. fachfremden Bachelor (z. B. Wirtschaftswissenschaften, Informationswissenschaften oder Sonstiges, \`isNonTechnicalBachelor: true\`) weise proaktiv auf relevante Auflagen (§ 6 FPO, z. B. fehlende Informatik-/Mathe-/Statistik-/WI-Grundlagen bis max. 30 CP) hin. Priorisiere Module aus dem gewählten Master-Profil (\`DITraM\`, \`UCeDI\` oder \`CIDA\`) und berücksichtige das aktuelle Fachsemester (z. B. im 3. Sem. Projektseminar/Schlüsselkompetenzen, im 4. Sem. 84-CP-Grenze & Auflagenabschluss vor Masterarbeit).
   - Prüfe Modulkombinationen auf Zeitüberschneidungen, benötigte Vorkenntnisse und exakte CP-Summen passend zum Profilziel (${targetEcts} CP; CIDA-Doppelanrechnungsverbot beachten; Pflichtmodule vs. Wahlpflicht trennen).
3. Empfehlungslogik & Workload-Check: Kombiniere formale Vorgaben (Prüfungsordnung) mit praxisnahen Hinweisen zu Arbeitsbelastung (Workload) und Prüfungsformen.

# Guardrails (Halluzinations-, Workload- & Datenschutz-Regeln)
- Keine Erfindungen: Wenn Informationen (z. B. aktuelle Raumnummern, exakte Vorlesungs-/Übungszeiten oder unbestätigte Prüfungstermine) nicht im Context stehen, sage dies transparent und verweise auf das offizielle Campus-Portal (z. B. eCampus).
- Kritische Prüfung: Wenn der Nutzer widersprüchliche Wünsche äußert (z. B. zu viele CPs, doppelte Anrechnung zwischen CIDA und Informatik-WP oder zeitgleiche Kurse), weise freundlich auf den Konflikt hin und schlage eine realistische Alternative vor.
- **Workload- & Anti-Sycophancy-Check:** Wenn der Nutzer laut \`<user_profile>\` eine hohe Werkstudententätigkeit hat (z. B. 15–20 Std./Woche), aber gleichzeitig 30+ ECTS (oder im aktuellen Plan bereits sehr hohe CP / viele prüfungsintensive bzw. als aufwändig bekannte Module) anstrebt oder wählt, weise freundlich aber bestimmt auf das konkrete Überlastungsrisiko hin (da 30 CP ≈ 900 Std./Semester + Nebenjob) und schlage proaktiv eine realistischere Alternative vor (z. B. Reduktion auf ~24 ECTS bzw. einen ausgewogeneren Mix aus Klausur- und Seminarmodulen).
- **Fallback bei leerem Profil:** Falls \`profileConfigured\` in \`<user_profile>\` \`false\` ist (noch kein Profil ausgefüllt), frage bei allgemeinen Planungsanfragen gezielt nach Bachelor-Hintergrund, gewünschtem Master-Profil (DITraM, UCeDI, CIDA) und zeitlicher Verfügbarkeit (Nebenjob / gewünschter ECTS-Workload) — und weise optional kurz darauf hin, dass das Profil oben rechts über „Mein Profil“ gespeichert werden kann.

# Output Format & Language (${LANGUAGE_DIRECTIVES[language].name})
- ${LANGUAGE_DIRECTIVES[language].instruction}
- Nutze für Modulvergleiche oder Stundenpläne immer eine übersichtliche Markdown-Tabelle (5 Spalten: Modul | CPs / ECTS | Sprache | Prüfungsform | Workload — übersetze die Spaltenüberschriften passend in ${LANGUAGE_DIRECTIVES[language].name}, aber behalte im Feld „Modul“ immer den offiziellen Modulcode samt Originalnamen bei, z. B. \`BWL-P2: Informationsmanagement\`).
- Schließe jede Antwort mit einer konkreten Rückfrage in ${LANGUAGE_DIRECTIVES[language].name} ab, um die Planung weiter zu verfeinern.`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  let hydrogenQuotaCooldownUntil = 0;

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "dr-raccoon-dit-advisor" });
  });

  app.post("/api/chat", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      res.status(500).json({
        error:
          "Kein gültiger GEMINI_API_KEY auf dem Server hinterlegt. Bitte prüfe die Einstellungen unter Settings > Secrets.",
      });
      return;
    }

    const body = req.body as {
      messages?: ChatRequestMessage[];
      selectedModuleIds?: string[];
      completedMakeupIds?: string[];
      customModules?: DitModule[];
      moduleOverrides?: Record<string, Partial<DitModule>>;
      activeSemester?: SemesterId;
      userProfile?: UserProfile | null;
      language?: AppLanguage;
    };

    const messages = Array.isArray(body?.messages) ? body.messages : [];
    if (messages.length === 0) {
      res.status(400).json({ error: "Bitte gib eine Frage für Dr. Raccoon ein." });
      return;
    }

    const selectedModuleIds = Array.isArray(body?.selectedModuleIds)
      ? body.selectedModuleIds
      : [];
    const completedMakeupIds = Array.isArray(body?.completedMakeupIds)
      ? body.completedMakeupIds
      : [];
    const customModules = Array.isArray(body?.customModules)
      ? body.customModules.filter(
          (m): m is DitModule =>
            Boolean(m) &&
            typeof m === "object" &&
            typeof m.id === "string" &&
            typeof m.title === "string"
        )
      : [];
    const moduleOverrides =
      body?.moduleOverrides && typeof body.moduleOverrides === "object"
        ? body.moduleOverrides
        : {};
    const activeSemester: SemesterId =
      body?.activeSemester === "sose27" ? "sose27" : "wise2627";
    const userProfile = sanitizeUserProfile(body?.userProfile);
    const language = sanitizeAppLanguage(body?.language ?? userProfile?.language);

    const systemInstruction = buildSystemInstruction(
      selectedModuleIds,
      completedMakeupIds,
      activeSemester,
      customModules,
      moduleOverrides,
      userProfile,
      language
    );

    const rawMessages = messages
      .filter(
        (msg) =>
          msg &&
          typeof msg.content === "string" &&
          msg.content.trim().length > 0 &&
          (msg.role === "user" || msg.role === "assistant")
      )
      .map((msg) => ({
        role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: msg.content.trim() }],
      }));

    // Ensure conversation turns passed to Gemini start with a user turn
    const firstUserIdx = rawMessages.findIndex((m) => m.role === "user");
    const contents =
      firstUserIdx >= 0 ? rawMessages.slice(firstUserIdx) : [];

    if (contents.length === 0) {
      res.status(400).json({ error: "Bitte gib eine Frage für Dr. Raccoon ein." });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();
    res.write(": connected\n\n");

    const keepaliveTimer = setInterval(() => {
      if (!res.writableEnded) {
        res.write(": keepalive\n\n");
      }
    }, 8000);

    let sawQuotaError = Date.now() < hydrogenQuotaCooldownUntil;

    try {
      const ai = createGeminiClient(apiKey);
      let streamedAnyText = false;
      const modelsToTry: readonly ("gemini-4-hydrogen" | "gemini-3.1-flash-lite")[] =
        sawQuotaError
          ? ["gemini-3.1-flash-lite"]
          : ["gemini-4-hydrogen", "gemini-3.1-flash-lite"];
      let lastError: unknown = null;

      for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
        const modelName = modelsToTry[mIdx];
        const hasFallbackModel = mIdx < modelsToTry.length - 1;
        const maxAttempts = hasFallbackModel ? 2 : 4;
        let shouldTryNextModel = false;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            const config =
              modelName === "gemini-3.1-flash-lite"
                ? { systemInstruction }
                : {
                    systemInstruction,
                    thinkingConfig: {
                      thinkingLevel: ThinkingLevel.LOW,
                    },
                  };

            const stream = await ai.models.generateContentStream({
              model: modelName,
              contents,
              config,
            });

            for await (const chunk of stream) {
              const text = chunk.text;
              if (text) {
                streamedAnyText = true;
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
              }
            }
            lastError = null;
            break;
          } catch (attemptErr) {
            lastError = attemptErr;
            const errStatus =
              typeof (attemptErr as { status?: unknown })?.status === "number"
                ? (attemptErr as { status: number }).status
                : undefined;
            const errMsg =
              attemptErr instanceof Error
                ? attemptErr.message
                : String(attemptErr ?? "");

            const isQuotaError =
              errStatus === 429 ||
              errMsg.includes("RESOURCE_EXHAUSTED") ||
              errMsg.includes("429");

            if (isQuotaError) {
              sawQuotaError = true;
              if (
                modelName === "gemini-4-hydrogen" &&
                (errMsg.includes("PerDay") || errMsg.includes("free_tier"))
              ) {
                hydrogenQuotaCooldownUntil = Date.now() + 5 * 60 * 1000;
              }
            }

            if (!streamedAnyText && isQuotaError && hasFallbackModel) {
              console.warn(
                `Gemini-Kontingent für ${modelName} erschöpft, wechsle auf Fallback-Modell ${modelsToTry[mIdx + 1]}.`
              );
              shouldTryNextModel = true;
              break;
            }

            if (
              !streamedAnyText &&
              (isRetryableGeminiError(attemptErr) ||
                errStatus === 503 ||
                errStatus === 500 ||
                errStatus === 502 ||
                errStatus === 504)
            ) {
              if (attempt < maxAttempts) {
                await sleep(600 * attempt);
                continue;
              }
              if (hasFallbackModel) {
                shouldTryNextModel = true;
                break;
              }
            }
            throw attemptErr;
          }
        }

        if (!shouldTryNextModel) {
          break;
        }
      }

      if (lastError) {
        throw lastError;
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err: unknown) {
      const errStatus =
        typeof (err as { status?: unknown })?.status === "number"
          ? (err as { status: number }).status
          : undefined;
      const rawMessage =
        err instanceof Error ? err.message : "Unbekannter Serverfehler";
      const isQuotaError =
        errStatus === 429 ||
        rawMessage.includes("RESOURCE_EXHAUSTED") ||
        rawMessage.includes("429");
      const isUnavailableError =
        errStatus === 503 ||
        rawMessage.includes("503") ||
        rawMessage.includes("UNAVAILABLE");

      if (isQuotaError || isUnavailableError) {
        console.warn(
          `Gemini API transient/quota notice (status=${errStatus ?? "unknown"}):`,
          rawMessage.slice(0, 240)
        );
      } else {
        console.error("Gemini API error:", rawMessage);
      }

      let userMessage =
        "Die KI-Studienberatung konnte gerade nicht erreicht werden. Bitte versuche es in einem Moment erneut.";
      if (
        errStatus === 400 ||
        errStatus === 401 ||
        errStatus === 403 ||
        rawMessage.includes("API_KEY_INVALID") ||
        rawMessage.includes("PERMISSION_DENIED") ||
        rawMessage.includes("403") ||
        rawMessage.includes("400")
      ) {
        userMessage =
          "Der hinterlegte Gemini API-Schlüssel wurde abgelehnt. Bitte überprüfe ihn im Bereich Settings > Secrets.";
      } else if (isQuotaError) {
        userMessage =
          rawMessage.includes("PerDay") || rawMessage.includes("free_tier")
            ? "Das kostenlose Tageskontingent (Free Tier) der Gemini API wurde erreicht. Du kannst im Bereich Settings > Secrets einen API-Schlüssel mit aktivierter Abrechnung auswählen, um dein Kontingent zu erhöhen, oder es später erneut versuchen."
            : "Das aktuelle Anfrage-Kontingent wurde vorübergehend erreicht. Bitte warte kurz und sende die Frage erneut.";
      } else if (isUnavailableError && sawQuotaError) {
        userMessage =
          "Das kostenlose Tageskontingent für das Hauptmodell wurde erreicht und das Ausweichmodell ist aktuell stark ausgelastet. Bitte versuche es in wenigen Sekunden erneut oder wähle unter Settings > Secrets einen API-Schlüssel mit aktivierter Abrechnung aus.";
      } else if (isUnavailableError) {
        userMessage =
          "Die KI-Server sind aktuell vorübergehend stark ausgelastet. Bitte warte einen kurzen Moment und sende deine Frage erneut.";
      } else if (
        errStatus === 404 ||
        rawMessage.includes("NOT_FOUND") ||
        rawMessage.includes("404")
      ) {
        userMessage =
          "Das konfigurierte KI-Modell wurde nicht gefunden. Bitte prüfe die Serverkonfiguration.";
      }

      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ error: userMessage })}\n\n`);
        res.end();
      }
    } finally {
      clearInterval(keepaliveTimer);
    }
  });

  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("/{*path}", (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        next();
        return;
      }
      const indexHtml = path.join(distDir, "index.html");
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send("Build nicht gefunden.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dr. Raccoon Server läuft auf http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fehler beim Starten des Servers:", err);
  process.exit(1);
});
