import React, { useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Info,
  Lock,
  Square,
} from "lucide-react";
import {
  SEMESTER_INFOS,
  formatModuleScheduleSummary,
  type DitModule,
  type SemesterId,
} from "../data/ditCatalog";

interface ExamsPanelProps {
  activeSemester: SemesterId;
  allModules: DitModule[];
  selectedModuleIds: string[];
  completedMakeupIds: string[];
  onToggleCompletedMakeup: (moduleId: string) => void;
  wiseCompletedCp: number;
  currentSemesterRegularCp: number;
  totalMasterCp: number;
  targetSemesterEcts?: number;
  lastExamFinished: boolean;
  onToggleLastExamFinished: () => void;
  onJumpToNextSemester: () => void;
  onJumpToCurrentSemester: () => void;
  onGoToTimetable: () => void;
}

function getModuleCourseTimeRoom(mod: DitModule): string {
  return formatModuleScheduleSummary(mod);
}

export const ExamsPanel: React.FC<ExamsPanelProps> = ({
  activeSemester,
  allModules,
  selectedModuleIds,
  completedMakeupIds,
  onToggleCompletedMakeup,
  wiseCompletedCp,
  currentSemesterRegularCp,
  totalMasterCp,
  targetSemesterEcts = 30,
  lastExamFinished,
  onToggleLastExamFinished,
  onJumpToNextSemester,
  onJumpToCurrentSemester,
  onGoToTimetable,
}) => {
  const semesterInfo = SEMESTER_INFOS[activeSemester];

  const selectedModules = useMemo(
    () =>
      allModules.filter(
        (m) =>
          (m.semester === activeSemester ||
            m.semester === "alle" ||
            m.area === "Auflagen") &&
          selectedModuleIds.includes(m.id)
      ),
    [allModules, activeSemester, selectedModuleIds]
  );

  const masterProgressPct = Math.min(
    100,
    Math.round((totalMasterCp / 120) * 100)
  );
  const semesterProgressPct = Math.min(
    100,
    Math.round((currentSemesterRegularCp / targetSemesterEcts) * 100)
  );

  return (
    <div className="space-y-6">
      {/* 1. ECTS-Tracker (Top of Prüfungen) */}
      <section
        aria-label="ECTS-Tracker"
        className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5"
      >
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h2 className="text-base font-bold tracking-tight text-teal-800">
              ECTS-Tracker
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Digital Innovation &amp; Transformation · Universität Kassel (FB 07) ·{" "}
              {semesterInfo.studySemesterLabel}
            </p>
          </div>
          <div className="text-left sm:text-right shrink-0 tabular-nums">
            <span className="font-mono text-sm font-bold text-teal-800">
              {totalMasterCp} / 120 ECTS
            </span>{" "}
            <span className="text-xs text-slate-500">
              ({masterProgressPct}%)
            </span>
          </div>
        </div>

        <div
          className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex"
          role="progressbar"
          aria-valuenow={totalMasterCp}
          aria-valuemin={0}
          aria-valuemax={120}
          aria-label="Fortschritt im Master DIT in ECTS"
        >
          <div
            className="h-full bg-teal-700 transition-all duration-300"
            style={{ width: `${masterProgressPct}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2.5 text-xs tabular-nums">
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
            <div className="text-slate-500 truncate">Gesammelt</div>
            <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
              {wiseCompletedCp} ECTS
            </div>
          </div>
          <div className="rounded-lg border border-teal-200 bg-teal-50/50 px-3 py-2">
            <div className="text-teal-800 font-medium truncate">
              Geplant ({semesterInfo.shortLabel})
            </div>
            <div className="font-mono text-sm font-bold text-teal-900 mt-0.5">
              {currentSemesterRegularCp} / {targetSemesterEcts} ECTS{" "}
              <span className="font-sans font-normal text-[11px] text-teal-700">
                ({semesterProgressPct}%)
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
            <div className="text-slate-500 truncate">Noch offen</div>
            <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
              {Math.max(0, 120 - totalMasterCp)} ECTS
            </div>
          </div>
        </div>

        {/* Current Semester Notice & Semester Switch */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-start gap-2 text-slate-600">
            <Info className="w-4 h-4 text-[#ff8000] shrink-0 mt-0.5" />
            <span>
              {activeSemester === "wise2627" ? (
                <>
                  <strong className="text-[#ff8000]">Aktuelles Semester:</strong>{" "}
                  Alle Angaben gelten für das{" "}
                  <strong>Wintersemester 2026/27</strong>.
                </>
              ) : (
                <>
                  <strong className="text-teal-900">Nächstes Semester:</strong>{" "}
                  Planung für <strong>Sommersemester 2027</strong> (
                  {wiseCompletedCp} ECTS aus WiSe übernommen).
                </>
              )}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {activeSemester === "wise2627" ? (
              <>
                <button
                  type="button"
                  onClick={onToggleLastExamFinished}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-medium transition-colors whitespace-nowrap ${
                    lastExamFinished
                      ? "bg-teal-50 text-teal-900 border-teal-300"
                      : "bg-white text-slate-700 border-slate-300 hover:border-teal-600 hover:text-teal-800"
                  }`}
                >
                  {lastExamFinished ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                      <span>Letzte Prüfung beendet</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5 text-slate-400" />
                      <span>Prüfungsende bestätigen</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={!lastExamFinished}
                  onClick={onJumpToNextSemester}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    lastExamFinished
                      ? "bg-teal-700 hover:bg-teal-800 text-white"
                      : "bg-slate-200 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {!lastExamFinished && <Lock className="w-3.5 h-3.5" />}
                  <span>SoSe 2027</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onJumpToCurrentSemester}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors whitespace-nowrap"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Zurück zu WiSe 2026/27</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. Selected Modules Exam Overview ONLY */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-teal-800">
              Prüfungen der gewählten Module ({semesterInfo.shortLabel})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Es werden ausschließlich deine im Stundenplan ausgewählten Module angezeigt.
            </p>
          </div>
          <span className="text-xs text-slate-500 tabular-nums">
            {selectedModules.length}{" "}
            {selectedModules.length === 1 ? "Modul" : "Module"}
          </span>
        </div>

        {selectedModules.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50/70">
            <p className="text-sm font-medium text-slate-800 mb-1">
              Keine Module im Stundenplan ausgewählt
            </p>
            <p className="text-xs text-slate-500 mb-3">
              Wähle im Tab „Stundenplan“ Module aus, um ihre Prüfungsinfos zu sehen.
            </p>
            <button
              type="button"
              onClick={onGoToTimetable}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Zum Stundenplan</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white">
            {selectedModules.map((mod) => {
              const isMakeup = mod.area === "Auflagen";
              const isMakeupDone = completedMakeupIds.includes(mod.id);
              const courseTimeRoom = getModuleCourseTimeRoom(mod);
              const examDateRoom = mod.customExamDateRoom || "Zeit/Raum fehlt";

              return (
                <div
                  key={mod.id}
                  className="px-4 py-3.5 space-y-2 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-baseline gap-2 min-w-0">
                      <span
                        className={`font-mono text-xs font-semibold ${
                          isMakeup ? "text-[#ff8000]" : "text-teal-700"
                        }`}
                      >
                        {mod.code}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {mod.title}
                      </span>
                      <span className="font-mono text-xs text-slate-500 tabular-nums">
                        {mod.cp} ECTS
                      </span>
                      <span className="text-xs text-slate-500">
                        · {mod.area}
                      </span>
                    </div>

                    {isMakeup && (
                      <button
                        type="button"
                        onClick={() => onToggleCompletedMakeup(mod.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto ${
                          isMakeupDone
                            ? "bg-teal-700 text-white border-teal-700"
                            : "bg-white text-slate-600 border-slate-300 hover:border-teal-600 hover:text-teal-800"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isMakeupDone ? "Bestanden" : "Offen"}</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
                    <div className="flex items-start gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-700 font-medium">
                          Prüfungsform:
                        </strong>{" "}
                        {mod.examType}
                      </span>
                    </div>

                    <div className="flex items-start gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-700 font-medium">
                          Prüfungstermin/Raum:
                        </strong>{" "}
                        <span
                          className={
                            examDateRoom === "Zeit/Raum fehlt"
                              ? "text-slate-500"
                              : "text-slate-900 font-medium"
                          }
                        >
                          {examDateRoom}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-start gap-1.5 sm:col-span-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-700 font-medium">
                          Lehrveranstaltung:
                        </strong>{" "}
                        {courseTimeRoom}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
