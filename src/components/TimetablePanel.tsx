import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  Languages,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  AREA_FILTER_OPTIONS,
  SEMESTER_INFOS,
  TIME_BLOCKS,
  WEEKDAYS,
  detectScheduleConflicts,
  getAreaSwatchClasses,
  getModuleColorTheme,
  getModuleIntroduction,
  type DitModule,
  type ModuleArea,
  type SemesterId,
  type TeachingLanguage,
  type Weekday,
} from "../data/ditCatalog";

interface TimetablePanelProps {
  activeSemester: SemesterId;
  allModules: DitModule[];
  selectedModuleIds: string[];
  moduleOverrides?: Record<string, Partial<DitModule>>;
  onToggleModule: (moduleId: string) => void;
  onAddCustomModule: (newModule: DitModule) => void;
  onUpdateModule: (moduleId: string, patch: Partial<DitModule>) => void;
  onResetModuleOverride: (moduleId: string) => void;
  onDeleteCustomModule: (moduleId: string) => void;
  onClearSchedule: () => void;
}

type AreaFilter = "Alle" | ModuleArea;
type LanguageFilter = "Alle" | "Englisch" | "Deutsch" | "Sprachbrücke";

const CUSTOM_AREAS: ModuleArea[] = [
  "BWL Pflicht",
  "Wirtschaftsinformatik Pflicht",
  "Weitere Grundlagen (WP)",
  "Informatik (WP)",
  "Profil DITraM",
  "Profil UCeDI",
  "Profil CIDA",
  "Schlüsselkompetenzen",
  "Projektseminar",
  "Masterarbeit",
  "Auflagen",
];

const CUSTOM_LANGUAGES: TeachingLanguage[] = [
  "Deutsch",
  "Englisch",
  "Deutsch (EN-Literatur)",
];

function formatModuleTimeSummary(mod: DitModule): string {
  if (mod.realScheduleLabel) return mod.realScheduleLabel;
  if (mod.schedule.length > 0) {
    return mod.schedule
      .map(
        (s) =>
          `${s.day} ${String(s.startHour).padStart(2, "0")}:00–${String(s.endHour).padStart(2, "0")}:00 · ${s.room}`
      )
      .join(", ");
  }
  return "Zeit/Raum fehlt";
}

export const TimetablePanel: React.FC<TimetablePanelProps> = ({
  activeSemester,
  allModules,
  selectedModuleIds,
  moduleOverrides = {},
  onToggleModule,
  onAddCustomModule,
  onUpdateModule,
  onResetModuleOverride,
  onDeleteCustomModule,
  onClearSchedule,
}) => {
  const semesterInfo = SEMESTER_INFOS[activeSemester];
  const [searchQuery, setSearchQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState<AreaFilter>("Alle");
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>("Alle");

  // Custom module form state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customCode, setCustomCode] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customCp, setCustomCp] = useState("6");
  const [customArea, setCustomArea] = useState<ModuleArea>("Profil DITraM");
  const [customLanguage, setCustomLanguage] =
    useState<TeachingLanguage>("Deutsch");
  const [customDay, setCustomDay] = useState<"" | Weekday>("");
  const [customStartHour, setCustomStartHour] = useState<number>(10);
  const [customRoom, setCustomRoom] = useState("");
  const [customExamType, setCustomExamType] = useState("");
  const [customExamDateRoom, setCustomExamDateRoom] = useState("");
  const [customFormError, setCustomFormError] = useState("");

  // Module detail / edit modal state
  const [detailModuleId, setDetailModuleId] = useState<string | null>(null);
  const [detailDay, setDetailDay] = useState<"" | Weekday>("");
  const [detailStartHour, setDetailStartHour] = useState<number>(10);
  const [detailRoom, setDetailRoom] = useState("");
  const [detailExamType, setDetailExamType] = useState("");
  const [detailExamDateRoom, setDetailExamDateRoom] = useState("");
  const [detailLanguage, setDetailLanguage] =
    useState<TeachingLanguage>("Deutsch");
  const [detailDescription, setDetailDescription] = useState("");

  const availableModules = useMemo(
    () =>
      allModules.filter(
        (m) =>
          m.semester === activeSemester ||
          m.semester === "alle" ||
          m.area === "Auflagen"
      ),
    [allModules, activeSemester]
  );

  const selectedModules = useMemo(
    () => availableModules.filter((m) => selectedModuleIds.includes(m.id)),
    [availableModules, selectedModuleIds]
  );

  const detailModule = useMemo(
    () =>
      detailModuleId
        ? allModules.find((m) => m.id === detailModuleId) ?? null
        : null,
    [allModules, detailModuleId]
  );

  const openModuleDetail = (mod: DitModule) => {
    setDetailModuleId(mod.id);
    const firstSlot = mod.schedule[0];
    setDetailDay(firstSlot ? firstSlot.day : "");
    setDetailStartHour(firstSlot ? firstSlot.startHour : 10);
    setDetailRoom(firstSlot ? firstSlot.room : "");
    setDetailExamType(mod.examType);
    setDetailExamDateRoom(mod.customExamDateRoom ?? "");
    setDetailLanguage(mod.language);
    setDetailDescription(getModuleIntroduction(mod));
  };

  const handleSaveModuleDetail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailModule) return;

    const trimmedRoom = detailRoom.trim();
    const trimmedExamType =
      detailExamType.trim() || "Nach Modulhandbuch / Dozentenangabe";
    const trimmedExamDateRoom = detailExamDateRoom.trim();
    const trimmedDescription = detailDescription.trim();

    const nextSchedule = detailDay
      ? [
          {
            day: detailDay,
            startHour: detailStartHour,
            endHour: detailStartHour + 2,
            room: trimmedRoom || "Raum fehlt",
            sessionType:
              detailModule.schedule[0]?.sessionType ?? ("Vorlesung" as const),
          },
        ]
      : [];

    const nextRealScheduleLabel = detailDay
      ? `${detailDay} ${String(detailStartHour).padStart(2, "0")}:00–${String(
          detailStartHour + 2
        ).padStart(2, "0")}:00 · ${trimmedRoom || "Raum fehlt"}`
      : trimmedRoom
      ? `Uhrzeit fehlt · ${trimmedRoom}`
      : detailModule.realScheduleLabel;

    onUpdateModule(detailModule.id, {
      schedule: nextSchedule,
      realScheduleLabel: nextRealScheduleLabel,
      examType: trimmedExamType,
      customExamDateRoom: trimmedExamDateRoom || undefined,
      language: detailLanguage,
      description: trimmedDescription || undefined,
    });
    setDetailModuleId(null);
  };

  const handleResetDetailModule = () => {
    if (!detailModule) return;
    onResetModuleOverride(detailModule.id);
    setDetailModuleId(null);
  };

  const filteredModules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return availableModules.filter((mod) => {
      if (areaFilter !== "Alle" && mod.area !== areaFilter) return false;
      if (languageFilter === "Englisch" && mod.language !== "Englisch")
        return false;
      if (
        languageFilter === "Deutsch" &&
        !mod.language.startsWith("Deutsch")
      )
        return false;
      if (languageFilter === "Sprachbrücke" && !mod.ecampusLanguageMismatch)
        return false;

      if (!q) return true;
      return (
        mod.title.toLowerCase().includes(q) ||
        mod.ecampusTitle.toLowerCase().includes(q) ||
        mod.code.toLowerCase().includes(q) ||
        mod.area.toLowerCase().includes(q)
      );
    });
  }, [availableModules, searchQuery, areaFilter, languageFilter]);

  const regularCp = selectedModules
    .filter((m) => m.area !== "Auflagen")
    .reduce((sum, m) => sum + m.cp, 0);
  const makeupCp = selectedModules
    .filter((m) => m.area === "Auflagen")
    .reduce((sum, m) => sum + m.cp, 0);

  const conflicts = detectScheduleConflicts(selectedModules);

  const conflictSlotKeys = new Set(
    conflicts.map((c) => `${c.day}-${c.startHour}`)
  );

  const wouldConflict = (candidate: DitModule): boolean => {
    if (selectedModuleIds.includes(candidate.id)) return false;
    return candidate.schedule.some((slot) =>
      selectedModules.some((existing) =>
        existing.schedule.some(
          (es) => es.day === slot.day && es.startHour === slot.startHour
        )
      )
    );
  };

  const resetCustomForm = () => {
    setCustomCode("");
    setCustomTitle("");
    setCustomCp("6");
    setCustomArea("Profil DITraM");
    setCustomLanguage("Deutsch");
    setCustomDay("");
    setCustomStartHour(10);
    setCustomRoom("");
    setCustomExamType("");
    setCustomExamDateRoom("");
    setCustomFormError("");
  };

  const handleCreateCustomModule = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = customTitle.trim();
    if (!trimmedTitle) {
      setCustomFormError("Bitte gib einen Modultitel ein.");
      return;
    }

    const parsedCp = Math.max(1, Math.min(30, Number(customCp) || 6));
    const trimmedCode = (customCode.trim() || "EIGEN").toUpperCase();
    const trimmedRoom = customRoom.trim();
    const trimmedExamType =
      customExamType.trim() || "Nach Modulhandbuch / Dozentenangabe";
    const trimmedExamDateRoom = customExamDateRoom.trim();

    const schedule = customDay
      ? [
          {
            day: customDay,
            startHour: customStartHour,
            endHour: customStartHour + 2,
            room: trimmedRoom || "Raum fehlt",
            sessionType: "Vorlesung" as const,
          },
        ]
      : [];

    const realScheduleLabel = customDay
      ? `${customDay} ${String(customStartHour).padStart(2, "0")}:00–${String(customStartHour + 2).padStart(2, "0")}:00 · ${trimmedRoom || "Raum fehlt"}`
      : trimmedRoom
      ? `Uhrzeit fehlt · ${trimmedRoom}`
      : undefined;

    const newModule: DitModule = {
      id: `custom-${Date.now()}`,
      semester: activeSemester,
      code: trimmedCode,
      title: trimmedTitle,
      ecampusTitle: trimmedTitle,
      cp: parsedCp,
      area: customArea,
      language: customLanguage,
      ecampusLanguageMismatch: false,
      languageNote: `Eigenes Modul (${customLanguage}).`,
      examType: trimmedExamType,
      workload: 3,
      workloadComment: `${parsedCp} ECTS (eigenes Modul).`,
      officialPrerequisite: "Individuell hinzugefügtes Modul",
      studentTip: "Eigenes Modul in deinem Stundenplan.",
      learningGoals: [],
      recommendedFor: ["General"],
      schedule,
      realScheduleLabel,
      customExamDateRoom: trimmedExamDateRoom || undefined,
      isCustom: true,
    };

    onAddCustomModule(newModule);
    resetCustomForm();
    setShowCustomForm(false);
  };

  return (
    <div className="space-y-5">
      {/* Compact Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 text-xs sm:text-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          {conflicts.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-red-700 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                {conflicts.length}{" "}
                {conflicts.length === 1 ? "Konflikt" : "Konflikte"}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-teal-800 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Konfliktfrei</span>
            </span>
          )}

          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>

          <span className="text-slate-600">
            {semesterInfo.shortLabel} (
            {semesterInfo.isCurrent ? "Aktuelles Semester" : "Nächstes Semester"})
          </span>

          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>

          <span className="font-mono font-semibold text-teal-800 tabular-nums">
            {regularCp} / 30 ECTS
          </span>

          {makeupCp > 0 && (
            <span className="text-[#ff8000] font-medium tabular-nums">
              (+{makeupCp} ECTS Auflagen)
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClearSchedule}
          disabled={selectedModuleIds.length === 0}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap disabled:opacity-40"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Leeren</span>
        </button>
      </div>

      {/* Weekly Timetable Grid (Mo–Fr) */}
      <div>
        {selectedModules.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50/70">
            <p className="text-sm font-medium text-slate-800">
              Dein Stundenplan für {semesterInfo.shortLabel} ist aktuell leer.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Wähle unten Module aus dem Angebot oder füge ein eigenes Modul hinzu.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
              <table className="w-full min-w-[600px] border-collapse table-fixed">
                <thead>
                  <tr className="bg-teal-50 border-b border-slate-200">
                    <th className="w-20 px-2.5 py-2 text-left text-xs font-semibold text-slate-600">
                      Zeit
                    </th>
                    {WEEKDAYS.map((day) => (
                      <th
                        key={day}
                        className="px-2 py-2 text-left text-xs font-semibold border-l border-slate-200 text-teal-900"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_BLOCKS.map((hour) => (
                    <tr
                      key={hour}
                      className="border-b border-slate-200 last:border-b-0"
                    >
                      <td className="px-2.5 py-2.5 text-[11px] font-mono text-slate-500 align-top tabular-nums bg-slate-50/50">
                        {String(hour).padStart(2, "0")}:00
                      </td>
                      {WEEKDAYS.map((day) => {
                        const slotKey = `${day}-${hour}`;
                        const isConflict = conflictSlotKeys.has(slotKey);
                        const cellEntries = selectedModules.flatMap((mod) =>
                          mod.schedule
                            .filter(
                              (s) => s.day === day && s.startHour === hour
                            )
                            .map((slot) => ({ mod, slot }))
                        );

                        return (
                          <td
                            key={slotKey}
                            className={`p-1.5 border-l border-slate-200 align-top h-[62px] ${
                              isConflict ? "bg-red-50/70" : ""
                            }`}
                          >
                            <div className="space-y-1">
                              {cellEntries.map(({ mod, slot }) => {
                                const theme = getModuleColorTheme(mod);
                                return (
                                  <div
                                    key={`${mod.id}-${slot.day}-${slot.startHour}`}
                                    className={`group rounded-md px-2 py-1.5 border text-xs transition-colors ${
                                      isConflict
                                        ? "bg-white border-red-300 text-red-950"
                                        : theme.gridSlotClass
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-1">
                                      <span
                                        className={`font-mono text-[11px] font-semibold truncate ${theme.textClass}`}
                                      >
                                        {mod.code}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => onToggleModule(mod.id)}
                                        title={`${mod.title} entfernen`}
                                        className="text-slate-400 hover:text-red-600 rounded transition-colors shrink-0"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <div className="font-medium text-[11px] leading-snug line-clamp-1">
                                      {mod.title}
                                    </div>
                                    <div className="text-[10px] text-slate-600 leading-snug line-clamp-1 mt-0.5 tabular-nums">
                                      {String(slot.startHour).padStart(2, "0")}:00–
                                      {String(slot.endHour).padStart(2, "0")}:00 ·{" "}
                                      {slot.room}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedModules.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5 space-y-1.5 text-xs">
                <div className="font-semibold text-slate-700">
                  Aktuell ausgewählte Module ({selectedModules.length}):
                </div>
                <div className="space-y-1.5">
                  {selectedModules.map((mod) => {
                    const theme = getModuleColorTheme(mod);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => openModuleDetail(mod)}
                        className={`flex items-center justify-between gap-2 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-800 cursor-pointer transition-colors ${theme.cardBorderTopClass} ${theme.selectedCardBgClass}`}
                      >
                        <div className="flex-1 min-w-0 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span
                            className={`font-mono font-semibold shrink-0 ${theme.textClass}`}
                          >
                            {mod.code}
                          </span>
                          <span className="font-medium text-slate-900">
                            {mod.title} ({mod.cp} ECTS)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleModule(mod.id);
                          }}
                          title={`${mod.title} entfernen`}
                          className="p-0.5 text-slate-400 hover:text-red-600 transition-colors shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Course Selection Catalog */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <h3 className="text-sm font-semibold text-teal-800">
              Kurswahl · Modulangebot ({semesterInfo.shortLabel})
            </h3>
            <span className="text-xs text-slate-500 tabular-nums">
              {filteredModules.length} / {availableModules.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowCustomForm((prev) => !prev);
              setCustomFormError("");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-teal-700 bg-teal-50 hover:bg-teal-100 text-teal-900 transition-colors whitespace-nowrap"
          >
            {showCustomForm ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>Abbrechen</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Eigenes Modul hinzufügen</span>
              </>
            )}
          </button>
        </div>

        {/* Inline Custom Module Form */}
        {showCustomForm && (
          <form
            onSubmit={handleCreateCustomModule}
            className="rounded-xl border border-teal-700/30 bg-teal-50/40 p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-semibold text-teal-900">
                Neues Modul für {semesterInfo.shortLabel} anlegen
              </h4>
              <span className="text-[11px] text-slate-500">
                Fehlende Zeiten/Räume werden als „Zeit/Raum fehlt“ markiert
              </span>
            </div>

            {customFormError && (
              <p className="text-xs font-medium text-red-700">
                {customFormError}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-3">
                <label
                  htmlFor="custom-code"
                  className="block text-[11px] font-medium text-slate-700 mb-1"
                >
                  Modulcode
                </label>
                <input
                  id="custom-code"
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="z. B. WAHL-99"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-7">
                <label
                  htmlFor="custom-title"
                  className="block text-[11px] font-medium text-slate-700 mb-1"
                >
                  Modultitel *
                </label>
                <input
                  id="custom-title"
                  type="text"
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="z. B. Data Science Seminar"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="custom-cp"
                  className="block text-[11px] font-medium text-slate-700 mb-1"
                >
                  ECTS
                </label>
                <input
                  id="custom-cp"
                  type="number"
                  min={1}
                  max={30}
                  value={customCp}
                  onChange={(e) => setCustomCp(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="custom-area"
                  className="block text-[11px] font-medium text-slate-700 mb-1"
                >
                  Bereich
                </label>
                <select
                  id="custom-area"
                  value={customArea}
                  onChange={(e) => setCustomArea(e.target.value as ModuleArea)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                >
                  {CUSTOM_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="custom-lang"
                  className="block text-[11px] font-medium text-slate-700 mb-1"
                >
                  Sprache
                </label>
                <select
                  id="custom-lang"
                  value={customLanguage}
                  onChange={(e) =>
                    setCustomLanguage(e.target.value as TeachingLanguage)
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                >
                  {CUSTOM_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4">
                <label
                  htmlFor="custom-day"
                  className="block text-[11px] font-medium text-slate-700 mb-1"
                >
                  Wochentag (optional)
                </label>
                <select
                  id="custom-day"
                  value={customDay}
                  onChange={(e) =>
                    setCustomDay(e.target.value as "" | Weekday)
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                >
                  <option value="">Keine Angabe (Zeit/Raum fehlt)</option>
                  {WEEKDAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4">
                <label
                  htmlFor="custom-hour"
                  className="block text-[11px] font-medium text-slate-700 mb-1"
                >
                  Uhrzeit (optional)
                </label>
                <select
                  id="custom-hour"
                  disabled={!customDay}
                  value={customStartHour}
                  onChange={(e) => setCustomStartHour(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {TIME_BLOCKS.map((h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, "0")}:00–
                      {String(h + 2).padStart(2, "0")}:00 Uhr
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4">
                <label
                  htmlFor="custom-room"
                  className="block text-[11px] font-medium text-slate-700 mb-1"
                >
                  Raum / Ort (optional)
                </label>
                <input
                  id="custom-room"
                  type="text"
                  value={customRoom}
                  onChange={(e) => setCustomRoom(e.target.value)}
                  placeholder="z. B. Nora-Platiel-Str. 1 · R 0210"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="custom-exam-type"
                  className="block text-[11px] font-medium text-slate-700 mb-1"
                >
                  Prüfungsform (optional)
                </label>
                <input
                  id="custom-exam-type"
                  type="text"
                  value={customExamType}
                  onChange={(e) => setCustomExamType(e.target.value)}
                  placeholder="z. B. Klausur (90 Min.) oder Hausarbeit"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="custom-exam-date"
                  className="block text-[11px] font-medium text-slate-700 mb-1"
                >
                  Prüfungstermin &amp; Raum (optional)
                </label>
                <input
                  id="custom-exam-date"
                  type="text"
                  value={customExamDateRoom}
                  onChange={(e) => setCustomExamDateRoom(e.target.value)}
                  placeholder="z. B. 18.02.2027, 10:00 · HS 1"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  resetCustomForm();
                  setShowCustomForm(false);
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Speichern &amp; zum Stundenplan</span>
              </button>
            </div>
          </form>
        )}

        {/* Search & Language Filter Row */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Modul oder Code suchen…"
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/15"
            />
          </div>

          <select
            aria-label="Nach Unterrichtssprache filtern"
            value={languageFilter}
            onChange={(e) =>
              setLanguageFilter(e.target.value as LanguageFilter)
            }
            className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-700 focus:border-teal-700 focus:outline-none"
          >
            <option value="Alle">Alle Sprachen</option>
            <option value="Englisch">Englisch</option>
            <option value="Deutsch">Deutsch</option>
            <option value="Sprachbrücke">Sprachbrücke (DE → EN)</option>
          </select>
        </div>

        {/* Area Filter Buttons with Required CPs & Legend Swatches */}
        <div className="flex flex-wrap items-center gap-1.5">
          {AREA_FILTER_OPTIONS.map((opt) => {
            const swatches = getAreaSwatchClasses(opt.value);
            const isActive = areaFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAreaFilter(opt.value)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-teal-700 text-white border-teal-700"
                    : "bg-white text-slate-700 border-slate-200 hover:border-teal-600/50 hover:text-teal-800"
                }`}
              >
                {swatches.length > 0 && (
                  <span
                    aria-hidden="true"
                    className={`inline-flex overflow-hidden rounded-[2px] shrink-0 ${
                      isActive ? "ring-1 ring-white/80" : ""
                    }`}
                  >
                    {swatches.map((swatch, idx) => (
                      <span
                        key={idx}
                        className={`${
                          swatches.length > 1 ? "w-1.5" : "w-2.5"
                        } h-2.5 ${swatch}`}
                      />
                    ))}
                  </span>
                )}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Clean Module List with Legend Colors (Click card for Detail Pop-up) */}
        {filteredModules.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50/70">
            <p className="text-sm font-medium text-slate-800">
              Keine passenden Module gefunden.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setAreaFilter("Alle");
                setLanguageFilter("Alle");
              }}
              className="mt-2 px-3 py-1.5 text-xs font-medium text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
            >
              Filter zurücksetzen
            </button>
          </div>
        ) : (
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-0.5">
            {filteredModules.map((mod) => {
              const isSelected = selectedModuleIds.includes(mod.id);
              const conflict = wouldConflict(mod);
              const timeSummary = formatModuleTimeSummary(mod);
              const theme = getModuleColorTheme(mod);

              return (
                <div
                  key={mod.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openModuleDetail(mod)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openModuleDetail(mod);
                    }
                  }}
                  aria-label={`${mod.code} ${mod.title} – Details anzeigen und bearbeiten`}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-3 rounded-lg border border-slate-200 cursor-pointer transition-colors ${
                    theme.cardBorderTopClass
                  } ${
                    isSelected ? theme.selectedCardBgClass : theme.cardBgClass
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span
                        className={`font-mono text-xs font-bold ${theme.textClass}`}
                      >
                        {mod.code}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {mod.title}
                      </span>
                      <span className="font-mono text-xs text-slate-600 tabular-nums">
                        {mod.cp} ECTS
                      </span>
                      {mod.isCustom && (
                        <span className="text-[11px] font-medium text-teal-800">
                          · Eigenes Modul
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 tabular-nums">
                      <span
                        className={`inline-flex items-center gap-1.5 font-medium ${theme.textClass}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`w-2 h-2 rounded-[2px] shrink-0 ${theme.swatchClass}`}
                        />
                        <span>{mod.area}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{timeSummary}</span>
                      <span aria-hidden="true">·</span>
                      <span>{mod.language}</span>
                      {mod.ecampusLanguageMismatch && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span
                            title={mod.languageNote}
                            className="inline-flex items-center gap-1 text-teal-800 font-medium"
                          >
                            <Languages className="w-3 h-3" />
                            <span>Sprachbrücke</span>
                          </span>
                        </>
                      )}
                      {conflict && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#ff8000] font-semibold">
                            Zeitüberschneidung
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {mod.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCustomModule(mod.id);
                        }}
                        title={`${mod.title} löschen`}
                        className="inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleModule(mod.id);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                        isSelected
                          ? "bg-teal-700 text-white border-teal-700 hover:bg-teal-800"
                          : "bg-white text-teal-800 border-teal-600/40 hover:bg-teal-50 hover:border-teal-700"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Ausgewählt</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Hinzufügen</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Module Detail & Edit Pop-up Modal */}
      {detailModule && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="module-detail-title"
          onClick={() => setDetailModuleId(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        >
          {(() => {
            const theme = getModuleColorTheme(detailModule);
            const isSelected = selectedModuleIds.includes(detailModule.id);
            const hasOverride = Boolean(moduleOverrides[detailModule.id]);

            return (
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden"
              >
                {/* Pop-up Header */}
                <div
                  className={`flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-200 ${theme.cardBorderTopClass} ${theme.selectedCardBgClass}`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`font-mono font-bold ${theme.textClass}`}>
                        {detailModule.code}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className={`font-semibold ${theme.textClass}`}>
                        {detailModule.area}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono font-semibold text-slate-700 tabular-nums">
                        {detailModule.cp} ECTS
                      </span>
                    </div>
                    <h2
                      id="module-detail-title"
                      className="text-base font-bold text-slate-900 mt-1 leading-snug"
                    >
                      {detailModule.title}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDetailModuleId(null)}
                    aria-label="Detailansicht schließen"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white/70 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Scrollable Body */}
                <form
                  onSubmit={handleSaveModuleDetail}
                  className="flex-1 overflow-y-auto p-5 space-y-4"
                >
                  {/* Kurze Vorstellung des Moduls */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-800">
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span>Kurzvorstellung des Moduls</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {getModuleIntroduction(detailModule)}
                    </p>
                    {detailModule.learningGoals.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {detailModule.learningGoals.map((goal) => (
                          <span
                            key={goal}
                            className="inline-block px-2 py-0.5 text-[11px] font-medium text-slate-700 bg-white border border-slate-200 rounded-md"
                          >
                            {goal}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500 pt-0.5">
                      <strong className="font-medium text-slate-700">
                        Hinweis / Voraussetzung:
                      </strong>{" "}
                      {detailModule.officialPrerequisite}
                    </p>
                  </div>

                  {/* Fehlende Infos hinzufügen oder ändern */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                      <Pencil className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span>Fehlende Infos hinzufügen oder ändern</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      <div className="sm:col-span-4">
                        <label
                          htmlFor="detail-day"
                          className="block text-[11px] font-medium text-slate-700 mb-1"
                        >
                          Wochentag
                        </label>
                        <select
                          id="detail-day"
                          value={detailDay}
                          onChange={(e) =>
                            setDetailDay(e.target.value as "" | Weekday)
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                        >
                          <option value="">Keine Angabe</option>
                          {WEEKDAYS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-4">
                        <label
                          htmlFor="detail-hour"
                          className="block text-[11px] font-medium text-slate-700 mb-1"
                        >
                          Uhrzeit
                        </label>
                        <select
                          id="detail-hour"
                          disabled={!detailDay}
                          value={detailStartHour}
                          onChange={(e) =>
                            setDetailStartHour(Number(e.target.value))
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          {TIME_BLOCKS.map((h) => (
                            <option key={h} value={h}>
                              {String(h).padStart(2, "0")}:00–
                              {String(h + 2).padStart(2, "0")}:00 Uhr
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-4">
                        <label
                          htmlFor="detail-room"
                          className="block text-[11px] font-medium text-slate-700 mb-1"
                        >
                          Raum / Ort
                        </label>
                        <input
                          id="detail-room"
                          type="text"
                          value={detailRoom}
                          onChange={(e) => setDetailRoom(e.target.value)}
                          placeholder="z. B. Nora-Platiel-Str. 1 · R 0210"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-6">
                        <label
                          htmlFor="detail-exam-type"
                          className="block text-[11px] font-medium text-slate-700 mb-1"
                        >
                          Prüfungsform
                        </label>
                        <input
                          id="detail-exam-type"
                          type="text"
                          value={detailExamType}
                          onChange={(e) => setDetailExamType(e.target.value)}
                          placeholder="z. B. Klausur (90 Min.) oder Hausarbeit"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-6">
                        <label
                          htmlFor="detail-exam-date"
                          className="block text-[11px] font-medium text-slate-700 mb-1"
                        >
                          Prüfungstermin &amp; Raum
                        </label>
                        <input
                          id="detail-exam-date"
                          type="text"
                          value={detailExamDateRoom}
                          onChange={(e) =>
                            setDetailExamDateRoom(e.target.value)
                          }
                          placeholder="z. B. 18.02.2027, 10:00 · HS 1"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-12">
                        <label
                          htmlFor="detail-lang"
                          className="block text-[11px] font-medium text-slate-700 mb-1"
                        >
                          Unterrichtssprache
                        </label>
                        <select
                          id="detail-lang"
                          value={detailLanguage}
                          onChange={(e) =>
                            setDetailLanguage(
                              e.target.value as TeachingLanguage
                            )
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                        >
                          {CUSTOM_LANGUAGES.map((lang) => (
                            <option key={lang} value={lang}>
                              {lang}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-12">
                        <label
                          htmlFor="detail-desc"
                          className="block text-[11px] font-medium text-slate-700 mb-1"
                        >
                          Kurzvorstellung / Notiz anpassen
                        </label>
                        <textarea
                          id="detail-desc"
                          rows={3}
                          value={detailDescription}
                          onChange={(e) =>
                            setDetailDescription(e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none resize-y"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Modal Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleModule(detailModule.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                          isSelected
                            ? "bg-teal-700 text-white border-teal-700 hover:bg-teal-800"
                            : "bg-white text-teal-800 border-teal-600/40 hover:bg-teal-50"
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Ausgewählt</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Hinzufügen</span>
                          </>
                        )}
                      </button>

                      {!detailModule.isCustom && hasOverride && (
                        <button
                          type="button"
                          onClick={handleResetDetailModule}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Zurücksetzen</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailModuleId(null)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
                      >
                        Abbrechen
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Änderungen speichern</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
