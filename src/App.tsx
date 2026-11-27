import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Compass, User } from "lucide-react";
import { AdvisorChat } from "./components/AdvisorChat";
import { ExamsPanel } from "./components/ExamsPanel";
import { ProfileModal } from "./components/ProfileModal";
import { TimetablePanel } from "./components/TimetablePanel";
import {
  DIT_MODULES,
  SEMESTER_INFOS,
  type DitModule,
  type SemesterId,
} from "./data/ditCatalog";
import {
  getProfileDisplayParts,
  getTargetEctsForProfile,
  sanitizeUserProfile,
  type UserProfile,
} from "./types/userProfile";

type DashboardTab = "timetable" | "exams";

const STORAGE_KEYS = {
  selectedModulesBySem: "dr_raccoon_dit_selected_modules_v3",
  completedMakeup: "dr_raccoon_dit_completed_makeup_v2",
  customModules: "dr_raccoon_dit_custom_modules_v1",
  moduleOverrides: "dr_raccoon_dit_module_overrides_v1",
  lastExamFinished: "dr_raccoon_dit_last_exam_finished_v1",
  activeSemester: "dr_raccoon_dit_active_semester_v1",
  userProfile: "dr_raccoon_dit_user_profile_v1",
};

function readStoredStringArray(key: string, fallback: string[]): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : fallback;
  } catch {
    return fallback;
  }
}

const EMPTY_SELECTED_BY_SEMESTER: Record<SemesterId, string[]> = {
  wise2627: [],
  sose27: [],
};

function normalizeLegacyArea(mod: DitModule): DitModule {
  if ((mod.area as string) === "Pflichtbereich") {
    return {
      ...mod,
      area: mod.code.toUpperCase().startsWith("WI-")
        ? "Wirtschaftsinformatik Pflicht"
        : "BWL Pflicht",
    };
  }
  return mod;
}

function readStoredCustomModules(): DitModule[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.customModules);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (m): m is DitModule =>
          Boolean(m) &&
          typeof m === "object" &&
          typeof (m as DitModule).id === "string" &&
          typeof (m as DitModule).title === "string"
      )
      .map(normalizeLegacyArea);
  } catch {
    return [];
  }
}

function readStoredModuleOverrides(): Record<string, Partial<DitModule>> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.moduleOverrides);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed as Record<string, Partial<DitModule>>;
  } catch {
    return {};
  }
}

function readStoredUserProfile(): UserProfile | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.userProfile);
    if (!raw) return null;
    return sanitizeUserProfile(JSON.parse(raw));
  } catch {
    return null;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("timetable");
  const [activeSemester, setActiveSemester] = useState<SemesterId>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEYS.activeSemester);
      return saved === "sose27" ? "sose27" : "wise2627";
    } catch {
      return "wise2627";
    }
  });
  const [lastExamFinished, setLastExamFinished] = useState<boolean>(() => {
    try {
      return (
        window.localStorage.getItem(STORAGE_KEYS.lastExamFinished) === "true"
      );
    } catch {
      return false;
    }
  });
  const [selectedBySemester, setSelectedBySemester] = useState<
    Record<SemesterId, string[]>
  >(() => ({
    wise2627: [...EMPTY_SELECTED_BY_SEMESTER.wise2627],
    sose27: [...EMPTY_SELECTED_BY_SEMESTER.sose27],
  }));
  const [completedMakeupIds, setCompletedMakeupIds] = useState<string[]>(() =>
    readStoredStringArray(STORAGE_KEYS.completedMakeup, [])
  );
  const [customModules, setCustomModules] = useState<DitModule[]>(() =>
    readStoredCustomModules()
  );
  const [moduleOverrides, setModuleOverrides] = useState<
    Record<string, Partial<DitModule>>
  >(() => readStoredModuleOverrides());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() =>
    readStoredUserProfile()
  );
  const [showProfileModal, setShowProfileModal] = useState(false);

  const dashboardDetailRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.title =
      activeTab === "timetable"
        ? "Stundenplan · Dr. Raccoon (Master DIT, Uni Kassel)"
        : "Prüfungsübersicht · Dr. Raccoon (Master DIT, Uni Kassel)";
  }, [activeTab]);

  useEffect(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEYS.selectedModulesBySem);
    } catch {
      // ignore storage quota errors
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.completedMakeup,
        JSON.stringify(completedMakeupIds)
      );
    } catch {
      // ignore storage quota errors
    }
  }, [completedMakeupIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.customModules,
        JSON.stringify(customModules)
      );
    } catch {
      // ignore storage quota errors
    }
  }, [customModules]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.moduleOverrides,
        JSON.stringify(moduleOverrides)
      );
    } catch {
      // ignore storage quota errors
    }
  }, [moduleOverrides]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.lastExamFinished,
        String(lastExamFinished)
      );
    } catch {
      // ignore storage quota errors
    }
  }, [lastExamFinished]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.activeSemester, activeSemester);
    } catch {
      // ignore storage quota errors
    }
  }, [activeSemester]);

  useEffect(() => {
    try {
      if (userProfile) {
        window.localStorage.setItem(
          STORAGE_KEYS.userProfile,
          JSON.stringify(userProfile)
        );
      } else {
        window.localStorage.removeItem(STORAGE_KEYS.userProfile);
      }
    } catch {
      // ignore storage quota errors
    }
  }, [userProfile]);

  const allModules = useMemo(
    () =>
      [...DIT_MODULES, ...customModules].map((m) =>
        moduleOverrides[m.id] ? { ...m, ...moduleOverrides[m.id] } : m
      ),
    [customModules, moduleOverrides]
  );

  const selectedModuleIds = selectedBySemester[activeSemester];

  const selectDashboardTab = (target: DashboardTab) => {
    setActiveTab(target);
    requestAnimationFrame(() => {
      dashboardDetailRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const toggleModule = (moduleId: string) => {
    setSelectedBySemester((prev) => {
      const currentList = prev[activeSemester];
      const nextList = currentList.includes(moduleId)
        ? currentList.filter((id) => id !== moduleId)
        : [...currentList, moduleId];
      return { ...prev, [activeSemester]: nextList };
    });
  };

  const handleApplySuggestedModules = (suggestedIds: string[]) => {
    const validIds = Array.from(
      new Set(
        suggestedIds.filter((id) => allModules.some((m) => m.id === id))
      )
    );
    if (validIds.length === 0) return;
    setSelectedBySemester((prev) => ({
      ...prev,
      [activeSemester]: validIds,
    }));
  };

  const handleAddCustomModule = (newModule: DitModule) => {
    setCustomModules((prev) => [...prev, newModule]);
    setSelectedBySemester((prev) => ({
      ...prev,
      [activeSemester]: [...prev[activeSemester], newModule.id],
    }));
  };

  const handleDeleteCustomModule = (moduleId: string) => {
    setCustomModules((prev) => prev.filter((m) => m.id !== moduleId));
    setSelectedBySemester((prev) => ({
      wise2627: prev.wise2627.filter((id) => id !== moduleId),
      sose27: prev.sose27.filter((id) => id !== moduleId),
    }));
    setCompletedMakeupIds((prev) => prev.filter((id) => id !== moduleId));
    setModuleOverrides((prev) => {
      const next = { ...prev };
      delete next[moduleId];
      return next;
    });
  };

  const handleUpdateModule = (moduleId: string, patch: Partial<DitModule>) => {
    setModuleOverrides((prev) => ({
      ...prev,
      [moduleId]: { ...(prev[moduleId] ?? {}), ...patch },
    }));
  };

  const handleResetModuleOverride = (moduleId: string) => {
    setModuleOverrides((prev) => {
      const next = { ...prev };
      delete next[moduleId];
      return next;
    });
  };

  const toggleCompletedMakeup = (moduleId: string) => {
    setCompletedMakeupIds((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const clearSchedule = () => {
    setSelectedBySemester((prev) => ({
      ...prev,
      [activeSemester]: [],
    }));
  };

  const jumpToNextSemester = () => {
    if (!lastExamFinished) return;
    setActiveSemester("sose27");
  };

  const jumpToCurrentSemester = () => {
    setActiveSemester("wise2627");
  };

  const activeSemesterModules = allModules.filter(
    (m) =>
      (m.semester === activeSemester ||
        m.semester === "alle" ||
        m.area === "Auflagen") &&
      selectedModuleIds.includes(m.id)
  );
  const currentSemesterRegularCp = activeSemesterModules
    .filter((m) => m.area !== "Auflagen")
    .reduce((sum, m) => sum + m.cp, 0);

  const wiseCompletedCp =
    activeSemester === "sose27"
      ? allModules
          .filter(
            (m) =>
              (m.semester === "wise2627" || m.semester === "alle") &&
              m.area !== "Auflagen" &&
              selectedBySemester.wise2627.includes(m.id)
          )
          .reduce((sum, m) => sum + m.cp, 0)
      : 0;

  const totalMasterCp = wiseCompletedCp + currentSemesterRegularCp;
  const semesterInfo = SEMESTER_INFOS[activeSemester];
  const targetSemesterEcts = getTargetEctsForProfile(userProfile);
  const profileDisplay = userProfile ? getProfileDisplayParts(userProfile) : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation Bar (always visible on desktop, tablet & mobile) */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 h-16 sm:h-[72px] flex items-center justify-between lg:grid lg:grid-cols-12 lg:gap-5">
          <div className="flex items-center shrink-0 lg:col-span-5 lg:justify-start lg:pl-[29px]">
            <a
              href="#top"
              aria-label="Dr. Raccoon – Startseite"
              className="flex items-center shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 rounded-md"
            >
              <img
                src="/assets/aistudio/raccoon_4_d26df235.jpeg"
                alt="Dr. Raccoon Logo"
                referrerPolicy="no-referrer"
                className="h-10 sm:h-14 w-auto object-contain"
              />
            </a>
          </div>

          <nav
            aria-label="Hauptnavigation"
            className="flex flex-1 items-center justify-end gap-3 sm:gap-6 min-w-0 lg:col-span-7 lg:px-[21px]"
          >
            <div className="flex items-center gap-2.5 sm:gap-5">
              <button
                type="button"
                onClick={() => selectDashboardTab("timetable")}
                className={`text-xs sm:text-sm hover:text-teal-800 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-1.5 ${
                  activeTab === "timetable"
                    ? "text-teal-800 font-semibold underline decoration-2 underline-offset-4"
                    : "text-slate-600 font-medium"
                }`}
              >
                Stundenplan
              </button>

              <button
                type="button"
                onClick={() => selectDashboardTab("exams")}
                className={`text-xs sm:text-sm hover:text-teal-800 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-1.5 ${
                  activeTab === "exams"
                    ? "text-teal-800 font-semibold underline decoration-2 underline-offset-4"
                    : "text-slate-600 font-medium"
                }`}
              >
                Prüfungsübersicht
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              title={
                profileDisplay
                  ? "Gespeichertes Studienprofil bearbeiten"
                  : "Studienprofil einrichten"
              }
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg border text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                profileDisplay
                  ? "bg-teal-50 text-teal-900 border-teal-300 hover:bg-teal-100"
                  : "bg-teal-700 text-white border-teal-700 hover:bg-teal-800"
              }`}
            >
              {profileDisplay ? (
                <>
                  <span aria-hidden="true" className="shrink-0">
                    🎓
                  </span>
                  <span className="truncate max-w-[175px] sm:max-w-[300px] tabular-nums">
                    {profileDisplay.buttonSummary}
                  </span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span>Mein Profil</span>
                </>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Split Workspace */}
      <main
        id="top"
        className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-6 py-4"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Dr. Raccoon Interactive AI Study Advisor */}
          <div className="lg:col-span-5 lg:sticky lg:top-[88px]">
            <AdvisorChat
              activeSemester={activeSemester}
              allModules={allModules}
              selectedModuleIds={selectedModuleIds}
              completedMakeupIds={completedMakeupIds}
              customModules={customModules}
              moduleOverrides={moduleOverrides}
              userProfile={userProfile}
              onOpenProfileModal={() => setShowProfileModal(true)}
              onApplySuggestedModules={handleApplySuggestedModules}
            />
          </div>

          {/* Right Column: Active View Content Only */}
          <div className="lg:col-span-7">
            <section
              ref={dashboardDetailRef}
              aria-label={
                activeTab === "timetable" ? "Stundenplan" : "Prüfungsübersicht"
              }
              className="scroll-mt-[64px] sm:scroll-mt-[72px] min-h-[calc(100vh-104px)] bg-white border border-teal-700/25 rounded-xl overflow-hidden"
            >
              {/* Single Active View Title Header */}
              <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-teal-700 border-b border-teal-800 text-white">
                <div className="flex items-center gap-2 min-w-0">
                  {activeTab === "timetable" ? (
                    <CalendarDays className="w-4 h-4 shrink-0" />
                  ) : (
                    <Compass className="w-4 h-4 shrink-0" />
                  )}
                  <h1 className="text-sm sm:text-base font-bold tracking-tight truncate">
                    {activeTab === "timetable"
                      ? `Stundenplan · ${semesterInfo.shortLabel}`
                      : `Prüfungsübersicht · ${semesterInfo.shortLabel}`}
                  </h1>
                </div>

                <span className="text-xs text-teal-50 whitespace-nowrap shrink-0">
                  {semesterInfo.isCurrent
                    ? "Aktuelles Semester"
                    : "Nächstes Semester"}
                </span>
              </div>

              {/* Active Page Content */}
              <div className="p-4 sm:p-5">
                {activeTab === "timetable" && (
                  <TimetablePanel
                    activeSemester={activeSemester}
                    allModules={allModules}
                    selectedModuleIds={selectedModuleIds}
                    moduleOverrides={moduleOverrides}
                    userProfile={userProfile}
                    onOpenProfileModal={() => setShowProfileModal(true)}
                    onToggleModule={toggleModule}
                    onAddCustomModule={handleAddCustomModule}
                    onUpdateModule={handleUpdateModule}
                    onResetModuleOverride={handleResetModuleOverride}
                    onDeleteCustomModule={handleDeleteCustomModule}
                    onClearSchedule={clearSchedule}
                  />
                )}

                {activeTab === "exams" && (
                  <ExamsPanel
                    activeSemester={activeSemester}
                    allModules={allModules}
                    selectedModuleIds={selectedModuleIds}
                    completedMakeupIds={completedMakeupIds}
                    onToggleCompletedMakeup={toggleCompletedMakeup}
                    wiseCompletedCp={wiseCompletedCp}
                    currentSemesterRegularCp={currentSemesterRegularCp}
                    totalMasterCp={totalMasterCp}
                    targetSemesterEcts={targetSemesterEcts}
                    lastExamFinished={lastExamFinished}
                    onToggleLastExamFinished={() =>
                      setLastExamFinished((prev) => !prev)
                    }
                    onJumpToNextSemester={jumpToNextSemester}
                    onJumpToCurrentSemester={jumpToCurrentSemester}
                    onGoToTimetable={() => selectDashboardTab("timetable")}
                  />
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <ProfileModal
        isOpen={showProfileModal}
        savedProfile={userProfile}
        onClose={() => setShowProfileModal(false)}
        onSave={(nextProfile) => setUserProfile(nextProfile)}
        onReset={() => setUserProfile(null)}
      />
    </div>
  );
}
