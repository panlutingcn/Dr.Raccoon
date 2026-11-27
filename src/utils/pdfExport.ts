import { jsPDF } from "jspdf";
import autoTable, { type RowInput } from "jspdf-autotable";
import {
  TIME_BLOCKS,
  WEEKDAYS,
  detectScheduleConflicts,
  doSlotsOverlap,
  getActiveScheduleSlots,
  getSlotTimeRange,
  getTimetableBlockHour,
  type DitModule,
  type SemesterId,
} from "../data/ditCatalog";
import {
  getTargetEctsForProfile,
  type AppLanguage,
  type UserProfile,
} from "../types/userProfile";
import {
  formatLocalizedScheduleSummary,
  getLocalizedProfileDisplayParts,
  getTranslations,
} from "../i18n/translations";

type PdfLanguage = "de" | "en" | "fr";

const TEAL_700: [number, number, number] = [15, 118, 110];
const TEAL_800: [number, number, number] = [17, 94, 89];
const TEAL_50: [number, number, number] = [240, 253, 250];
const TEAL_200: [number, number, number] = [153, 246, 228];

const SLATE_900: [number, number, number] = [15, 23, 42];
const SLATE_700: [number, number, number] = [51, 65, 85];
const SLATE_500: [number, number, number] = [100, 116, 139];
const SLATE_200: [number, number, number] = [226, 232, 240];
const SLATE_50: [number, number, number] = [248, 250, 252];

const RED_800: [number, number, number] = [153, 27, 27];
const RED_50: [number, number, number] = [254, 242, 242];

const ORANGE_700: [number, number, number] = [194, 65, 12];
const ORANGE_50: [number, number, number] = [255, 247, 237];

function resolvePdfLanguage(language?: AppLanguage): PdfLanguage {
  if (language === "de" || language === "fr" || language === "en") {
    return language;
  }
  // Built-in jsPDF Helvetica only supports Latin glyphs; export crisp English for fa/zh
  return "en";
}

function sanitizePdfText(input: string): string {
  return input
    .replace(/→/g, "->")
    .replace(/←/g, "<-")
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=")
    .replace(/•/g, "·")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(
      /[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF\u2013\u2014\u2018\u2019\u201C\u201D\u201E\u2022\u20AC]/g,
      ""
    )
    .trim();
}

const PDF_STRINGS: Record<
  PdfLanguage,
  {
    footerNote: string;
    pageOf: (page: number, total: number) => string;
    exportedAt: (ts: string) => string;
    profileUnset: string;
    profileSummary: (
      bachelor: string,
      track: string,
      semester: string,
      job: string,
      target: string
    ) => string;
    jobWorking: (h: number) => string;
    jobNone: string;
    timetableTitle: (shortLabel: string) => string;
    subtitle: (studySemesterLabel: string) => string;
    plannedLabel: string;
    conflictPrefix: (count: number) => string;
    weeklyGridHeading: string;
    until: string;
    conflictTag: string;
    timetableHead: [string, string, string, string, string, string];
    selectedModulesHeading: (count: number) => string;
    moduleTableHead: [string, string, string, string, string, string, string];
    timetableFilename: (slug: string) => string;
    examsTitle: (shortLabel: string) => string;
    progressHeading: string;
    metrics: {
      total: string;
      earned: string;
      planned: (shortLabel: string) => string;
      remaining: string;
    };
    examsTableHeading: (count: number) => string;
    examsTableHead: [string, string, string, string, string, string, string];
    notesHeading: string;
    noteMissing: (count: number) => string;
    noteMakeup: string;
    noteTip: string;
    examsFilename: (slug: string) => string;
    locale: string;
  }
> = {
  de: {
    footerNote:
      "Unverbindliche Planungshilfe (Dr. Raccoon · Master DIT) – aktuelle Termine, Räume und Fristen bitte in eCampus/HISPOS prüfen.",
    pageOf: (p, t) => `Seite ${p} von ${t}`,
    exportedAt: (ts) => `Exportiert am ${ts} Uhr`,
    profileUnset:
      "Studienprofil: Noch nicht hinterlegt (Standardziel: 30 ECTS)",
    profileSummary: (b, m, s, j, w) =>
      `Studienprofil: Bachelor ${b} | Profil ${m} | ${s} | ${j} | Ziel: ${w}`,
    jobWorking: (h) => `Werkstudent (${h}h/Wo.)`,
    jobNone: "Kein Nebenjob",
    timetableTitle: (shortLabel) => `Stundenplan · ${shortLabel}`,
    subtitle: (studySemesterLabel) =>
      `Master Digitale Innovation und Transformation (Universität Kassel, FB 07) · ${studySemesterLabel}`,
    plannedLabel: "Geplant",
    conflictPrefix: (c) => `Zeitkonflikt (${c})`,
    weeklyGridHeading: "Wochenraster (Montag – Freitag)",
    until: "bis",
    conflictTag: "[KONFLIKT] ",
    timetableHead: [
      "Zeit",
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
    ],
    selectedModulesHeading: (c) => `Gewählte Module im Detail (${c})`,
    moduleTableHead: [
      "Code",
      "Modultitel",
      "Bereich",
      "ECTS",
      "Sprache",
      "Termine & Räume",
      "Prüfungsform",
    ],
    timetableFilename: (slug) => `Stundenplan_${slug}.pdf`,
    examsTitle: (shortLabel) => `Prüfungen · ${shortLabel}`,
    progressHeading: "ECTS- & Studienfortschritt",
    metrics: {
      total: "Gesamtfortschritt",
      earned: "Bereits gesammelt",
      planned: (shortLabel) => `Geplant (${shortLabel})`,
      remaining: "Noch offen",
    },
    examsTableHeading: (c) => `Prüfungen der gewählten Module (${c})`,
    examsTableHead: [
      "Code",
      "Modul & Bereich",
      "ECTS",
      "Prüfungsform",
      "Prüfungstermin & Raum",
      "Lehrveranstaltung",
      "Status",
    ],
    notesHeading: "Hinweise zur Prüfungsplanung",
    noteMissing: (c) =>
      `• Bei ${c} ${
        c === 1 ? "Modul fehlt" : "Modulen fehlen"
      } noch Prüfungstermin oder Raum – bitte die verbindlichen Termine im eCampus/HISPOS nachtragen.`,
    noteMakeup:
      "• Auflagen (§ 6 FPO): Prüfungsanmeldung in der Regel manuell über das Prüfungsamt; Abschluss ist vor Anmeldung der Masterarbeit erforderlich.",
    noteTip:
      "• Tipp: Prüfungsanmeldefristen sowie etwaige Vorleistungen (S1/S2) frühzeitig zu Semesterbeginn kontrollieren.",
    examsFilename: (slug) => `Pruefungen_${slug}.pdf`,
    locale: "de-DE",
  },
  en: {
    footerNote:
      "Non-binding planning aid (Dr. Raccoon · Master DIT) – please verify official schedules, rooms, and deadlines in eCampus/HISPOS.",
    pageOf: (p, t) => `Page ${p} of ${t}`,
    exportedAt: (ts) => `Exported on ${ts}`,
    profileUnset: "Study Profile: Not configured yet (Default target: 30 ECTS)",
    profileSummary: (b, m, s, j, w) =>
      `Study Profile: Bachelor ${b} | Track ${m} | ${s} | ${j} | Target: ${w}`,
    jobWorking: (h) => `Working student (${h}h/wk)`,
    jobNone: "No part-time job",
    timetableTitle: (shortLabel) => `Timetable · ${shortLabel}`,
    subtitle: (studySemesterLabel) =>
      `Master Digitale Innovation und Transformation (Universität Kassel, FB 07) · ${studySemesterLabel}`,
    plannedLabel: "Planned",
    conflictPrefix: (c) => `Time conflict (${c})`,
    weeklyGridHeading: "Weekly Grid (Monday – Friday)",
    until: "to",
    conflictTag: "[CONFLICT] ",
    timetableHead: [
      "Time",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ],
    selectedModulesHeading: (c) => `Selected Modules in Detail (${c})`,
    moduleTableHead: [
      "Code",
      "Module Title",
      "Area",
      "ECTS",
      "Language",
      "Schedule & Rooms",
      "Exam Format",
    ],
    timetableFilename: (slug) => `Timetable_${slug}.pdf`,
    examsTitle: (shortLabel) => `Exams · ${shortLabel}`,
    progressHeading: "ECTS & Study Progress",
    metrics: {
      total: "Overall Progress",
      earned: "Earned",
      planned: (shortLabel) => `Planned (${shortLabel})`,
      remaining: "Remaining",
    },
    examsTableHeading: (c) => `Exams of Selected Modules (${c})`,
    examsTableHead: [
      "Code",
      "Module & Area",
      "ECTS",
      "Exam Format",
      "Exam Date & Room",
      "Course Schedule",
      "Status",
    ],
    notesHeading: "Exam Planning Notes",
    noteMissing: (c) =>
      `• ${c} ${
        c === 1 ? "module is" : "modules are"
      } still missing an exam date or room – please confirm official dates in eCampus/HISPOS.`,
    noteMakeup:
      "• Auflagen (§ 6 FPO): Registration is usually handled manually via the Prüfungsamt; completion is required before registering the Masterarbeit.",
    noteTip:
      "• Tip: Check exam registration deadlines and any preliminary coursework (S1/S2) early in the semester.",
    examsFilename: (slug) => `Exams_${slug}.pdf`,
    locale: "en-GB",
  },
  fr: {
    footerNote:
      "Aide à la planification non contractuelle (Dr. Raccoon · Master DIT) – veuillez vérifier les horaires, salles et délais dans eCampus/HISPOS.",
    pageOf: (p, t) => `Page ${p} sur ${t}`,
    exportedAt: (ts) => `Exporté le ${ts}`,
    profileUnset:
      "Profil d'études : non renseigné (objectif par défaut : 30 ECTS)",
    profileSummary: (b, m, s, j, w) =>
      `Profil : Bachelor ${b} | Profil ${m} | ${s} | ${j} | Objectif : ${w}`,
    jobWorking: (h) => `Werkstudent (${h}h/sem.)`,
    jobNone: "Sans emploi",
    timetableTitle: (shortLabel) => `Emploi du temps · ${shortLabel}`,
    subtitle: (studySemesterLabel) =>
      `Master Digitale Innovation und Transformation (Universität Kassel, FB 07) · ${studySemesterLabel}`,
    plannedLabel: "Planifiés",
    conflictPrefix: (c) => `Conflit horaire (${c})`,
    weeklyGridHeading: "Grille hebdomadaire (Lundi – Vendredi)",
    until: "à",
    conflictTag: "[CONFLIT] ",
    timetableHead: [
      "Heure",
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
    ],
    selectedModulesHeading: (c) => `Détail des modules sélectionnés (${c})`,
    moduleTableHead: [
      "Code",
      "Intitulé du module",
      "Domaine",
      "ECTS",
      "Langue",
      "Horaires & Salles",
      "Format d'examen",
    ],
    timetableFilename: (slug) => `Emploi_du_temps_${slug}.pdf`,
    examsTitle: (shortLabel) => `Examens · ${shortLabel}`,
    progressHeading: "Progression ECTS & d'études",
    metrics: {
      total: "Progression totale",
      earned: "Acquis",
      planned: (shortLabel) => `Planifiés (${shortLabel})`,
      remaining: "Restants",
    },
    examsTableHeading: (c) => `Examens des modules sélectionnés (${c})`,
    examsTableHead: [
      "Code",
      "Module & Domaine",
      "ECTS",
      "Format d'examen",
      "Date & Salle",
      "Cours",
      "Statut",
    ],
    notesHeading: "Remarques sur les examens",
    noteMissing: (c) =>
      `• ${c} ${
        c === 1 ? "module n'a pas encore" : "modules n'ont pas encore"
      } de date ou de salle d'examen – veuillez vérifier dans eCampus/HISPOS.`,
    noteMakeup:
      "• Auflagen (§ 6 FPO) : inscription généralement manuelle via le Prüfungsamt ; validation requise avant l'inscription au Masterarbeit.",
    noteTip:
      "• Conseil : vérifiez tôt les délais d'inscription aux examens et les prérequis (S1/S2).",
    examsFilename: (slug) => `Examens_${slug}.pdf`,
    locale: "fr-FR",
  },
};

function formatExportTimestamp(locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function formatProfileLine(
  userProfile: UserProfile | null,
  pdfLang: PdfLanguage
): string {
  const s = PDF_STRINGS[pdfLang];
  if (!userProfile) {
    return s.profileUnset;
  }
  const parts = getLocalizedProfileDisplayParts(userProfile, pdfLang);
  const jobText = userProfile.hasPartTimeJob
    ? s.jobWorking(userProfile.jobHoursPerWeek)
    : s.jobNone;
  return sanitizePdfText(
    s.profileSummary(
      parts.bachelorOpt.chipLabel,
      parts.masterOpt.shortLabel,
      parts.semesterOpt.label,
      jobText,
      parts.workloadOpt.chipLabel
    )
  );
}

function getSemesterFileSlug(semesterId: SemesterId): string {
  return semesterId === "wise2627" ? "WiSe_2026-27" : "SoSe_2027";
}

function addDocumentFooters(doc: jsPDF, pdfLang: PdfLanguage): void {
  const s = PDF_STRINGS[pdfLang];
  const totalPages = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);
    doc.setDrawColor(...SLATE_200);
    doc.setLineWidth(0.25);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...SLATE_500);
    doc.text(sanitizePdfText(s.footerNote), margin, pageHeight - 7.5);
    doc.text(
      sanitizePdfText(s.pageOf(page, totalPages)),
      pageWidth - margin,
      pageHeight - 7.5,
      { align: "right" }
    );
  }
}

export interface ExportTimetablePdfParams {
  activeSemester: SemesterId;
  selectedModules: DitModule[];
  userProfile: UserProfile | null;
  language?: AppLanguage;
}

export function exportTimetablePdf({
  activeSemester,
  selectedModules,
  userProfile,
  language,
}: ExportTimetablePdfParams): void {
  if (selectedModules.length === 0) return;

  const pdfLang = resolvePdfLanguage(language ?? userProfile?.language);
  const s = PDF_STRINGS[pdfLang];
  const tr = getTranslations(pdfLang);
  const semesterInfo = tr.catalog.semesters[activeSemester];

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const targetEcts = getTargetEctsForProfile(userProfile);

  const regularCp = selectedModules
    .filter((m) => m.area !== "Auflagen")
    .reduce((sum, m) => sum + m.cp, 0);
  const makeupCp = selectedModules
    .filter((m) => m.area === "Auflagen")
    .reduce((sum, m) => sum + m.cp, 0);
  const conflicts = detectScheduleConflicts(selectedModules);

  // Header
  doc.setFillColor(...TEAL_700);
  doc.rect(margin, 12, 3, 12, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...TEAL_800);
  doc.text(
    sanitizePdfText(s.timetableTitle(semesterInfo.shortLabel)),
    margin + 6,
    17
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...SLATE_700);
  doc.text(
    sanitizePdfText(s.subtitle(semesterInfo.studySemesterLabel)),
    margin + 6,
    22.5
  );

  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE_500);
  doc.text(
    sanitizePdfText(s.exportedAt(formatExportTimestamp(s.locale))),
    pageWidth - margin,
    17,
    { align: "right" }
  );

  // Summary Box
  let cursorY = 27.5;
  const summaryBoxHeight = conflicts.length > 0 ? 18 : 13.5;
  doc.setFillColor(...SLATE_50);
  doc.setDrawColor(...SLATE_200);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, cursorY, contentWidth, summaryBoxHeight, 2, 2, "FD");

  const moduleNoun =
    selectedModules.length === 1
      ? tr.exams.moduleSingular
      : tr.exams.modulePlural;
  const ectsSummary = `${s.plannedLabel}: ${regularCp} / ${targetEcts} ECTS${
    makeupCp > 0 ? ` (+${makeupCp} ECTS Auflagen)` : ""
  } · ${selectedModules.length} ${moduleNoun}`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_900);
  doc.text(sanitizePdfText(ectsSummary), margin + 3.5, cursorY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE_700);
  doc.text(formatProfileLine(userProfile, pdfLang), margin + 3.5, cursorY + 10);

  if (conflicts.length > 0) {
    const conflictSummary = conflicts
      .map(
        (c) =>
          `${tr.catalog.weekdays[c.day]} ${c.timeRangeLabel} (${c.modules
            .map((m) => m.code)
            .join(" / ")})`
      )
      .join(" · ");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...RED_800);
    doc.text(
      sanitizePdfText(
        `${s.conflictPrefix(conflicts.length)}: ${conflictSummary}`
      ),
      margin + 3.5,
      cursorY + 15
    );
  }

  cursorY += summaryBoxHeight + 5;

  // Weekly Timetable Grid (Mo-Fr)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...TEAL_800);
  doc.text(sanitizePdfText(s.weeklyGridHeading), margin, cursorY);
  cursorY += 2.5;

  const hoursSet = new Set<number>(TIME_BLOCKS);
  for (const mod of selectedModules) {
    for (const slot of getActiveScheduleSlots(mod)) {
      hoursSet.add(getTimetableBlockHour(slot));
    }
  }
  const timetableHours = Array.from(hoursSet).sort((a, b) => a - b);

  const conflictCellMap = new Map<string, boolean>();
  const timetableBody: RowInput[] = timetableHours.map((hour, rowIndex) => {
    const timeLabel = `${String(hour).padStart(2, "0")}:00\n${s.until} ${String(
      hour + 2
    ).padStart(2, "0")}:00`;

    const dayCells = WEEKDAYS.map((day, dayIdx) => {
      const cellEntries = selectedModules
        .flatMap((mod) =>
          getActiveScheduleSlots(mod)
            .filter((sl) => sl.day === day && getTimetableBlockHour(sl) === hour)
            .map((slot) => {
              const range = getSlotTimeRange(slot);
              const hasConflict = selectedModules.some(
                (other) =>
                  other.id !== mod.id &&
                  getActiveScheduleSlots(other).some((otherSlot) =>
                    doSlotsOverlap(slot, otherSlot)
                  )
              );
              return { mod, slot, range, hasConflict };
            })
        )
        .sort((a, b) => a.range.startMin - b.range.startMin);

      if (cellEntries.some((e) => e.hasConflict)) {
        conflictCellMap.set(`${rowIndex}-${dayIdx + 1}`, true);
      }

      if (cellEntries.length === 0) return "";

      return cellEntries
        .map(({ mod, slot, range, hasConflict }) => {
          const prefix = hasConflict ? s.conflictTag : "";
          const typeLabel =
            tr.catalog.sessionTypes[slot.sessionType] ?? slot.sessionType;
          const roomLabel =
            slot.room === "Raum fehlt" ? tr.catalog.noRoom : slot.room;
          return sanitizePdfText(
            `${prefix}${mod.code} (${typeLabel})\n${mod.title}\n${range.startStr}–${range.endStr} · ${roomLabel}`
          );
        })
        .join("\n\n");
    });

    return [timeLabel, ...dayCells];
  });

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin, bottom: 16 },
    head: [s.timetableHead],
    body: timetableBody,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: 2,
      textColor: SLATE_900,
      lineColor: SLATE_200,
      lineWidth: 0.25,
      valign: "top",
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: TEAL_700,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      valign: "middle",
    },
    columnStyles: {
      0: {
        cellWidth: 22,
        fillColor: SLATE_50,
        textColor: SLATE_700,
        fontStyle: "bold",
      },
      1: { cellWidth: 49.4 },
      2: { cellWidth: 49.4 },
      3: { cellWidth: 49.4 },
      4: { cellWidth: 49.4 },
      5: { cellWidth: 49.4 },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index > 0) {
        if (conflictCellMap.get(`${data.row.index}-${data.column.index}`)) {
          data.cell.styles.fillColor = RED_50;
          data.cell.styles.textColor = RED_800;
        }
      }
    },
  });

  const lastTableY =
    (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable
      ?.finalY ?? cursorY + 40;
  let listStartY = lastTableY + 8;
  const pageHeight = doc.internal.pageSize.getHeight();
  if (listStartY > pageHeight - 38) {
    doc.addPage();
    listStartY = 16;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...TEAL_800);
  doc.text(
    sanitizePdfText(s.selectedModulesHeading(selectedModules.length)),
    margin,
    listStartY
  );

  const moduleRows: RowInput[] = selectedModules.map((mod) => [
    sanitizePdfText(mod.code),
    sanitizePdfText(mod.title),
    sanitizePdfText(tr.catalog.areas[mod.area]),
    `${mod.cp} ECTS`,
    sanitizePdfText(tr.catalog.teachingLanguages[mod.language] ?? mod.language),
    sanitizePdfText(formatLocalizedScheduleSummary(mod, pdfLang)),
    sanitizePdfText(mod.examType),
  ]);

  autoTable(doc, {
    startY: listStartY + 2.5,
    margin: { left: margin, right: margin, bottom: 16 },
    showHead: "everyPage",
    head: [s.moduleTableHead],
    body: moduleRows,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2.2,
      textColor: SLATE_900,
      lineColor: SLATE_200,
      lineWidth: 0.25,
      valign: "top",
    },
    headStyles: {
      fillColor: TEAL_800,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: SLATE_50,
    },
    columnStyles: {
      0: { cellWidth: 23, fontStyle: "bold", textColor: TEAL_800 },
      1: { cellWidth: 58 },
      2: { cellWidth: 38 },
      3: { cellWidth: 16, halign: "center" },
      4: { cellWidth: 25 },
      5: { cellWidth: 59 },
      6: { cellWidth: 50 },
    },
  });

  addDocumentFooters(doc, pdfLang);
  doc.save(s.timetableFilename(getSemesterFileSlug(activeSemester)));
}

export interface ExportExamsPdfParams {
  activeSemester: SemesterId;
  selectedModules: DitModule[];
  completedMakeupIds: string[];
  wiseCompletedCp: number;
  currentSemesterRegularCp: number;
  totalMasterCp: number;
  targetSemesterEcts: number;
  userProfile: UserProfile | null;
  language?: AppLanguage;
}

export function exportExamsPdf({
  activeSemester,
  selectedModules,
  completedMakeupIds,
  wiseCompletedCp,
  currentSemesterRegularCp,
  totalMasterCp,
  targetSemesterEcts,
  userProfile,
  language,
}: ExportExamsPdfParams): void {
  if (selectedModules.length === 0) return;

  const pdfLang = resolvePdfLanguage(language ?? userProfile?.language);
  const s = PDF_STRINGS[pdfLang];
  const tr = getTranslations(pdfLang);
  const semesterInfo = tr.catalog.semesters[activeSemester];

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const masterProgressPct = Math.min(
    100,
    Math.round((totalMasterCp / 120) * 100)
  );
  const semesterProgressPct = Math.min(
    100,
    Math.round((currentSemesterRegularCp / targetSemesterEcts) * 100)
  );
  const openMasterCp = Math.max(0, 120 - totalMasterCp);

  // Header
  doc.setFillColor(...TEAL_700);
  doc.rect(margin, 12, 3, 12, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...TEAL_800);
  doc.text(
    sanitizePdfText(s.examsTitle(semesterInfo.shortLabel)),
    margin + 6,
    17
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_700);
  doc.text(
    sanitizePdfText(s.subtitle(semesterInfo.studySemesterLabel)),
    margin + 6,
    22.5
  );

  doc.setFontSize(8);
  doc.setTextColor(...SLATE_500);
  doc.text(
    sanitizePdfText(s.exportedAt(formatExportTimestamp(s.locale))),
    pageWidth - margin,
    17,
    { align: "right" }
  );

  // Profile line
  let cursorY = 27.5;
  doc.setFillColor(...SLATE_50);
  doc.setDrawColor(...SLATE_200);
  doc.setLineWidth(0.25);
  doc.roundedRect(margin, cursorY, contentWidth, 8.5, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...SLATE_700);
  doc.text(
    formatProfileLine(userProfile, pdfLang),
    margin + 3,
    cursorY + 5.5
  );

  cursorY += 12.5;

  // 4 ECTS-Tracker Metric Cards
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...TEAL_800);
  doc.text(sanitizePdfText(s.progressHeading), margin, cursorY);
  cursorY += 3;

  const cardGap = 3;
  const cardWidth = (contentWidth - cardGap * 3) / 4;
  const cardHeight = 15.5;

  const metrics: Array<{
    label: string;
    value: string;
    highlight?: boolean;
  }> = [
    {
      label: s.metrics.total,
      value: `${totalMasterCp} / 120 ECTS (${masterProgressPct}%)`,
    },
    {
      label: s.metrics.earned,
      value: `${wiseCompletedCp} ECTS`,
    },
    {
      label: s.metrics.planned(semesterInfo.shortLabel),
      value: `${currentSemesterRegularCp} / ${targetSemesterEcts} ECTS (${semesterProgressPct}%)`,
      highlight: true,
    },
    {
      label: s.metrics.remaining,
      value: `${openMasterCp} ECTS`,
    },
  ];

  metrics.forEach((metric, index) => {
    const x = margin + index * (cardWidth + cardGap);
    if (metric.highlight) {
      doc.setFillColor(...TEAL_50);
      doc.setDrawColor(...TEAL_200);
    } else {
      doc.setFillColor(...SLATE_50);
      doc.setDrawColor(...SLATE_200);
    }
    doc.setLineWidth(0.3);
    doc.roundedRect(x, cursorY, cardWidth, cardHeight, 1.8, 1.8, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...(metric.highlight ? TEAL_800 : SLATE_500));
    doc.text(sanitizePdfText(metric.label), x + 2.5, cursorY + 5.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...(metric.highlight ? TEAL_800 : SLATE_900));
    doc.text(sanitizePdfText(metric.value), x + 2.5, cursorY + 11.5);
  });

  cursorY += cardHeight + 7;

  // Selected Modules Exam Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...TEAL_800);
  doc.text(
    sanitizePdfText(s.examsTableHeading(selectedModules.length)),
    margin,
    cursorY
  );
  cursorY += 2.5;

  const checkboxRows = new Set<number>();
  const makeupStatusMap = new Map<number, boolean>();

  const examRows: RowInput[] = selectedModules.map((mod, idx) => {
    const isMakeup = mod.area === "Auflagen";
    const isDone = isMakeup && completedMakeupIds.includes(mod.id);
    if (isMakeup) {
      makeupStatusMap.set(idx, isDone);
    } else {
      checkboxRows.add(idx);
    }

    const examDateRoom =
      mod.customExamDateRoom?.trim() || tr.exams.missingDateRoom;
    const courseTimeRoom = formatLocalizedScheduleSummary(mod, pdfLang);

    return [
      sanitizePdfText(mod.code),
      sanitizePdfText(`${mod.title}\n(${tr.catalog.areas[mod.area]})`),
      `${mod.cp}`,
      sanitizePdfText(mod.examType),
      sanitizePdfText(examDateRoom),
      sanitizePdfText(courseTimeRoom),
      isMakeup
        ? isDone
          ? tr.exams.makeupDone
          : tr.exams.makeupOpen
        : "",
    ];
  });

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin, bottom: 16 },
    showHead: "everyPage",
    head: [s.examsTableHead],
    body: examRows,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 7.8,
      cellPadding: 2.2,
      textColor: SLATE_900,
      lineColor: SLATE_200,
      lineWidth: 0.25,
      valign: "top",
    },
    headStyles: {
      fillColor: TEAL_700,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      valign: "middle",
    },
    alternateRowStyles: {
      fillColor: SLATE_50,
    },
    columnStyles: {
      0: { cellWidth: 19, fontStyle: "bold", textColor: TEAL_800 },
      1: { cellWidth: 42 },
      2: { cellWidth: 11, halign: "center" },
      3: { cellWidth: 33 },
      4: { cellWidth: 30 },
      5: { cellWidth: 31 },
      6: { cellWidth: 16, halign: "center", valign: "middle" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 6) {
        const isMakeupDone = makeupStatusMap.get(data.row.index);
        if (isMakeupDone === true) {
          data.cell.styles.textColor = TEAL_800;
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = TEAL_50;
        } else if (isMakeupDone === false) {
          data.cell.styles.textColor = ORANGE_700;
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = ORANGE_50;
        }
      }
      if (data.section === "body" && data.column.index === 4) {
        const text = String(data.cell.raw ?? "");
        if (text === tr.exams.missingDateRoom) {
          data.cell.styles.textColor = SLATE_500;
        }
      }
    },
    didDrawCell: (data) => {
      if (
        data.section === "body" &&
        data.column.index === 6 &&
        checkboxRows.has(data.row.index)
      ) {
        const boxSize = 3.2;
        const boxX = data.cell.x + (data.cell.width - boxSize) / 2;
        const boxY =
          data.cell.y + Math.min(4.2, (data.cell.height - boxSize) / 2);
        doc.setDrawColor(...SLATE_500);
        doc.setLineWidth(0.3);
        doc.rect(boxX, boxY, boxSize, boxSize, "S");
      }
    },
  });

  const missingExamDatesCount = selectedModules.filter(
    (m) => !m.customExamDateRoom?.trim()
  ).length;
  const hasMakeupModules = selectedModules.some((m) => m.area === "Auflagen");

  const notes: string[] = [];
  if (missingExamDatesCount > 0) {
    notes.push(s.noteMissing(missingExamDatesCount));
  }
  if (hasMakeupModules) {
    notes.push(s.noteMakeup);
  }
  notes.push(s.noteTip);

  const wrappedNotes = notes.map(
    (line) =>
      doc.splitTextToSize(sanitizePdfText(line), contentWidth - 7) as string[]
  );
  const totalNoteLines = wrappedNotes.reduce(
    (sum, lines) => sum + lines.length,
    0
  );

  const lastTableY =
    (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable
      ?.finalY ?? cursorY + 30;
  let notesY = lastTableY + 6;
  const pageHeight = doc.internal.pageSize.getHeight();
  const lineHeightMm = 4.2;
  const notesBoxHeight = 9 + totalNoteLines * lineHeightMm;

  if (notesY + notesBoxHeight > pageHeight - 16) {
    doc.addPage();
    notesY = 16;
  }

  doc.setFillColor(...SLATE_50);
  doc.setDrawColor(...SLATE_200);
  doc.setLineWidth(0.25);
  doc.roundedRect(margin, notesY, contentWidth, notesBoxHeight, 1.8, 1.8, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE_900);
  doc.text(sanitizePdfText(s.notesHeading), margin + 3.5, notesY + 5.2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(...SLATE_700);
  let noteLineY = notesY + 10;
  wrappedNotes.forEach((lines) => {
    doc.text(lines, margin + 3.5, noteLineY);
    noteLineY += lines.length * lineHeightMm;
  });

  addDocumentFooters(doc, pdfLang);
  doc.save(s.examsFilename(getSemesterFileSlug(activeSemester)));
}
