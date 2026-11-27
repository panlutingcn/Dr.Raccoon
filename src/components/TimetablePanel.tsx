import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Check,
  FileDown,
  Languages,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { exportTimetablePdf } from "../utils/pdfExport";
import {
  getTargetEctsForProfile,
  type AppLanguage,
  type UserProfile,
} from "../types/userProfile";
import {
  AREA_FILTER_OPTIONS,
  SESSION_TYPES,
  TIME_BLOCKS,
  WEEKDAYS,
  detectScheduleConflicts,
  doSlotsOverlap,
  getActiveScheduleSlots,
  getAreaSwatchClasses,
  getModuleColorTheme,
  getSlotTimeRange,
  getTimetableBlockHour,
  minutesToDecimalHour,
  parseTimeToMinutes,
  type DitModule,
  type ModuleArea,
  type ScheduleSlot,
  type SemesterId,
  type SessionType,
  type TeachingLanguage,
  type Weekday,
} from "../data/ditCatalog";
import {
  formatLocalizedScheduleSummary,
  getLocalizedModuleIntroduction,
  getLocalizedProfileDisplayParts,
  getTranslations,
} from "../i18n/translations";

interface TimetablePanelProps {
  activeSemester: SemesterId;
  language?: AppLanguage;
  allModules: DitModule[];
  selectedModuleIds: string[];
  moduleOverrides?: Record<string, Partial<DitModule>>;
  userProfile?: UserProfile | null;
  onOpenProfileModal?: () => void;
  onToggleModule: (moduleId: string) => void;
  onAddCustomModule: (newModule: DitModule) => void;
  onUpdateModule: (moduleId: string, patch: Partial<DitModule>) => void;
  onResetModuleOverride: (moduleId: string) => void;
  onDeleteCustomModule: (moduleId: string) => void;
  onClearSchedule: () => void;
}

type AreaFilter = "Alle" | ModuleArea;
type LanguageFilter = "Alle" | "Englisch" | "Deutsch" | "Sprachbrücke";

interface DetailSlotDraft {
  id: string;
  sessionType: SessionType;
  day: "" | Weekday;
  startTime: string;
  endTime: string;
  room: string;
  selected: boolean;
}

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

function getSessionBadgeClass(sessionType: SessionType): string {
  switch (sessionType) {
    case "Übung":
    case "Übung / Lab":
      return "bg-teal-50 text-teal-800 border-teal-200";
    case "Tutorium":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "Seminar":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-white/85 text-slate-600 border-slate-200";
  }
}

export const TimetablePanel: React.FC<TimetablePanelProps> = ({
  activeSemester,
  language = "de",
  allModules,
  selectedModuleIds,
  moduleOverrides = {},
  userProfile = null,
  onOpenProfileModal,
  onToggleModule,
  onAddCustomModule,
  onUpdateModule,
  onResetModuleOverride,
  onDeleteCustomModule,
  onClearSchedule,
}) => {
  const tr = getTranslations(language);
  const t = tr.timetable;
  const c = tr.catalog;
  const po = tr.profileOptions;
  const semesterInfo = c.semesters[activeSemester];
  const targetEcts = getTargetEctsForProfile(userProfile);
  const profileDisplay = userProfile
    ? getLocalizedProfileDisplayParts(userProfile, language)
    : null;
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
  const [customSessionType, setCustomSessionType] =
    useState<SessionType>("Vorlesung");
  const [customDay, setCustomDay] = useState<"" | Weekday>("");
  const [customStartTime, setCustomStartTime] = useState("10:00");
  const [customEndTime, setCustomEndTime] = useState("12:00");
  const [customRoom, setCustomRoom] = useState("");
  const [customExamType, setCustomExamType] = useState("");
  const [customExamDateRoom, setCustomExamDateRoom] = useState("");
  const [customFormError, setCustomFormError] = useState("");

  // Module detail / edit modal state
  const [detailModuleId, setDetailModuleId] = useState<string | null>(null);
  const [detailSlots, setDetailSlots] = useState<DetailSlotDraft[]>([]);
  const [detailExamType, setDetailExamType] = useState("");
  const [detailExamDateRoom, setDetailExamDateRoom] = useState("");
  const [detailLanguage, setDetailLanguage] =
    useState<TeachingLanguage>("Deutsch");
  const [detailDescription, setDetailDescription] = useState("");
  const [detailError, setDetailError] = useState("");

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

  const timetableHours = useMemo(() => {
    const hours = new Set<number>(TIME_BLOCKS);
    for (const mod of selectedModules) {
      for (const slot of getActiveScheduleSlots(mod)) {
        hours.add(getTimetableBlockHour(slot));
      }
    }
    return Array.from(hours).sort((a, b) => a - b);
  }, [selectedModules]);

  const openModuleDetail = (mod: DitModule) => {
    setDetailModuleId(mod.id);
    setDetailError("");
    if (mod.schedule.length > 0) {
      setDetailSlots(
        mod.schedule.map((slot, idx) => {
          const range = getSlotTimeRange(slot);
          return {
            id: slot.id || `slot-${idx}-${Date.now()}`,
            sessionType: slot.sessionType,
            day: slot.day,
            startTime: range.startStr,
            endTime: range.endStr,
            room: slot.room === "Raum fehlt" ? "" : slot.room,
            selected: slot.selected !== false,
          };
        })
      );
    } else {
      setDetailSlots([
        {
          id: `slot-0-${Date.now()}`,
          sessionType: "Vorlesung",
          day: "",
          startTime: "10:00",
          endTime: "12:00",
          room: "",
          selected: true,
        },
      ]);
    }
    setDetailExamType(mod.examType);
    setDetailExamDateRoom(mod.customExamDateRoom ?? "");
    setDetailLanguage(mod.language);
    setDetailDescription(getLocalizedModuleIntroduction(mod, language));
  };

  const handleAddDetailSlot = () => {
    setDetailError("");
    setDetailSlots((prev) => {
      const hasExercise = prev.some((s) => s.sessionType === "Übung");
      const nextType: SessionType = hasExercise ? "Tutorium" : "Übung";
      return [
        ...prev,
        {
          id: `slot-${prev.length}-${Date.now()}`,
          sessionType: nextType,
          day: "",
          startTime: "14:00",
          endTime: "16:00",
          room: "",
          selected: true,
        },
      ];
    });
  };

  const handleUpdateDetailSlot = (
    slotId: string,
    patch: Partial<DetailSlotDraft>
  ) => {
    setDetailError("");
    setDetailSlots((prev) =>
      prev.map((slot) => (slot.id === slotId ? { ...slot, ...patch } : slot))
    );
  };

  const handleRemoveDetailSlot = (slotId: string) => {
    setDetailError("");
    setDetailSlots((prev) => {
      if (prev.length <= 1) {
        return prev.map((slot) =>
          slot.id === slotId
            ? {
                ...slot,
                day: "",
                startTime: "10:00",
                endTime: "12:00",
                room: "",
                selected: true,
              }
            : slot
        );
      }
      return prev.filter((slot) => slot.id !== slotId);
    });
  };

  const handleSaveModuleDetail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailModule) return;

    const nextSchedule: ScheduleSlot[] = [];
    for (const draft of detailSlots) {
      if (!draft.day) {
        if (detailSlots.length > 1) {
          setDetailError(
            t.detailModal.errMissingWeekday(
              c.sessionTypes[draft.sessionType] ?? draft.sessionType
            )
          );
          return;
        }
        continue;
      }
      const startMin = parseTimeToMinutes(draft.startTime);
      const endMin = parseTimeToMinutes(draft.endTime);
      if (startMin === null || endMin === null || endMin <= startMin) {
        setDetailError(
          t.detailModal.errInvalidSlotTime(
            c.sessionTypes[draft.sessionType] ?? draft.sessionType,
            c.weekdays[draft.day]
          )
        );
        return;
      }
      nextSchedule.push({
        id: draft.id,
        day: draft.day,
        startHour: minutesToDecimalHour(startMin),
        endHour: minutesToDecimalHour(endMin),
        startTime: draft.startTime,
        endTime: draft.endTime,
        room: draft.room.trim() || "Raum fehlt",
        sessionType: draft.sessionType,
        selected: draft.selected,
      });
    }

    const trimmedExamType =
      detailExamType.trim() || "Nach Modulhandbuch / Dozentenangabe";
    const trimmedExamDateRoom = detailExamDateRoom.trim();
    const trimmedDescription = detailDescription.trim();

    const activeSavedSlots = nextSchedule.filter((s) => s.selected !== false);
    const unscheduledRoom = detailSlots
      .map((s) => s.room.trim())
      .find((r) => Boolean(r));

    const nextRealScheduleLabel =
      activeSavedSlots.length > 0
        ? activeSavedSlots
            .map((s) => {
              const typeSuffix =
                activeSavedSlots.length > 1 || s.sessionType !== "Vorlesung"
                  ? ` (${s.sessionType})`
                  : "";
              return `${s.day} ${s.startTime}–${s.endTime}${typeSuffix} · ${s.room}`;
            })
            .join("; ")
        : nextSchedule.length > 0
        ? "Kein Termin im Stundenplan ausgewählt"
        : unscheduledRoom
        ? `Uhrzeit fehlt · ${unscheduledRoom}`
        : detailModule.schedule.length > 0
        ? undefined
        : detailModule.realScheduleLabel;

    const defaultLocalizedIntro = getLocalizedModuleIntroduction(
      { ...detailModule, description: undefined },
      language
    );

    onUpdateModule(detailModule.id, {
      schedule: nextSchedule,
      realScheduleLabel: nextRealScheduleLabel,
      examType: trimmedExamType,
      customExamDateRoom: trimmedExamDateRoom || undefined,
      language: detailLanguage,
      description:
        trimmedDescription && trimmedDescription !== defaultLocalizedIntro
          ? trimmedDescription
          : detailModule.description,
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
        mod.area.toLowerCase().includes(q) ||
        c.areas[mod.area].toLowerCase().includes(q)
      );
    });
  }, [availableModules, searchQuery, areaFilter, languageFilter, c.areas]);

  const regularCp = selectedModules
    .filter((m) => m.area !== "Auflagen")
    .reduce((sum, m) => sum + m.cp, 0);
  const makeupCp = selectedModules
    .filter((m) => m.area === "Auflagen")
    .reduce((sum, m) => sum + m.cp, 0);

  const conflicts = detectScheduleConflicts(selectedModules);

  const wouldConflict = (candidate: DitModule): boolean => {
    if (selectedModuleIds.includes(candidate.id)) return false;
    return getActiveScheduleSlots(candidate).some((slot) =>
      selectedModules.some((existing) =>
        getActiveScheduleSlots(existing).some((es) => doSlotsOverlap(slot, es))
      )
    );
  };

  const resetCustomForm = () => {
    setCustomCode("");
    setCustomTitle("");
    setCustomCp("6");
    setCustomArea("Profil DITraM");
    setCustomLanguage("Deutsch");
    setCustomSessionType("Vorlesung");
    setCustomDay("");
    setCustomStartTime("10:00");
    setCustomEndTime("12:00");
    setCustomRoom("");
    setCustomExamType("");
    setCustomExamDateRoom("");
    setCustomFormError("");
  };

  const handleCreateCustomModule = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = customTitle.trim();
    if (!trimmedTitle) {
      setCustomFormError(t.customForm.errMissingTitle);
      return;
    }

    let schedule: ScheduleSlot[] = [];
    let realScheduleLabel: string | undefined;
    const trimmedRoom = customRoom.trim();

    if (customDay) {
      const startMin = parseTimeToMinutes(customStartTime);
      const endMin = parseTimeToMinutes(customEndTime);
      if (startMin === null || endMin === null || endMin <= startMin) {
        setCustomFormError(t.customForm.errInvalidTime);
        return;
      }
      schedule = [
        {
          id: `custom-slot-${Date.now()}`,
          day: customDay,
          startHour: minutesToDecimalHour(startMin),
          endHour: minutesToDecimalHour(endMin),
          startTime: customStartTime,
          endTime: customEndTime,
          room: trimmedRoom || "Raum fehlt",
          sessionType: customSessionType,
          selected: true,
        },
      ];
      const typeSuffix =
        customSessionType !== "Vorlesung" ? ` (${customSessionType})` : "";
      realScheduleLabel = `${customDay} ${customStartTime}–${customEndTime}${typeSuffix} · ${
        trimmedRoom || "Raum fehlt"
      }`;
    } else if (trimmedRoom) {
      realScheduleLabel = `Uhrzeit fehlt · ${trimmedRoom}`;
    }

    const parsedCp = Math.max(1, Math.min(30, Number(customCp) || 6));
    const trimmedCode = (customCode.trim() || "EIGEN").toUpperCase();
    const trimmedExamType =
      customExamType.trim() || "Nach Modulhandbuch / Dozentenangabe";
    const trimmedExamDateRoom = customExamDateRoom.trim();

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
      {/* Compact Status Bar + Profile Status Strip */}
      <div className="space-y-2.5 pb-3 border-b border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 min-w-0">
            {conflicts.length > 0 && (
              <>
                <span className="inline-flex items-center gap-1.5 text-red-700 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    {conflicts.length}{" "}
                    {conflicts.length === 1
                      ? t.conflictSingular
                      : t.conflictPlural}
                  </span>
                </span>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
              </>
            )}

            <span
              dir="ltr"
              className="font-mono font-semibold text-teal-800 tabular-nums whitespace-nowrap"
            >
              {regularCp} / {targetEcts} ECTS
            </span>

            {makeupCp > 0 && (
              <span
                dir="ltr"
                className="text-[#ff8000] font-medium tabular-nums whitespace-nowrap"
              >
                {t.makeupAddOn(makeupCp)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                exportTimetablePdf({
                  activeSemester,
                  selectedModules,
                  userProfile,
                  language,
                })
              }
              disabled={selectedModules.length === 0}
              title={
                selectedModules.length === 0
                  ? t.savePdfDisabledTitle
                  : t.savePdfTitle
              }
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-600/35 hover:border-teal-700 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-40 disabled:pointer-events-none"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{t.savePdf}</span>
            </button>

            <button
              type="button"
              onClick={onClearSchedule}
              disabled={selectedModuleIds.length === 0}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clear}</span>
            </button>
          </div>
        </div>

        {/* Kompakte Profil-Statusleiste */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
          {profileDisplay && userProfile ? (
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-slate-700 font-medium whitespace-nowrap max-w-[260px]">
                <span aria-hidden="true" className="shrink-0">
                  🎓
                </span>
                <span className="truncate">
                  {po.bachelorChipPrefix}: {profileDisplay.bachelorOpt.chipLabel}
                </span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-slate-700 font-medium whitespace-nowrap">
                <span aria-hidden="true">🎯</span>
                <span>
                  {po.profileChipPrefix}: {profileDisplay.masterOpt.shortLabel}
                </span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-slate-700 font-medium tabular-nums whitespace-nowrap">
                <span aria-hidden="true">💼</span>
                <span>
                  {userProfile.hasPartTimeJob
                    ? po.partTimeChip(userProfile.jobHoursPerWeek)
                    : po.noJobChip}
                </span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50/70 border border-teal-200/80 text-teal-900 font-medium tabular-nums whitespace-nowrap">
                <span aria-hidden="true">⚖️</span>
                <span>
                  {po.targetChipPrefix}: {profileDisplay.workloadOpt.chipLabel}
                </span>
              </span>
            </div>
          ) : (
            <span className="text-slate-500">{t.emptyProfileStatus}</span>
          )}

          {onOpenProfileModal && (
            <button
              type="button"
              onClick={onOpenProfileModal}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-teal-800 bg-white hover:bg-teal-50 border border-teal-600/35 hover:border-teal-700 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>{t.adjustProfile}</span>
            </button>
          )}
        </div>
      </div>

      {/* Weekly Timetable Grid (Mo–Fr) */}
      <div>
        {selectedModules.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50/70">
            <p className="text-sm font-medium text-slate-800">
              {t.emptyGridTitle(semesterInfo.shortLabel)}
            </p>
            <p className="text-xs text-slate-500 mt-1">{t.emptyGridSubtitle}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
              <table className="w-full min-w-[600px] border-collapse table-fixed">
                <thead>
                  <tr className="bg-teal-50 border-b border-slate-200">
                    <th className="w-20 px-2.5 py-2 text-start text-xs font-semibold text-slate-600">
                      {t.gridTimeCol}
                    </th>
                    {WEEKDAYS.map((day) => (
                      <th
                        key={day}
                        className="px-2 py-2 text-start text-xs font-semibold border-s border-slate-200 text-teal-900"
                      >
                        {c.weekdays[day]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timetableHours.map((hour) => (
                    <tr
                      key={hour}
                      className="border-b border-slate-200 last:border-b-0"
                    >
                      <td className="px-2.5 py-2.5 text-[11px] font-mono text-slate-500 align-top tabular-nums bg-slate-50/50">
                        <div dir="ltr">{String(hour).padStart(2, "0")}:00</div>
                        <div className="text-[10px] text-slate-400">
                          {t.gridTimeUntil(
                            `${String(hour + 2).padStart(2, "0")}:00`
                          )}
                        </div>
                      </td>
                      {WEEKDAYS.map((day) => {
                        const slotKey = `${day}-${hour}`;
                        const cellEntries = selectedModules
                          .flatMap((mod) =>
                            getActiveScheduleSlots(mod)
                              .filter(
                                (s) =>
                                  s.day === day &&
                                  getTimetableBlockHour(s) === hour
                              )
                              .map((slot) => {
                                const range = getSlotTimeRange(slot);
                                const hasConflict = selectedModules.some(
                                  (other) =>
                                    other.id !== mod.id &&
                                    getActiveScheduleSlots(other).some(
                                      (otherSlot) =>
                                        doSlotsOverlap(slot, otherSlot)
                                    )
                                );
                                return { mod, slot, range, hasConflict };
                              })
                          )
                          .sort((a, b) => a.range.startMin - b.range.startMin);

                        const cellHasConflict = cellEntries.some(
                          (entry) => entry.hasConflict
                        );

                        return (
                          <td
                            key={slotKey}
                            className={`p-1.5 border-s border-slate-200 align-top h-[62px] ${
                              cellHasConflict ? "bg-red-50/70" : ""
                            }`}
                          >
                            <div className="space-y-1">
                              {cellEntries.map(
                                ({ mod, slot, range, hasConflict }, idx) => {
                                  const theme = getModuleColorTheme(mod);
                                  const sessionLabel =
                                    c.sessionTypes[slot.sessionType] ??
                                    slot.sessionType;
                                  const roomLabel =
                                    slot.room === "Raum fehlt"
                                      ? c.noRoom
                                      : slot.room;
                                  return (
                                    <div
                                      key={`${mod.id}-${slot.id ?? idx}-${slot.day}-${range.startStr}`}
                                      role="button"
                                      tabIndex={0}
                                      onClick={() => openModuleDetail(mod)}
                                      onKeyDown={(e) => {
                                        if (
                                          e.key === "Enter" ||
                                          e.key === " "
                                        ) {
                                          e.preventDefault();
                                          openModuleDetail(mod);
                                        }
                                      }}
                                      title={t.editSlotTitle(
                                        mod.title,
                                        sessionLabel
                                      )}
                                      className={`group rounded-md px-2 py-1.5 border text-xs cursor-pointer transition-colors ${
                                        hasConflict
                                          ? "bg-white border-red-300 text-red-950"
                                          : theme.gridSlotClass
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-1">
                                        <div className="flex items-center gap-1 min-w-0">
                                          <span
                                            dir="ltr"
                                            className={`font-mono text-[11px] font-semibold truncate ${theme.textClass}`}
                                          >
                                            {mod.code}
                                          </span>
                                          <span
                                            className={`text-[9px] font-semibold px-1 py-0.5 rounded border leading-none shrink-0 ${getSessionBadgeClass(
                                              slot.sessionType
                                            )}`}
                                          >
                                            {sessionLabel}
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleModule(mod.id);
                                          }}
                                          title={t.removeModuleTitle(mod.title)}
                                          className="text-slate-400 hover:text-red-600 rounded transition-colors shrink-0"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                      <div className="font-medium text-[11px] leading-snug line-clamp-1 mt-0.5">
                                        {mod.title}
                                      </div>
                                      <div className="text-[10px] text-slate-600 leading-snug line-clamp-1 mt-0.5 tabular-nums">
                                        <span dir="ltr" className="inline-block">
                                          {range.startStr}–{range.endStr}
                                        </span>{" "}
                                        · {roomLabel}
                                      </div>
                                    </div>
                                  );
                                }
                              )}
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
                  {t.selectedModulesHeading(selectedModules.length)}
                </div>
                <div className="space-y-1.5">
                  {selectedModules.map((mod) => {
                    const theme = getModuleColorTheme(mod);
                    const timeSummary = formatLocalizedScheduleSummary(
                      mod,
                      language
                    );
                    return (
                      <div
                        key={mod.id}
                        onClick={() => openModuleDetail(mod)}
                        className={`flex items-center justify-between gap-2 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-800 cursor-pointer transition-colors ${theme.cardBorderTopClass} ${theme.selectedCardBgClass}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span
                              dir="ltr"
                              className={`font-mono font-semibold shrink-0 ${theme.textClass}`}
                            >
                              {mod.code}
                            </span>
                            <span className="font-medium text-slate-900">
                              {mod.title} ({mod.cp} ECTS)
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 truncate tabular-nums mt-0.5">
                            {timeSummary}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            title={t.editDetailsTitle}
                            className="p-0.5 text-slate-400"
                          >
                            <Pencil className="w-3 h-3" />
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleModule(mod.id);
                            }}
                            title={t.removeModuleTitle(mod.title)}
                            className="p-0.5 text-slate-400 hover:text-red-600 transition-colors shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
              {t.catalogHeading(semesterInfo.shortLabel)}
            </h3>
            <span
              dir="ltr"
              className="text-xs text-slate-500 tabular-nums"
            >
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
                <span>{t.cancel}</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addCustomModule}</span>
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
                {t.newModuleHeading(semesterInfo.shortLabel)}
              </h4>
              <span className="text-[11px] text-slate-500">
                {t.missingScheduleHint}
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
                  {t.customForm.code}
                </label>
                <input
                  id="custom-code"
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder={t.customForm.codePlaceholder}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-7">
                <label
                  htmlFor="custom-title"
                  className="block text-[11px] font-medium text-slate-700 mb-1"
                >
                  {t.customForm.title}
                </label>
                <input
                  id="custom-title"
                  type="text"
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={t.customForm.titlePlaceholder}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="custom-cp"
                  className="block text-[11px] font-medium text-slate-700 mb-1"
                >
                  {t.customForm.ects}
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
                  {t.customForm.area}
                </label>
                <select
                  id="custom-area"
                  value={customArea}
                  onChange={(e) => setCustomArea(e.target.value as ModuleArea)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                >
                  {CUSTOM_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {c.areas[area]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="custom-lang"
                  className="block text-[11px] font-medium text-slate-700 mb-1"
                >
                  {t.customForm.language}
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
                      {c.teachingLanguages[lang]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="custom-session-type"
                  className="block text-[11px] font-medium text-slate-700 mb-1"
                >
                  {t.customForm.sessionType}
                </label>
                <select
                  id="custom-session-type"
                  value={customSessionType}
                  onChange={(e) =>
                    setCustomSessionType(e.target.value as SessionType)
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                >
                  {SESSION_TYPES.map((st) => (
                    <option key={st} value={st}>
                      {c.sessionTypes[st]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="custom-day"
                  className="block text-[11px] font-medium text-slate-700 mb-1"
                >
                  {t.customForm.weekdayOptional}
                </label>
                <select
                  id="custom-day"
                  value={customDay}
                  onChange={(e) =>
                    setCustomDay(e.target.value as "" | Weekday)
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                >
                  <option value="">{t.customForm.noDayOption}</option>
                  {WEEKDAYS.map((d) => (
                    <option key={d} value={d}>
                      {c.weekdays[d]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="custom-start-time"
                  className="block text-[11px] font-medium text-slate-700 mb-1"
                >
                  {t.customForm.startFree}
                </label>
                <input
                  id="custom-start-time"
                  type="time"
                  value={customStartTime}
                  onChange={(e) => setCustomStartTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="custom-end-time"
                  className="block text-[11px] font-medium text-slate-700 mb-1"
                >
                  {t.customForm.endFree}
                </label>
                <input
                  id="custom-end-time"
                  type="time"
                  value={customEndTime}
                  onChange={(e) => setCustomEndTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-12">
                <label
                  htmlFor="custom-room"
                  className="block text-[11px] font-medium text-slate-700 mb-1"
                >
                  {t.customForm.roomOptional}
                </label>
                <input
                  id="custom-room"
                  type="text"
                  value={customRoom}
                  onChange={(e) => setCustomRoom(e.target.value)}
                  placeholder={t.customForm.roomPlaceholder}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="custom-exam-type"
                  className="block text-[11px] font-medium text-slate-700 mb-1"
                >
                  {t.customForm.examTypeOptional}
                </label>
                <input
                  id="custom-exam-type"
                  type="text"
                  value={customExamType}
                  onChange={(e) => setCustomExamType(e.target.value)}
                  placeholder={t.customForm.examTypePlaceholder}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="custom-exam-date"
                  className="block text-[11px] font-medium text-slate-700 mb-1"
                >
                  {t.customForm.examDateOptional}
                </label>
                <input
                  id="custom-exam-date"
                  type="text"
                  value={customExamDateRoom}
                  onChange={(e) => setCustomExamDateRoom(e.target.value)}
                  placeholder={t.customForm.examDatePlaceholder}
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
                {t.cancel}
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.customForm.saveAndAdd}</span>
              </button>
            </div>
          </form>
        )}

        {/* Search & Language Filter Row */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full ps-9 pe-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/15"
            />
          </div>

          <select
            aria-label={t.languageFilterAria}
            value={languageFilter}
            onChange={(e) =>
              setLanguageFilter(e.target.value as LanguageFilter)
            }
            className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-700 focus:border-teal-700 focus:outline-none"
          >
            <option value="Alle">{t.languageFilterOptions.all}</option>
            <option value="Englisch">{t.languageFilterOptions.english}</option>
            <option value="Deutsch">{t.languageFilterOptions.german}</option>
            <option value="Sprachbrücke">
              {t.languageFilterOptions.bridge}
            </option>
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
                <span>{c.areaFilters[opt.value]}</span>
              </button>
            );
          })}
        </div>

        {/* Clean Module List with Legend Colors (Click card for Detail Pop-up) */}
        {filteredModules.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50/70">
            <p className="text-sm font-medium text-slate-800">
              {t.noModulesFound}
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
              {t.resetFilters}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredModules.map((mod) => {
              const isSelected = selectedModuleIds.includes(mod.id);
              const conflict = wouldConflict(mod);
              const timeSummary = formatLocalizedScheduleSummary(
                mod,
                language
              );
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
                  aria-label={t.moduleAriaLabel(mod.code, mod.title)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-3 rounded-lg border border-slate-200 cursor-pointer transition-colors ${
                    theme.cardBorderTopClass
                  } ${
                    isSelected ? theme.selectedCardBgClass : theme.cardBgClass
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span
                        dir="ltr"
                        className={`font-mono text-xs font-bold ${theme.textClass}`}
                      >
                        {mod.code}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {mod.title}
                      </span>
                      <span
                        dir="ltr"
                        className="font-mono text-xs text-slate-600 tabular-nums"
                      >
                        {mod.cp} ECTS
                      </span>
                      {mod.isCustom && (
                        <span className="text-[11px] font-medium text-teal-800">
                          · {t.customModuleBadge}
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
                        <span>{c.areas[mod.area]}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{timeSummary}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {c.teachingLanguages[mod.language] ?? mod.language}
                      </span>
                      {mod.ecampusLanguageMismatch && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span
                            title={mod.languageNote}
                            className="inline-flex items-center gap-1 text-teal-800 font-medium"
                          >
                            <Languages className="w-3 h-3" />
                            <span>{t.languageBridgeBadge}</span>
                          </span>
                        </>
                      )}
                      {conflict && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#ff8000] font-semibold">
                            {t.conflictBadge}
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
                        title={t.deleteCustomTitle(mod.title)}
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
                          <span>{t.selectedBtn}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t.addBtn}</span>
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
                      <span
                        dir="ltr"
                        className={`font-mono font-bold ${theme.textClass}`}
                      >
                        {detailModule.code}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className={`font-semibold ${theme.textClass}`}>
                        {c.areas[detailModule.area]}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span
                        dir="ltr"
                        className="font-mono font-semibold text-slate-700 tabular-nums"
                      >
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
                    aria-label={t.detailModal.closeAria}
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
                      <span>{t.detailModal.introHeading}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {getLocalizedModuleIntroduction(detailModule, language)}
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
                        {t.detailModal.prerequisiteLabel}
                      </strong>{" "}
                      {detailModule.officialPrerequisite}
                    </p>
                  </div>

                  {/* Fehlende Infos hinzufügen oder ändern */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                        <Pencil className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                        <span>{t.detailModal.editSectionHeading}</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddDetailSlot}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{t.detailModal.addSlotBtn}</span>
                      </button>
                    </div>

                    {detailError && (
                      <p className="text-xs font-medium text-red-700">
                        {detailError}
                      </p>
                    )}

                    {/* Terminliste */}
                    <div className="space-y-2.5">
                      {detailSlots.map((slot, idx) => (
                        <div
                          key={slot.id}
                          className={`rounded-lg border p-3 space-y-2.5 transition-colors ${
                            slot.selected
                              ? "border-slate-200 bg-slate-50/70"
                              : "border-slate-200/80 bg-slate-100/60 opacity-80"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                dir="ltr"
                                className="text-[11px] font-mono text-slate-500"
                              >
                                #{idx + 1}
                              </span>
                              <select
                                aria-label={t.detailModal.sessionTypeAria(
                                  idx + 1
                                )}
                                value={slot.sessionType}
                                onChange={(e) =>
                                  handleUpdateDetailSlot(slot.id, {
                                    sessionType: e.target.value as SessionType,
                                  })
                                }
                                className="px-2 py-1 text-xs font-semibold bg-white border border-slate-300 rounded-md text-slate-800 focus:border-teal-700 focus:outline-none"
                              >
                                {SESSION_TYPES.map((typeOption) => (
                                  <option key={typeOption} value={typeOption}>
                                    {c.sessionTypes[typeOption]}
                                  </option>
                                ))}
                                {slot.sessionType === "Übung / Lab" && (
                                  <option value="Übung / Lab">
                                    {c.sessionTypes["Übung / Lab"]}
                                  </option>
                                )}
                              </select>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <label className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-700 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={slot.selected}
                                  onChange={(e) =>
                                    handleUpdateDetailSlot(slot.id, {
                                      selected: e.target.checked,
                                    })
                                  }
                                  className="rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                                />
                                <span>{t.detailModal.inTimetableLabel}</span>
                              </label>

                              <button
                                type="button"
                                onClick={() => handleRemoveDetailSlot(slot.id)}
                                title={
                                  detailSlots.length > 1
                                    ? t.detailModal.removeSlotTitle
                                    : t.detailModal.resetSlotTitle
                                }
                                className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-12 gap-2">
                            <div className="col-span-2 sm:col-span-3">
                              <label
                                htmlFor={`detail-day-${slot.id}`}
                                className="block text-[11px] font-medium text-slate-700 mb-1"
                              >
                                {t.detailModal.weekdayLabel}
                              </label>
                              <select
                                id={`detail-day-${slot.id}`}
                                value={slot.day}
                                onChange={(e) =>
                                  handleUpdateDetailSlot(slot.id, {
                                    day: e.target.value as "" | Weekday,
                                  })
                                }
                                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                              >
                                <option value="">
                                  {t.customForm.noDayOption}
                                </option>
                                {WEEKDAYS.map((d) => (
                                  <option key={d} value={d}>
                                    {c.weekdays[d]}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="col-span-1 sm:col-span-3">
                              <label
                                htmlFor={`detail-start-${slot.id}`}
                                className="block text-[11px] font-medium text-slate-700 mb-1"
                              >
                                {t.detailModal.startLabel}
                              </label>
                              <input
                                id={`detail-start-${slot.id}`}
                                type="time"
                                value={slot.startTime}
                                onChange={(e) =>
                                  handleUpdateDetailSlot(slot.id, {
                                    startTime: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none tabular-nums"
                              />
                            </div>

                            <div className="col-span-1 sm:col-span-3">
                              <label
                                htmlFor={`detail-end-${slot.id}`}
                                className="block text-[11px] font-medium text-slate-700 mb-1"
                              >
                                {t.detailModal.endLabel}
                              </label>
                              <input
                                id={`detail-end-${slot.id}`}
                                type="time"
                                value={slot.endTime}
                                onChange={(e) =>
                                  handleUpdateDetailSlot(slot.id, {
                                    endTime: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none tabular-nums"
                              />
                            </div>

                            <div className="col-span-2 sm:col-span-3">
                              <label
                                htmlFor={`detail-room-${slot.id}`}
                                className="block text-[11px] font-medium text-slate-700 mb-1"
                              >
                                {t.detailModal.roomLabel}
                              </label>
                              <input
                                id={`detail-room-${slot.id}`}
                                type="text"
                                value={slot.room}
                                onChange={(e) =>
                                  handleUpdateDetailSlot(slot.id, {
                                    room: e.target.value,
                                  })
                                }
                                placeholder={t.detailModal.roomPlaceholder}
                                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <p className="text-[11px] text-slate-500">
                        {t.detailModal.slotTip}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      <div className="sm:col-span-6">
                        <label
                          htmlFor="detail-exam-type"
                          className="block text-[11px] font-medium text-slate-700 mb-1"
                        >
                          {t.detailModal.examTypeLabel}
                        </label>
                        <input
                          id="detail-exam-type"
                          type="text"
                          value={detailExamType}
                          onChange={(e) => setDetailExamType(e.target.value)}
                          placeholder={t.customForm.examTypePlaceholder}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-6">
                        <label
                          htmlFor="detail-exam-date"
                          className="block text-[11px] font-medium text-slate-700 mb-1"
                        >
                          {t.detailModal.examDateLabel}
                        </label>
                        <input
                          id="detail-exam-date"
                          type="text"
                          value={detailExamDateRoom}
                          onChange={(e) =>
                            setDetailExamDateRoom(e.target.value)
                          }
                          placeholder={t.customForm.examDatePlaceholder}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-12">
                        <label
                          htmlFor="detail-lang"
                          className="block text-[11px] font-medium text-slate-700 mb-1"
                        >
                          {t.detailModal.teachingLangLabel}
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
                              {c.teachingLanguages[lang]}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-12">
                        <label
                          htmlFor="detail-desc"
                          className="block text-[11px] font-medium text-slate-700 mb-1"
                        >
                          {t.detailModal.notesLabel}
                        </label>
                        <textarea
                          id="detail-desc"
                          rows={3}
                          value={detailDescription}
                          onChange={(e) => setDetailDescription(e.target.value)}
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
                            <span>{t.selectedBtn}</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>{t.addBtn}</span>
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
                          <span>{t.detailModal.resetBtn}</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailModuleId(null)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.detailModal.saveChangesBtn}</span>
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
