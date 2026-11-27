import { jsPDF } from "jspdf";
import autoTable, { type RowInput } from "jspdf-autotable";
import {
  SEMESTER_INFOS,
  TIME_BLOCKS,
  WEEKDAYS,
  detectScheduleConflicts,
  doSlotsOverlap,
  formatModuleScheduleSummary,
  getActiveScheduleSlots,
  getSlotTimeRange,
  getTimetableBlockHour,
  type DitModule,
  type SemesterId,
} from "../data/ditCatalog";
import {
  getProfileDisplayParts,
  getTargetEctsForProfile,
  type UserProfile,
} from "../types/userProfile";

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
const RED_200: [number, number, number] = [254, 202, 202];

const ORANGE_700: [number, number, number] = [194, 65, 12];
const ORANGE_50: [number, number, number] = [255, 247, 237];

function sanitizePdfText(input: string): string {
  return input
    .replace(/→/g, "->")
    .replace(/←/g, "<-")
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=")
    .replace(/•/g, "·")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF\u2013\u2014\u2018\u2019\u201C\u201D\u201E\u2022\u20AC]/g, "")
    .trim();
}

function formatExportTimestamp(): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function formatProfileLine(userProfile: UserProfile | null): string {
  if (!userProfile) {
    return "Studienprofil: Noch nicht hinterlegt (Standardziel: 30 ECTS)";
  }
  const parts = getProfileDisplayParts(userProfile);
  const jobText = userProfile.hasPartTimeJob
    ? `Werkstudent (${userProfile.jobHoursPerWeek}h/Wo.)`
    : "Kein Nebenjob";
  return sanitizePdfText(
    `Studienprofil: Bachelor ${parts.bachelorOpt.chipLabel} | Profil ${parts.masterOpt.shortLabel} | ${parts.semesterOpt.label} | ${jobText} | Ziel: ${parts.workloadOpt.chipLabel}`
  );
}

function getSemesterFileSlug(semesterId: SemesterId): string {
  return semesterId === "wise2627" ? "WiSe_2026-27" : "SoSe_2027";
}

function addDocumentFooters(doc: jsPDF): void {
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
    doc.text(
      "Unverbindliche Planungshilfe (Dr. Raccoon · Master DIT) – aktuelle Termine, Räume und Fristen bitte in eCampus/HISPOS prüfen.",
      margin,
      pageHeight - 7.5
    );
    doc.text(
      `Seite ${page} von ${totalPages}`,
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
}

export function exportTimetablePdf({
  activeSemester,
  selectedModules,
  userProfile,
}: ExportTimetablePdfParams): void {
  if (selectedModules.length === 0) return;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 269
  const semesterInfo = SEMESTER_INFOS[activeSemester];
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
    sanitizePdfText(`Stundenplan · ${semesterInfo.shortLabel}`),
    margin + 6,
    17
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...SLATE_700);
  doc.text(
    sanitizePdfText(
      `Master Digitale Innovation und Transformation (Universität Kassel, FB 07) · ${semesterInfo.studySemesterLabel}`
    ),
    margin + 6,
    22.5
  );

  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE_500);
  doc.text(
    `Exportiert am ${formatExportTimestamp()} Uhr`,
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

  const ectsSummary = `Geplant: ${regularCp} / ${targetEcts} ECTS${
    makeupCp > 0 ? ` (+${makeupCp} ECTS Auflagen)` : ""
  } · ${selectedModules.length} ${
    selectedModules.length === 1 ? "Modul" : "Module"
  }`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_900);
  doc.text(sanitizePdfText(ectsSummary), margin + 3.5, cursorY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE_700);
  doc.text(formatProfileLine(userProfile), margin + 3.5, cursorY + 10);

  if (conflicts.length > 0) {
    const conflictSummary = conflicts
      .map(
        (c) =>
          `${c.day} ${c.timeRangeLabel} (${c.modules
            .map((m) => m.code)
            .join(" / ")})`
      )
      .join(" · ");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...RED_800);
    doc.text(
      sanitizePdfText(
        `Zeitkonflikt (${conflicts.length}): ${conflictSummary}`
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
  doc.text("Wochenraster (Montag – Freitag)", margin, cursorY);
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
    const timeLabel = `${String(hour).padStart(2, "0")}:00\nbis ${String(
      hour + 2
    ).padStart(2, "0")}:00`;

    const dayCells = WEEKDAYS.map((day, dayIdx) => {
      const cellEntries = selectedModules
        .flatMap((mod) =>
          getActiveScheduleSlots(mod)
            .filter(
              (s) => s.day === day && getTimetableBlockHour(s) === hour
            )
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
          const prefix = hasConflict ? "[KONFLIKT] " : "";
          return sanitizePdfText(
            `${prefix}${mod.code} (${slot.sessionType})\n${mod.title}\n${range.startStr}–${range.endStr} · ${slot.room}`
          );
        })
        .join("\n\n");
    });

    return [timeLabel, ...dayCells];
  });

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin, bottom: 16 },
    head: [["Zeit", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"]],
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

  // Detailed Module List (including modules without weekly slots)
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
    `Gewählte Module im Detail (${selectedModules.length})`,
    margin,
    listStartY
  );

  const moduleRows: RowInput[] = selectedModules.map((mod) => [
    sanitizePdfText(mod.code),
    sanitizePdfText(mod.title),
    sanitizePdfText(mod.area),
    `${mod.cp} ECTS`,
    sanitizePdfText(mod.language),
    sanitizePdfText(formatModuleScheduleSummary(mod)),
    sanitizePdfText(mod.examType),
  ]);

  autoTable(doc, {
    startY: listStartY + 2.5,
    margin: { left: margin, right: margin, bottom: 16 },
    showHead: "everyPage",
    head: [
      [
        "Code",
        "Modultitel",
        "Bereich",
        "ECTS",
        "Sprache",
        "Termine & Räume",
        "Prüfungsform",
      ],
    ],
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

  addDocumentFooters(doc);
  doc.save(`Stundenplan_${getSemesterFileSlug(activeSemester)}.pdf`);
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
}: ExportExamsPdfParams): void {
  if (selectedModules.length === 0) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182
  const semesterInfo = SEMESTER_INFOS[activeSemester];

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
    sanitizePdfText(`Prüfungsübersicht · ${semesterInfo.shortLabel}`),
    margin + 6,
    17
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_700);
  doc.text(
    sanitizePdfText(
      `Master Digitale Innovation und Transformation (Universität Kassel, FB 07) · ${semesterInfo.studySemesterLabel}`
    ),
    margin + 6,
    22.5
  );

  doc.setFontSize(8);
  doc.setTextColor(...SLATE_500);
  doc.text(
    `Exportiert am ${formatExportTimestamp()} Uhr`,
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
  doc.text(formatProfileLine(userProfile), margin + 3, cursorY + 5.5);

  cursorY += 12.5;

  // 4 ECTS-Tracker Metric Cards
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...TEAL_800);
  doc.text("ECTS- & Studienfortschritt", margin, cursorY);
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
      label: "Gesamtfortschritt",
      value: `${totalMasterCp} / 120 ECTS (${masterProgressPct}%)`,
    },
    {
      label: "Bereits gesammelt",
      value: `${wiseCompletedCp} ECTS`,
    },
    {
      label: `Geplant (${semesterInfo.shortLabel})`,
      value: `${currentSemesterRegularCp} / ${targetSemesterEcts} ECTS (${semesterProgressPct}%)`,
      highlight: true,
    },
    {
      label: "Noch offen",
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
    `Prüfungen der gewählten Module (${selectedModules.length})`,
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

    const examDateRoom = mod.customExamDateRoom?.trim() || "Zeit/Raum fehlt";
    const courseTimeRoom = formatModuleScheduleSummary(mod);

    return [
      sanitizePdfText(mod.code),
      sanitizePdfText(`${mod.title}\n(${mod.area})`),
      `${mod.cp}`,
      sanitizePdfText(mod.examType),
      sanitizePdfText(examDateRoom),
      sanitizePdfText(courseTimeRoom),
      isMakeup ? (isDone ? "Bestanden" : "Offen") : "",
    ];
  });

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin, bottom: 16 },
    showHead: "everyPage",
    head: [
      [
        "Code",
        "Modul & Bereich",
        "ECTS",
        "Prüfungsform",
        "Prüfungstermin & Raum",
        "Lehrveranstaltung",
        "Status",
      ],
    ],
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
        if (text === "Zeit/Raum fehlt") {
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
        const boxY = data.cell.y + Math.min(4.2, (data.cell.height - boxSize) / 2);
        doc.setDrawColor(...SLATE_500);
        doc.setLineWidth(0.3);
        doc.rect(boxX, boxY, boxSize, boxSize, "S");
      }
    },
  });

  // Notes section below table
  const missingExamDatesCount = selectedModules.filter(
    (m) => !m.customExamDateRoom?.trim()
  ).length;
  const hasMakeupModules = selectedModules.some((m) => m.area === "Auflagen");

  const notes: string[] = [];
  if (missingExamDatesCount > 0) {
    notes.push(
      `• Bei ${missingExamDatesCount} ${
        missingExamDatesCount === 1 ? "Modul fehlt" : "Modulen fehlen"
      } noch Prüfungstermin oder Raum – bitte die verbindlichen Termine im eCampus/HISPOS nachtragen.`
    );
  }
  if (hasMakeupModules) {
    notes.push(
      "• Auflagen (§ 6 FPO): Prüfungsanmeldung in der Regel manuell über das Prüfungsamt; Abschluss ist vor Anmeldung der Masterarbeit erforderlich."
    );
  }
  notes.push(
    "• Tipp: Prüfungsanmeldefristen sowie etwaige Vorleistungen (S1/S2) frühzeitig zu Semesterbeginn kontrollieren."
  );

  const wrappedNotes = notes.map((line) =>
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
  doc.text("Hinweise zur Prüfungsplanung", margin + 3.5, notesY + 5.2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(...SLATE_700);
  let noteLineY = notesY + 10;
  wrappedNotes.forEach((lines) => {
    doc.text(lines, margin + 3.5, noteLineY);
    noteLineY += lines.length * lineHeightMm;
  });

  addDocumentFooters(doc);
  doc.save(`Pruefungsuebersicht_${getSemesterFileSlug(activeSemester)}.pdf`);
}
