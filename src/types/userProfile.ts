export type BachelorBackground =
  | "wirtschaftsinformatik"
  | "wirtschaftswissenschaften"
  | "informationswissenschaften"
  | "software_engineering"
  | "sonstiges";

export type MasterProfileChoice =
  | "undecided"
  | "DITraM"
  | "UCeDI"
  | "CIDA";

export type CurrentStudySemester = 1 | 2 | 3 | 4;

export type WorkloadPreference = "relaxed" | "standard" | "intensive";

export interface UserProfile {
  bachelorBackground: BachelorBackground;
  customBachelorProgram?: string;
  masterProfile: MasterProfileChoice;
  currentSemester: CurrentStudySemester;
  hasPartTimeJob: boolean;
  jobHoursPerWeek: number;
  workloadPreference: WorkloadPreference;
}

export const BACHELOR_BACKGROUND_OPTIONS: Array<{
  value: BachelorBackground;
  label: string;
  shortLabel: string;
  nonTechnical: boolean;
}> = [
  {
    value: "wirtschaftsinformatik",
    label: "Wirtschaftsinformatik",
    shortLabel: "WI",
    nonTechnical: false,
  },
  {
    value: "wirtschaftswissenschaften",
    label: "Wirtschaftswissenschaften",
    shortLabel: "WiWi",
    nonTechnical: true,
  },
  {
    value: "informationswissenschaften",
    label: "Informationswissenschaften",
    shortLabel: "InfoWiss",
    nonTechnical: true,
  },
  {
    value: "software_engineering",
    label: "Software Engineering",
    shortLabel: "SE",
    nonTechnical: false,
  },
  {
    value: "sonstiges",
    label: "Sonstiges",
    shortLabel: "Sonstiges",
    nonTechnical: true,
  },
];

export const MASTER_PROFILE_OPTIONS: Array<{
  value: MasterProfileChoice;
  label: string;
  shortLabel: string;
}> = [
  {
    value: "undecided",
    label: "Noch unentschieden",
    shortLabel: "Unentschieden",
  },
  {
    value: "DITraM",
    label: "DITraM (Digital Transformation Management)",
    shortLabel: "DITraM",
  },
  {
    value: "UCeDI",
    label: "UCeDI (User-Centered Digital Innovation)",
    shortLabel: "UCeDI",
  },
  {
    value: "CIDA",
    label: "CIDA (Computational Intelligence & Data Analytics)",
    shortLabel: "CIDA",
  },
];

export const STUDY_SEMESTER_OPTIONS: Array<{
  value: CurrentStudySemester;
  label: string;
}> = [
  { value: 1, label: "1. Semester" },
  { value: 2, label: "2. Semester" },
  { value: 3, label: "3. Semester" },
  { value: 4, label: "4. Semester (Masterarbeit)" },
];

export const WORKLOAD_PREFERENCE_OPTIONS: Array<{
  value: WorkloadPreference;
  label: string;
  description: string;
  targetEcts: number;
  chipLabel: string;
}> = [
  {
    value: "relaxed",
    label: "Entspannt (~24 ECTS)",
    description: "Mehr Puffer für Nebenjob, Auflagen oder vertieftes Lernen.",
    targetEcts: 24,
    chipLabel: "24 ECTS",
  },
  {
    value: "standard",
    label: "Standard (~30 ECTS)",
    description: "Reguläres Vollzeit-Tempo gemäß Studienverlaufsplan.",
    targetEcts: 30,
    chipLabel: "30 ECTS",
  },
  {
    value: "intensive",
    label: "Intensiv (>30 ECTS, z. B. inkl. Auflagen)",
    description: "Erhöhtes Arbeitspensum z. B. beim Nachholen von Auflagen (§ 6 FPO).",
    targetEcts: 30,
    chipLabel: ">30 ECTS",
  },
];

export const DEFAULT_USER_PROFILE_DRAFT: UserProfile = {
  bachelorBackground: "wirtschaftsinformatik",
  customBachelorProgram: "",
  masterProfile: "undecided",
  currentSemester: 1,
  hasPartTimeJob: false,
  jobHoursPerWeek: 0,
  workloadPreference: "standard",
};

export function getTargetEctsForProfile(profile: UserProfile | null): number {
  if (!profile) return 30;
  return profile.workloadPreference === "relaxed" ? 24 : 30;
}

export function sanitizeUserProfile(raw: unknown): UserProfile | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const obj = raw as Record<string, unknown>;

  let mappedLegacyCustom = "";
  let validBachelor: BachelorBackground | null =
    BACHELOR_BACKGROUND_OPTIONS.some(
      (o) => o.value === obj.bachelorBackground
    )
      ? (obj.bachelorBackground as BachelorBackground)
      : null;

  if (!validBachelor) {
    if (obj.bachelorBackground === "bwl") {
      validBachelor = "wirtschaftswissenschaften";
    } else if (obj.bachelorBackground === "informatik") {
      validBachelor = "wirtschaftsinformatik";
    } else if (obj.bachelorBackground === "ingenieurwesen") {
      validBachelor = "sonstiges";
      mappedLegacyCustom = "Ingenieurwesen";
    }
  }

  const validProfile = MASTER_PROFILE_OPTIONS.some(
    (o) => o.value === obj.masterProfile
  )
    ? (obj.masterProfile as MasterProfileChoice)
    : null;

  const validSemester = STUDY_SEMESTER_OPTIONS.some(
    (o) => o.value === obj.currentSemester
  )
    ? (obj.currentSemester as CurrentStudySemester)
    : null;

  const validWorkload = WORKLOAD_PREFERENCE_OPTIONS.some(
    (o) => o.value === obj.workloadPreference
  )
    ? (obj.workloadPreference as WorkloadPreference)
    : null;

  if (!validBachelor || !validProfile || !validSemester || !validWorkload) {
    return null;
  }

  const hasPartTimeJob = Boolean(obj.hasPartTimeJob);
  const rawHours =
    typeof obj.jobHoursPerWeek === "number" && Number.isFinite(obj.jobHoursPerWeek)
      ? obj.jobHoursPerWeek
      : 0;
  const clampedHours = hasPartTimeJob
    ? Math.max(0, Math.min(20, Math.round(rawHours / 5) * 5))
    : 0;

  const rawCustomProgram =
    validBachelor === "sonstiges" &&
    typeof obj.customBachelorProgram === "string"
      ? obj.customBachelorProgram.trim().slice(0, 120)
      : mappedLegacyCustom;

  return {
    bachelorBackground: validBachelor,
    ...(rawCustomProgram ? { customBachelorProgram: rawCustomProgram } : {}),
    masterProfile: validProfile,
    currentSemester: validSemester,
    hasPartTimeJob,
    jobHoursPerWeek: clampedHours,
    workloadPreference: validWorkload,
  };
}

export function getProfileDisplayParts(profile: UserProfile) {
  const baseBachelorOpt =
    BACHELOR_BACKGROUND_OPTIONS.find(
      (o) => o.value === profile.bachelorBackground
    ) ?? BACHELOR_BACKGROUND_OPTIONS[0];
  const customBachelor =
    profile.bachelorBackground === "sonstiges"
      ? profile.customBachelorProgram?.trim() || ""
      : "";
  const bachelorOpt = customBachelor
    ? {
        ...baseBachelorOpt,
        label: `Sonstiges: ${customBachelor}`,
        chipLabel: customBachelor,
        shortLabel: customBachelor,
      }
    : {
        ...baseBachelorOpt,
        chipLabel: baseBachelorOpt.label,
      };
  const masterOpt =
    MASTER_PROFILE_OPTIONS.find((o) => o.value === profile.masterProfile) ??
    MASTER_PROFILE_OPTIONS[0];
  const semesterOpt =
    STUDY_SEMESTER_OPTIONS.find((o) => o.value === profile.currentSemester) ??
    STUDY_SEMESTER_OPTIONS[0];
  const workloadOpt =
    WORKLOAD_PREFERENCE_OPTIONS.find(
      (o) => o.value === profile.workloadPreference
    ) ?? WORKLOAD_PREFERENCE_OPTIONS[1];

  const jobShort = profile.hasPartTimeJob
    ? `${profile.jobHoursPerWeek}h/Wo.`
    : "0h/Wo.";

  const buttonSummary = `${bachelorOpt.shortLabel} · ${
    masterOpt.value === "undecided" ? "Offen" : masterOpt.shortLabel
  } · ${jobShort}`;

  return {
    bachelorOpt,
    masterOpt,
    semesterOpt,
    workloadOpt,
    jobShort,
    buttonSummary,
  };
}

export function buildUserProfileContextJson(profile: UserProfile | null): string {
  if (!profile) {
    return JSON.stringify(
      {
        profileConfigured: false,
        note: "Der Studierende hat noch kein Studienprofil im Dashboard gespeichert.",
      },
      null,
      2
    );
  }

  const { bachelorOpt, masterOpt, semesterOpt, workloadOpt } =
    getProfileDisplayParts(profile);

  return JSON.stringify(
    {
      profileConfigured: true,
      bachelorBackground: profile.bachelorBackground,
      bachelorBackgroundLabel: bachelorOpt.label,
      customBachelorProgram:
        profile.bachelorBackground === "sonstiges"
          ? profile.customBachelorProgram?.trim() || null
          : null,
      isNonTechnicalBachelor: bachelorOpt.nonTechnical,
      masterProfile: profile.masterProfile,
      masterProfileLabel: masterOpt.label,
      currentSemester: profile.currentSemester,
      currentSemesterLabel: semesterOpt.label,
      hasPartTimeJob: profile.hasPartTimeJob,
      jobHoursPerWeek: profile.jobHoursPerWeek,
      workloadPreference: profile.workloadPreference,
      workloadPreferenceLabel: workloadOpt.label,
      targetEcts: workloadOpt.targetEcts,
    },
    null,
    2
  );
}
