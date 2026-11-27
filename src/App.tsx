import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, CalendarDays, Compass, ExternalLink } from "lucide-react";
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
  const [activeSection, setActiveSection] = useState<DashboardTab | null>(null);
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
  const [isScrolled, setIsScrolled] = useState(false);

  const timetableSectionRef = useRef<HTMLElement>(null);
  const examsSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
      const timetableEl = timetableSectionRef.current;
      const examsEl = examsSectionRef.current;
      if (!timetableEl || !examsEl) return;

      const triggerY = 160;
      const timetableRect = timetableEl.getBoundingClientRect();
      const examsRect = examsEl.getBoundingClientRect();
      const isAtPageBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 24;

      if (
        examsRect.top <= triggerY ||
        (isAtPageBottom && examsRect.top < window.innerHeight * 0.75)
      ) {
        setActiveSection("exams");
      } else if (timetableRect.top <= triggerY) {
        setActiveSection("timetable");
      } else {
        setActiveSection(null);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (activeSection === "timetable") {
      document.title = "Stundenplan · Dr. Raccoon (Master DIT, Uni Kassel)";
    } else if (activeSection === "exams") {
      document.title =
        "Prüfungsübersicht · Dr. Raccoon (Master DIT, Uni Kassel)";
    } else {
      document.title = "Dr. Raccoon · Master DIT, Uni Kassel";
    }
  }, [activeSection]);

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
    setActiveSection(target);
    const targetRef =
      target === "timetable" ? timetableSectionRef : examsSectionRef;
    requestAnimationFrame(() => {
      targetRef.current?.scrollIntoView({
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
    <div className="min-h-screen flex flex-col bg-teal-700 text-slate-900">
      {/* Top Navigation Bar (seamless at top, subtle shadow once scrolled) */}
      <header
        className={`fixed top-0 inset-x-0 z-40 bg-white transition-shadow duration-200 ${
          isScrolled
            ? "shadow-md shadow-slate-900/10 border-b border-slate-200/80"
            : ""
        }`}
      >
        <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
          <div className="flex items-center shrink-0">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              aria-label="Dr. Raccoon – Startseite"
              className="flex items-center shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 rounded-md"
            >
              <img
                src="/assets/aistudio/raccoon_logo_transparent.png"
                alt="Dr. Raccoon Logo"
                referrerPolicy="no-referrer"
                className="h-9 sm:h-11 w-auto object-contain"
              />
            </a>
          </div>

          <nav
            aria-label="Hauptnavigation"
            className="flex flex-1 items-center justify-end gap-3 sm:gap-6 min-w-0 pr-[14px] sm:pr-0"
          >
            <div className="flex items-center gap-2.5 sm:gap-5">
              <button
                type="button"
                onClick={() => selectDashboardTab("timetable")}
                className={`text-xs sm:text-sm hover:text-teal-800 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-1.5 ${
                  activeSection === "timetable"
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
                  activeSection === "exams"
                    ? "text-teal-800 font-semibold underline decoration-2 underline-offset-4"
                    : "text-slate-600 font-medium"
                }`}
              >
                Prüfungsübersicht
              </button>
            </div>

            {profileDisplay && (
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                title="Profil bearbeiten"
                aria-label={`Profil bearbeiten: ${profileDisplay.buttonSummary}`}
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg border text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 bg-teal-50 text-teal-900 border-teal-300 hover:bg-teal-100"
              >
                <span aria-hidden="true" className="shrink-0">
                  🎓
                </span>
                <span className="truncate max-w-[175px] sm:max-w-[300px] tabular-nums">
                  {profileDisplay.buttonSummary}
                </span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Stacked Workspace (Dialogfeld above, Stundenplan / Prüfungsübersicht below) */}
      <main
        id="top"
        className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 pt-[68px] sm:pt-[76px] pb-12"
      >
        <div className="flex flex-col gap-6">
          {/* Top Block: Dr. Raccoon Interactive AI Study Advisor */}
          <div>
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

          {/* Visual Bridge: Connects centered Chatbot canvas with full-width Stundenplan card */}
          <div className="flex items-center gap-3 sm:gap-4 px-1">
            <div className="h-px flex-1 bg-white/20" />
            <button
              type="button"
              onClick={() => selectDashboardTab("timetable")}
              className="inline-flex items-center gap-2 text-xs font-medium text-teal-50/90 hover:text-white transition-colors whitespace-nowrap group"
            >
              <ArrowDown className="w-3.5 h-3.5 text-[#F8DAC5] group-hover:translate-y-0.5 transition-transform" />
              <span>
                Semesterplanung &amp; Kurswahl ({semesterInfo.shortLabel}) ·{" "}
                <span className="tabular-nums font-semibold text-white">
                  {currentSemesterRegularCp} / {targetSemesterEcts} ECTS
                </span>
              </span>
            </button>
            <div className="h-px flex-1 bg-white/20" />
          </div>

          {/* Second Block: Stundenplan */}
          <div>
            <section
              ref={timetableSectionRef}
              aria-label="Stundenplan"
              className="scroll-mt-[68px] sm:scroll-mt-[76px] bg-white rounded-2xl overflow-hidden shadow-lg shadow-teal-950/20"
            >
              <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-slate-50/70 border-b border-slate-200 text-slate-900">
                <div className="flex items-center gap-2 min-w-0">
                  <CalendarDays className="w-4 h-4 text-teal-700 shrink-0" />
                  <h1 className="text-sm sm:text-base font-bold tracking-tight text-teal-900 truncate">
                    Stundenplan · {semesterInfo.shortLabel}
                  </h1>
                </div>

                <span className="text-xs font-medium text-slate-500 whitespace-nowrap shrink-0">
                  {semesterInfo.isCurrent
                    ? "Aktuelles Semester"
                    : "Nächstes Semester"}
                </span>
              </div>

              <div className="p-4 sm:p-5">
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
              </div>
            </section>
          </div>

          {/* Third Block: Prüfungsübersicht */}
          <div>
            <section
              ref={examsSectionRef}
              aria-label="Prüfungsübersicht"
              className="scroll-mt-[68px] sm:scroll-mt-[76px] bg-white rounded-2xl overflow-hidden shadow-lg shadow-teal-950/20"
            >
              <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-slate-50/70 border-b border-slate-200 text-slate-900">
                <div className="flex items-center gap-2 min-w-0">
                  <Compass className="w-4 h-4 text-teal-700 shrink-0" />
                  <h2 className="text-sm sm:text-base font-bold tracking-tight text-teal-900 truncate">
                    Prüfungsübersicht · {semesterInfo.shortLabel}
                  </h2>
                </div>

                <span className="text-xs font-medium text-slate-500 whitespace-nowrap shrink-0">
                  {semesterInfo.isCurrent
                    ? "Aktuelles Semester"
                    : "Nächstes Semester"}
                </span>
              </div>

              <div className="p-4 sm:p-5">
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
                  userProfile={userProfile}
                  lastExamFinished={lastExamFinished}
                  onToggleLastExamFinished={() =>
                    setLastExamFinished((prev) => !prev)
                  }
                  onJumpToNextSemester={jumpToNextSemester}
                  onJumpToCurrentSemester={jumpToCurrentSemester}
                  onGoToTimetable={() => selectDashboardTab("timetable")}
                />
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="w-full bg-white text-slate-700">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-8 sm:py-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-7 md:gap-6">
            {/* Column 1: About & Module Context */}
            <div className="md:col-span-5 space-y-2.5">
              <div className="flex items-baseline gap-2.5">
                <span className="font-logo text-xl text-teal-700">
                  Dr. Raccoon
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  KI-Studienberatung
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-600 max-w-sm">
                Digitale Semesterplanung, Modulauswahl und Prüfungsübersicht für
                den Masterstudiengang Digitale Innovation und Transformation an
                der Universität Kassel.
              </p>
              <p className="pt-1 text-xs font-semibold text-teal-800">
                Modul: Prompt Engineering · Universität Kassel
              </p>
            </div>

            {/* Column 2: Official Documents & Sources */}
            <div className="md:col-span-4 space-y-2.5 pt-4 border-t border-slate-100 md:pt-0 md:border-t-0">
              <div className="md:flex md:items-baseline">
                <span
                  aria-hidden="true"
                  className="hidden md:inline-block font-logo text-xl w-0 overflow-hidden select-none"
                >
                  {"\u200B"}
                </span>
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Offizielle Unterlagen (FB 07)
                </h2>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li>
                  <a
                    href="/assets/aistudio/SVP_FB07_MA_Digitale_Innovation_Transformation_WiSe_final_b110cdf1.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-teal-700 hover:underline underline-offset-2 transition-colors"
                  >
                    <span>Studienverlaufsplan (WiSe 2026/27)</span>
                    <ExternalLink className="w-3 h-3 shrink-0 text-slate-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="/assets/aistudio/Fachpru_fungsordnung_FB07_DIT_Ma_PO-2025_ver_39c84c07.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-teal-700 hover:underline underline-offset-2 transition-colors"
                  >
                    <span>Fachprüfungsordnung (PO 2025)</span>
                    <ExternalLink className="w-3 h-3 shrink-0 text-slate-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="/assets/aistudio/Empfehlung_Kurse_zur_Erfu_llung_von_Auflagen_im_Studium_4f4bc382.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-teal-700 hover:underline underline-offset-2 transition-colors"
                  >
                    <span>Kursempfehlung für Auflagen (§ 6 FPO)</span>
                    <ExternalLink className="w-3 h-3 shrink-0 text-slate-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="/assets/aistudio/Vorstellung_Master_DIT_2026_final_db4d677e.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-teal-700 hover:underline underline-offset-2 transition-colors"
                  >
                    <span>Studiengangsvorstellung Master DIT</span>
                    <ExternalLink className="w-3 h-3 shrink-0 text-slate-400" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Quick Navigation */}
            <div className="md:col-span-3 space-y-2.5 pt-4 border-t border-slate-100 md:pt-0 md:border-t-0">
              <div className="md:flex md:items-baseline">
                <span
                  aria-hidden="true"
                  className="hidden md:inline-block font-logo text-xl w-0 overflow-hidden select-none"
                >
                  {"\u200B"}
                </span>
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Schnellzugriff
                </h2>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="hover:text-teal-700 hover:underline underline-offset-2 transition-colors text-left"
                  >
                    KI-Studienberatung
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => selectDashboardTab("timetable")}
                    className="hover:text-teal-700 hover:underline underline-offset-2 transition-colors text-left"
                  >
                    Stundenplan &amp; Kurswahl
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => selectDashboardTab("exams")}
                    className="hover:text-teal-700 hover:underline underline-offset-2 transition-colors text-left"
                  >
                    Prüfungsübersicht &amp; ECTS
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(true)}
                    className="hover:text-teal-700 hover:underline underline-offset-2 transition-colors text-left"
                  >
                    Studienprofil anpassen
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-7 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>
              Universität Kassel · Master DIT · Modul: Prompt Engineering
            </span>
            <span>
              Unverbindliche Planungshilfe – verbindliche Zeiten &amp; Fristen in
              eCampus/HISPOS prüfen.
            </span>
          </div>
        </div>
      </footer>

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
