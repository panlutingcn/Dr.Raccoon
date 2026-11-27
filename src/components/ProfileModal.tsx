import React, { useEffect, useRef, useState } from "react";
import {
  Briefcase,
  GraduationCap,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import {
  APP_LANGUAGE_OPTIONS,
  DEFAULT_USER_PROFILE_DRAFT,
  sanitizeAppLanguage,
  type AppLanguage,
  type BachelorBackground,
  type CurrentStudySemester,
  type MasterProfileChoice,
  type UserProfile,
  type WorkloadPreference,
} from "../types/userProfile";
import {
  LANGUAGE_SELECT_LABELS,
  getLanguageDirection,
  getLocalizedProfileOptions,
  getTranslations,
} from "../i18n/translations";

interface ProfileModalProps {
  isOpen: boolean;
  savedProfile: UserProfile | null;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  onReset: () => void;
}

const JOB_HOUR_STEPS = [0, 5, 10, 15, 20];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  savedProfile,
  onClose,
  onSave,
  onReset,
}) => {
  const [draft, setDraft] = useState<UserProfile>(
    savedProfile ?? DEFAULT_USER_PROFILE_DRAFT
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDraft(savedProfile ?? DEFAULT_USER_PROFILE_DRAFT);
      requestAnimationFrame(() => {
        formRef.current?.focus({ preventScroll: true });
      });
    }
  }, [isOpen, savedProfile]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - html.clientWidth;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.paddingRight = prevBodyPaddingRight;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const previewLang: AppLanguage = sanitizeAppLanguage(draft.language);
  const t = getTranslations(previewLang).profileModal;
  const langLabels = LANGUAGE_SELECT_LABELS[previewLang];
  const {
    bachelorOptions,
    masterProfileOptions,
    semesterOptions,
    workloadOptions,
  } = getLocalizedProfileOptions(previewLang);

  const handleTogglePartTimeJob = (enabled: boolean) => {
    setDraft((prev) => ({
      ...prev,
      hasPartTimeJob: enabled,
      jobHoursPerWeek: enabled
        ? prev.jobHoursPerWeek > 0
          ? prev.jobHoursPerWeek
          : 15
        : 0,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedCustomBachelor =
      draft.bachelorBackground === "sonstiges"
        ? draft.customBachelorProgram?.trim() ?? ""
        : "";
    onSave({
      ...draft,
      language: previewLang,
      customBachelorProgram: cleanedCustomBachelor || undefined,
      jobHoursPerWeek: draft.hasPartTimeJob ? draft.jobHoursPerWeek : 0,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="study-profile-modal-title"
      dir={getLanguageDirection(previewLang)}
      onClick={onClose}
      onWheel={(e) => {
        const formEl = formRef.current;
        if (!formEl) return;
        if (!formEl.contains(e.target as Node)) {
          formEl.scrollTop += e.deltaY;
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 overscroll-contain"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-teal-700 text-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <GraduationCap className="w-5 h-5 shrink-0 text-teal-100" />
            <div className="min-w-0">
              <h2
                id="study-profile-modal-title"
                className="text-sm sm:text-base font-bold tracking-tight"
              >
                {t.title}
              </h2>
              <p className="text-xs text-teal-100 mt-0.5 truncate">
                {t.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeAria}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form
          ref={formRef}
          tabIndex={-1}
          onSubmit={handleSubmit}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-4 focus:outline-none"
        >
          {/* 1. Bachelor-Hintergrund */}
          <div className="space-y-2">
            <div>
              <label
                htmlFor="profile-bachelor"
                className="block text-xs font-semibold text-slate-800 mb-1.5"
              >
                {t.fields.bachelor}
              </label>
              <select
                id="profile-bachelor"
                value={draft.bachelorBackground}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    bachelorBackground: e.target.value as BachelorBackground,
                  }))
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/15"
              >
                {bachelorOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {draft.bachelorBackground === "sonstiges" && (
              <div>
                <label
                  htmlFor="profile-bachelor-custom"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  {t.fields.customBachelor}
                </label>
                <input
                  id="profile-bachelor-custom"
                  type="text"
                  maxLength={120}
                  value={draft.customBachelorProgram ?? ""}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      customBachelorProgram: e.target.value,
                    }))
                  }
                  placeholder={t.fields.customBachelorPlaceholder}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/15"
                />
              </div>
            )}
          </div>

          {/* 3. Gewähltes Master-Profil */}
          <div>
            <label
              htmlFor="profile-master"
              className="block text-xs font-semibold text-slate-800 mb-1.5"
            >
              {t.fields.masterProfile}
            </label>
            <select
              id="profile-master"
              value={draft.masterProfile}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  masterProfile: e.target.value as MasterProfileChoice,
                }))
              }
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/15"
            >
              {masterProfileOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Aktuelles Fachsemester */}
          <div>
            <label
              htmlFor="profile-semester"
              className="block text-xs font-semibold text-slate-800 mb-1.5"
            >
              {t.fields.semester}
            </label>
            <select
              id="profile-semester"
              value={draft.currentSemester}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  currentSemester: Number(e.target.value) as CurrentStudySemester,
                }))
              }
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/15"
            >
              {semesterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Nebenjob / Werkstudent (Toggle + Slider) */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <Briefcase className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span>{t.fields.partTimeJob}</span>
              </div>

              <div
                role="group"
                aria-label={t.fields.jobStatusAria}
                className="inline-flex items-center p-0.5 rounded-lg bg-slate-200/80 border border-slate-200"
              >
                <button
                  type="button"
                  onClick={() => handleTogglePartTimeJob(false)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    !draft.hasPartTimeJob
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t.fields.noJob}
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePartTimeJob(true)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    draft.hasPartTimeJob
                      ? "bg-teal-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t.fields.partTimeStudent}
                </button>
              </div>
            </div>

            <div
              className={`space-y-1.5 transition-opacity ${
                draft.hasPartTimeJob ? "opacity-100" : "opacity-50"
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <label
                  htmlFor="profile-job-hours"
                  className="font-medium text-slate-700"
                >
                  {t.fields.hoursPerWeek}
                </label>
                <span
                  dir="ltr"
                  className="font-mono font-semibold text-teal-800 tabular-nums"
                >
                  {draft.hasPartTimeJob ? draft.jobHoursPerWeek : 0}{" "}
                  {t.fields.hoursUnit}
                </span>
              </div>

              <input
                id="profile-job-hours"
                type="range"
                min={0}
                max={20}
                step={5}
                disabled={!draft.hasPartTimeJob}
                value={draft.hasPartTimeJob ? draft.jobHoursPerWeek : 0}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    jobHoursPerWeek: Number(e.target.value),
                  }))
                }
                className="w-full accent-teal-700 cursor-pointer disabled:cursor-not-allowed"
              />

              <div
                dir="ltr"
                className="flex items-center justify-between text-[11px] font-mono text-slate-500 tabular-nums px-0.5"
              >
                {JOB_HOUR_STEPS.map((h) => (
                  <span key={h}>{h}h</span>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Gewünschter Semester-Workload (Radio-Buttons) */}
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold text-slate-800 mb-1">
              {t.fields.workload}
            </legend>
            <div className="space-y-2">
              {workloadOptions.map((opt) => {
                const isSelected = draft.workloadPreference === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 cursor-pointer transition-colors ${
                      isSelected
                        ? "border-teal-700 bg-teal-50/70"
                        : "border-slate-200 bg-white hover:border-teal-600/40 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="workload-preference"
                      value={opt.value}
                      checked={isSelected}
                      onChange={() =>
                        setDraft((prev) => ({
                          ...prev,
                          workloadPreference: opt.value as WorkloadPreference,
                        }))
                      }
                      className="mt-0.5 text-teal-700 focus:ring-teal-700"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900">
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        {opt.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* 6. Sprache */}
          <div>
            <label
              htmlFor="profile-language"
              className="block text-xs font-semibold text-slate-800 mb-1.5"
            >
              {t.fields.language}
            </label>
            <select
              id="profile-language"
              value={previewLang}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  language: sanitizeAppLanguage(e.target.value),
                }))
              }
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/15"
            >
              {APP_LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {langLabels[opt.value]}
                </option>
              ))}
            </select>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
            <div>
              {savedProfile && (
                <button
                  type="button"
                  onClick={() => {
                    onReset();
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.resetBtn}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
              >
                {t.cancelBtn}
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{t.saveBtn}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
