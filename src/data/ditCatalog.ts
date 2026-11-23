export type Weekday = 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr';

export type SemesterId = 'wise2627' | 'sose27';

export type ModuleArea =
  | 'BWL Pflicht'
  | 'Wirtschaftsinformatik Pflicht'
  | 'Weitere Grundlagen (WP)'
  | 'Informatik (WP)'
  | 'Profil DITraM'
  | 'Profil UCeDI'
  | 'Profil CIDA'
  | 'Schlüsselkompetenzen'
  | 'Projektseminar'
  | 'Masterarbeit'
  | 'Auflagen';

export type TeachingLanguage =
  | 'Englisch'
  | 'Deutsch'
  | 'Deutsch (EN-Literatur)';

export interface ScheduleSlot {
  day: Weekday;
  startHour: number;
  endHour: number;
  room: string;
  sessionType: 'Vorlesung' | 'Übung / Lab' | 'Seminar';
}

export interface DitModule {
  id: string;
  semester: SemesterId | 'alle';
  code: string;
  title: string;
  ecampusTitle: string;
  cp: number;
  area: ModuleArea;
  language: TeachingLanguage;
  ecampusLanguageMismatch: boolean;
  languageNote: string;
  examType: string;
  workload: 1 | 2 | 3 | 4 | 5;
  workloadComment: string;
  officialPrerequisite: string;
  studentTip: string;
  learningGoals: string[];
  recommendedFor: Array<'BWL' | 'Informatik' | 'Startup' | 'General'>;
  schedule: ScheduleSlot[];
  realScheduleLabel?: string;
  customExamDateRoom?: string;
  description?: string;
  isCustom?: boolean;
  isTricky?: boolean;
}

export interface ScheduleConflict {
  day: Weekday;
  startHour: number;
  modules: DitModule[];
}

export interface ExamEvent {
  id: string;
  semester: SemesterId | 'alle';
  dateISO: string; // YYYY-MM-DD for sorting and detecting the user's very last exam
  dateLabel: string;
  title: string;
  moduleCode: string;
  moduleId?: string;
  category: 'Frist' | 'Abgabe' | 'Klausur' | 'Präsentation';
  locationOrSystem: string;
  urgency: 'hoch' | 'mittel' | 'normal';
}

export type WorkloadIntensity = 'Niedrig' | 'Mittel' | 'Hoch';

export interface WorkloadPhase {
  phase: string;
  detail: string;
  intensity: WorkloadIntensity;
}

export interface AreaFilterOption {
  value: 'Alle' | ModuleArea;
  label: string;
}

export const AREA_FILTER_OPTIONS: AreaFilterOption[] = [
  { value: 'Alle', label: 'Alle' },
  { value: 'BWL Pflicht', label: 'BWL Pflicht (12 CP)' },
  { value: 'Wirtschaftsinformatik Pflicht', label: 'Wirtschaftsinformatik Pflicht (12 CP)' },
  { value: 'Weitere Grundlagen (WP)', label: 'Weitere Grundlagen (WP) (12 CP)' },
  { value: 'Informatik (WP)', label: 'Informatik (WP) (12 CP)' },
  { value: 'Profil DITraM', label: 'Profil DITraM (24 CP)' },
  { value: 'Profil UCeDI', label: 'Profil UCeDI (24 CP)' },
  { value: 'Profil CIDA', label: 'Profil CIDA (24 CP)' },
  { value: 'Schlüsselkompetenzen', label: 'Schlüsselkompetenzen (6 CP)' },
  { value: 'Projektseminar', label: 'Projektseminar (12 CP)' },
  { value: 'Masterarbeit', label: 'Masterarbeit (30 CP)' },
  { value: 'Auflagen', label: 'Auflagen' },
];

export interface ModuleColorTheme {
  legendLabel: string;
  swatchClass: string;
  cardBorderTopClass: string;
  cardBgClass: string;
  selectedCardBgClass: string;
  textClass: string;
  gridSlotClass: string;
}

const LEGEND_THEMES = {
  bwlPflicht: {
    legendLabel: 'BWL Pflicht',
    swatchClass: 'bg-[#1484B8]',
    cardBorderTopClass: 'border-t-[3px] border-t-[#1484B8]',
    cardBgClass: 'bg-[#E8F1FA]/55 hover:bg-[#E8F1FA]/85',
    selectedCardBgClass: 'bg-[#E8F1FA]',
    textClass: 'text-[#0D5A80]',
    gridSlotClass: 'bg-[#E8F1FA] border-[#1484B8]/40 border-t-[3px] border-t-[#1484B8] text-slate-900',
  },
  wiPflicht: {
    legendLabel: 'Wirtschaftsinformatik Pflicht',
    swatchClass: 'bg-[#CA0065]',
    cardBorderTopClass: 'border-t-[3px] border-t-[#CA0065]',
    cardBgClass: 'bg-[#FCE9F2]/60 hover:bg-[#FCE9F2]/90',
    selectedCardBgClass: 'bg-[#FCE9F2]',
    textClass: 'text-[#96004B]',
    gridSlotClass: 'bg-[#FCE9F2] border-[#CA0065]/40 border-t-[3px] border-t-[#CA0065] text-slate-900',
  },
  weitereGrundlagen: {
    legendLabel: 'Weitere Grundlagen Wahlpflicht',
    swatchClass: 'bg-[#00A47A]',
    cardBorderTopClass: 'border-t-[3px] border-t-[#00A47A]',
    cardBgClass: 'bg-[#E3F5EF]/60 hover:bg-[#E3F5EF]/90',
    selectedCardBgClass: 'bg-[#E3F5EF]',
    textClass: 'text-[#006B4F]',
    gridSlotClass: 'bg-[#E3F5EF] border-[#00A47A]/40 border-t-[3px] border-t-[#00A47A] text-slate-900',
  },
  informatikWp: {
    legendLabel: 'Informatik Wahlpflicht',
    swatchClass: 'bg-[#8E174E]',
    cardBorderTopClass: 'border-t-[3px] border-t-[#8E174E]',
    cardBgClass: 'bg-[#F3E6EC]/65 hover:bg-[#F3E6EC]/95',
    selectedCardBgClass: 'bg-[#F3E6EC]',
    textClass: 'text-[#6C103A]',
    gridSlotClass: 'bg-[#F3E6EC] border-[#8E174E]/40 border-t-[3px] border-t-[#8E174E] text-slate-900',
  },
  masterprofil: {
    legendLabel: 'Wahlpflicht (Masterprofil)',
    swatchClass: 'bg-[#DDA548]',
    cardBorderTopClass: 'border-t-[3px] border-t-[#DDA548]',
    cardBgClass: 'bg-[#FCF3E1]/65 hover:bg-[#FCF3E1]',
    selectedCardBgClass: 'bg-[#FCF3E1]',
    textClass: 'text-[#8A5C12]',
    gridSlotClass: 'bg-[#FCF3E1] border-[#DDA548]/45 border-t-[3px] border-t-[#DDA548] text-slate-900',
  },
  schluesselkompetenzen: {
    legendLabel: 'Schlüsselkompetenzen',
    swatchClass: 'bg-[#9AC623]',
    cardBorderTopClass: 'border-t-[3px] border-t-[#9AC623]',
    cardBgClass: 'bg-[#F1F7DF]/70 hover:bg-[#F1F7DF]',
    selectedCardBgClass: 'bg-[#F1F7DF]',
    textClass: 'text-[#4D6608]',
    gridSlotClass: 'bg-[#F1F7DF] border-[#9AC623]/45 border-t-[3px] border-t-[#9AC623] text-slate-900',
  },
  projektseminar: {
    legendLabel: 'Projektseminar',
    swatchClass: 'bg-[#5C646B]',
    cardBorderTopClass: 'border-t-[3px] border-t-[#5C646B]',
    cardBgClass: 'bg-[#ECEEEF]/75 hover:bg-[#ECEEEF]',
    selectedCardBgClass: 'bg-[#ECEEEF]',
    textClass: 'text-[#394047]',
    gridSlotClass: 'bg-[#ECEEEF] border-[#5C646B]/40 border-t-[3px] border-t-[#5C646B] text-slate-900',
  },
  abschlussmodul: {
    legendLabel: 'Abschlussmodul',
    swatchClass: 'bg-[#183F28]',
    cardBorderTopClass: 'border-t-[3px] border-t-[#183F28]',
    cardBgClass: 'bg-[#E4EAE6]/80 hover:bg-[#E4EAE6]',
    selectedCardBgClass: 'bg-[#E4EAE6]',
    textClass: 'text-[#143522]',
    gridSlotClass: 'bg-[#E4EAE6] border-[#183F28]/40 border-t-[3px] border-t-[#183F28] text-slate-900',
  },
  auflagen: {
    legendLabel: 'Auflagen (§ 6 FPO)',
    swatchClass: 'bg-[#ff8000]',
    cardBorderTopClass: 'border-t-[3px] border-t-[#ff8000]',
    cardBgClass: 'bg-[#FFF4E8]/75 hover:bg-[#FFF4E8]',
    selectedCardBgClass: 'bg-[#FFF4E8]',
    textClass: 'text-[#B85800]',
    gridSlotClass: 'bg-[#FFF4E8] border-[#ff8000]/45 border-t-[3px] border-t-[#ff8000] text-slate-900',
  },
} satisfies Record<string, ModuleColorTheme>;

export function getModuleColorTheme(mod: Pick<DitModule, 'area' | 'code'>): ModuleColorTheme {
  switch (mod.area) {
    case 'BWL Pflicht':
      return LEGEND_THEMES.bwlPflicht;
    case 'Wirtschaftsinformatik Pflicht':
      return LEGEND_THEMES.wiPflicht;
    case 'Weitere Grundlagen (WP)':
      return LEGEND_THEMES.weitereGrundlagen;
    case 'Informatik (WP)':
      return LEGEND_THEMES.informatikWp;
    case 'Profil DITraM':
    case 'Profil UCeDI':
    case 'Profil CIDA':
      return LEGEND_THEMES.masterprofil;
    case 'Schlüsselkompetenzen':
      return LEGEND_THEMES.schluesselkompetenzen;
    case 'Projektseminar':
      return LEGEND_THEMES.projektseminar;
    case 'Masterarbeit':
      return LEGEND_THEMES.abschlussmodul;
    case 'Auflagen':
      return LEGEND_THEMES.auflagen;
    default:
      return mod.code.toUpperCase().startsWith('WI-')
        ? LEGEND_THEMES.wiPflicht
        : LEGEND_THEMES.bwlPflicht;
  }
}

export function getAreaSwatchClasses(area: 'Alle' | ModuleArea): string[] {
  switch (area) {
    case 'Alle':
      return [];
    case 'BWL Pflicht':
      return [LEGEND_THEMES.bwlPflicht.swatchClass];
    case 'Wirtschaftsinformatik Pflicht':
      return [LEGEND_THEMES.wiPflicht.swatchClass];
    case 'Weitere Grundlagen (WP)':
      return [LEGEND_THEMES.weitereGrundlagen.swatchClass];
    case 'Informatik (WP)':
      return [LEGEND_THEMES.informatikWp.swatchClass];
    case 'Profil DITraM':
    case 'Profil UCeDI':
    case 'Profil CIDA':
      return [LEGEND_THEMES.masterprofil.swatchClass];
    case 'Schlüsselkompetenzen':
      return [LEGEND_THEMES.schluesselkompetenzen.swatchClass];
    case 'Projektseminar':
      return [LEGEND_THEMES.projektseminar.swatchClass];
    case 'Masterarbeit':
      return [LEGEND_THEMES.abschlussmodul.swatchClass];
    case 'Auflagen':
      return [LEGEND_THEMES.auflagen.swatchClass];
  }
}

export interface SemesterMilestone {
  id: string;
  semester: 1 | 2 | 3 | 4;
  semesterTitle: string;
  targetCp: number;
  tasks: Array<{
    id: string;
    label: string;
    detail: string;
  }>;
}

export interface SemesterInfo {
  id: SemesterId;
  label: string;
  shortLabel: string;
  studySemesterLabel: string;
  isCurrent: boolean;
  lecturePeriod: string;
  examPeriod: string;
}

export const SEMESTER_INFOS: Record<SemesterId, SemesterInfo> = {
  wise2627: {
    id: 'wise2627',
    label: 'Wintersemester 2026/27',
    shortLabel: 'WiSe 2026/27',
    studySemesterLabel: '1. Fachsemester',
    isCurrent: true,
    lecturePeriod: '19.10.2026 – 12.02.2027',
    examPeriod: '10.02.2027 – 26.02.2027',
  },
  sose27: {
    id: 'sose27',
    label: 'Sommersemester 2027',
    shortLabel: 'SoSe 2027',
    studySemesterLabel: '2. Fachsemester',
    isCurrent: false,
    lecturePeriod: '12.04.2027 – 16.07.2027',
    examPeriod: '19.07.2027 – 30.07.2027',
  },
};

export const WEEKDAYS: Weekday[] = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];
export const TIME_BLOCKS = [8, 10, 12, 14, 16] as const;

export const PROMPT_STARTER_POOL: string[] = [
  'Stelle mir einen 30-CP-Stundenplan für dieses Semester zusammen.',
  'Ich habe einen B.Sc. in BWL – welche Module & Auflagen passen?',
  'Ich komme aus der Informatik – welchen 30-CP-Plan empfiehlst du?',
  'Welches Masterprofil (DITraM, UCeDI, CIDA) passt am besten zu mir?',
  'Welche Module im WiSe 2026/27 sind komplett auf Englisch?',
  'Wie funktionieren Auflagenfächer (§ 6 FPO) und die Prüfungsanmeldung?',
  'Welche Module gelten als besonders arbeitsintensiv („Tricky Modules“)?',
  'Was muss ich bei der Wahl von CIDA und Informatik-WP beachten?',
  'Wann kann ich frühestens das Projektseminar (12 CP) und die Masterarbeit anmelden?',
  'Wie kann ich die 6 CP Additive Schlüsselkompetenzen (KOMPETENZ-K1) einbringen?',
  'Welche Kickoff-Termine stehen zum Semesterstart im WiSe 2026/27 an?',
  'Kann ich mein Masterprofil nach der ersten Prüfung noch wechseln?',
  'Stelle mir einen entspannten 24-CP-Plan plus 6 CP Auflagen zusammen.',
  'Welche Module aus „Weitere Grundlagen (WP)“ eignen sich für BWLer?',
];

export const PROMPT_STARTERS: string[] = PROMPT_STARTER_POOL.slice(0, 3);

export function getRandomPromptStarters(count = 3): string[] {
  const pool = [...PROMPT_STARTER_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

export const DIT_MODULES: DitModule[] = [
  // ========================
  // WiSe 2026/27 (1. Semester nach Studienverlaufsplan + offizielle FPO-Module)
  // ========================
  {
    id: 'bwl-p2',
    semester: 'wise2627',
    code: 'BWL-P2',
    title: 'Informationsmanagement',
    ecampusTitle: 'Informationsmanagement (BWL-Pflicht)',
    cp: 6,
    area: 'BWL Pflicht',
    language: 'Deutsch (EN-Literatur)',
    ecampusLanguageMismatch: false,
    languageNote:
      'Vorlesung/Seminar auf Deutsch mit englischer Fachliteratur. Kickoff laut WiSe-26/27-Plan am 19.10.2026 in Raum 0422, Nora-Platiel-Str. 8.',
    examType: 'Klausur (90 Min.) / Referat+Ausarbeitung / Hausarbeit (ca. 20 S.)',
    workload: 3,
    workloadComment:
      '180 Std. Gesamtaufwand (60 Std. Kontaktstudium + 120 Std. Selbststudium). Klar strukturierte BWL-Pflichtbasis im 1. Semester.',
    officialPrerequisite:
      'Keine formalen Voraussetzungen · Pflichtmodul im Bereich BWL (12 CP insgesamt, PO-2024)',
    studentTip:
      'Unbedingt zum Kickoff am 19.10.2026 in Nora-Platiel-Str. 8 (Raum 0422) gehen – dort wird das genaue Prüfungsformat (Klausur vs. Referat/Hausarbeit) für den Durchgang festgelegt.',
    learningGoals: [
      'Strategische Bedeutung von IS',
      'Einbettung in Organisationsprozesse',
      'Steuerung von Informationsprozessen',
      'Top-Management-Entscheidungsunterstützung',
    ],
    recommendedFor: ['BWL', 'Startup', 'General'],
    schedule: [],
    realScheduleLabel:
      'Kickoff 19.10.2026 (Mo) · Nora-Platiel-Str. 8, R 0422 · Uhrzeit fehlt (Regeltermine: Zeit/Raum fehlt)',
  },
  {
    id: 'wi-p1',
    semester: 'wise2627',
    code: 'WI-P1',
    title: 'Service-Engineering & -Management',
    ecampusTitle: 'Service-Engineering & -Management (Dienstleistungsengineering / Collaboration Engineering)',
    cp: 6,
    area: 'Wirtschaftsinformatik Pflicht',
    language: 'Deutsch (EN-Literatur)',
    ecampusLanguageMismatch: false,
    languageNote:
      'Innerhalb des Pflichtmoduls wird eine der beiden Veranstaltungen gewählt (Dienstleistungsengineering & -management oder Collaboration Engineering). Kickoff WiSe 26/27 am 15.10.2026, 10–11 Uhr via Zoom.',
    examType: 'Klausur (90 Min.) / Referat+Ausarbeitung (ca. 12 S.) / Hausarbeit',
    workload: 3,
    workloadComment:
      '180 Std. (60 Std. Kontakt + 120 Std. Selbststudium, V/S 4 SWS). Gut planbarer Arbeitsaufwand mit starkem Praxis- und Gruppenarbeitsanteil.',
    officialPrerequisite:
      'Keine formalen Voraussetzungen · Pflichtmodul Wirtschaftsinformatik (12 CP insgesamt, PO-2024)',
    studentTip:
      'Den Zoom-Kickoff am 15.10. um 10 Uhr nicht verpassen! Wer Collaboration Engineering wählt, trainiert direkt Moderation und digitale Teamprozesse für spätere Projektseminare.',
    learningGoals: [
      'Service Economy & IT-Dienstleistungen',
      'Service-Vorgehensmodelle',
      'Collaboration Engineering',
      'CSCW & digitale Arbeitsformen',
    ],
    recommendedFor: ['BWL', 'Startup', 'General'],
    schedule: [
      {
        day: 'Do',
        startHour: 10,
        endHour: 11,
        room: 'via Zoom (Kickoff 15.10.2026)',
        sessionType: 'Vorlesung',
      },
    ],
    realScheduleLabel:
      'Kickoff 15.10.2026 (Do), 10:00–11:00 Uhr · via Zoom (Regeltermine: Zeit/Raum fehlt)',
  },
  {
    id: 'wahl-48',
    semester: 'wise2627',
    code: 'WAHL-48',
    title: 'Rechtliche Grundlagen für Wirtschaftsinformatik',
    ecampusTitle: 'Rechtliche Grundlagen für Wirtschaftsinformatik (Weitere Grundlagen)',
    cp: 6,
    area: 'Weitere Grundlagen (WP)',
    language: 'Deutsch',
    ecampusLanguageMismatch: false,
    languageNote:
      'Vollständig auf Deutsch (2 × 2 SWS: Vorlesung/Seminar). Start im WiSe 26/27 am Mittwoch ab 14.10.2026.',
    examType: '2 Teilleistungen P1 (50%) & P2 (50%): je Klausur (60–90 Min.) oder Seminararbeit',
    workload: 3,
    workloadComment:
      '180 Std. Gesamtaufwand mit zwei gleichgewichteten Teilprüfungen (P1 + P2 je 50%). Juristische Gutachtentechnik ist anfangs ungewohnt, aber sehr systematisch.',
    officialPrerequisite:
      'Wahlpflichtbereich „Weitere Grundlagen“ (insgesamt 12 CP erforderlich)',
    studentTip:
      'Sehr sinnvoller Ausgleich zu technischen Modulen. Rechtzeitig die juristische Gutachtentechnik an den Übungsfällen üben – beide Teilnoten zählen je 50%!',
    learningGoals: [
      'Bürgerliches Recht & Digitalgesellschaft',
      'Rechtliche Verortung digitaler Transformation',
      'Juristische Gutachtentechnik',
      'Privatrechtliche Problembewältigung',
    ],
    recommendedFor: ['BWL', 'Startup', 'General'],
    schedule: [],
    realScheduleLabel: 'Start: Mi ab 14.10.2026 · Zeit/Raum fehlt',
  },
  {
    id: 'wahl-1',
    semester: 'wise2627',
    code: 'WAHL-1',
    title: 'Pattern Recognition and Machine Learning I',
    ecampusTitle: 'Pattern Recognition and Machine Learning I',
    cp: 6,
    area: 'Informatik (WP)',
    language: 'Englisch',
    ecampusLanguageMismatch: false,
    languageNote:
      'Lehrveranstaltung (VLmP 2 SWS + Ü 2 SWS) und Prüfung auf Englisch. Start im WiSe 26/27 am Montag ab 19.10.2026.',
    examType: 'Klausur (120 Min.) oder mündl. Prüfung (20 Min.) · Vorleistung S1',
    workload: 5,
    workloadComment:
      '180 Std. (60h Präsenz + 120h Selbststudium) mit verpflichtender Studienleistung S1 (regelmäßige Übungsaufgaben als Klausurzulassung!).',
    officialPrerequisite:
      'Informatik (WP) oder Profil CIDA (Achtung: keine Doppelanrechnung!). Solide Mathe-/Statistik- und Programmierkenntnisse nötig.',
    studentTip:
      'Tricky Module für Quereinsteiger! Ohne Studienleistung S1 (wöchentliche Übungszettel) keine Prüfungszulassung. Falls dir Informatik/Mathe-Auflagen fehlen, lieber erst AUF-Kurse vorziehen!',
    learningGoals: [
      'Algorithmen der Mustererkennung',
      'Klassifikations- & Regressionsmodelle',
      'Eigenständige ML-Anwendungen',
      'Kritische Verfahrensbewertung',
    ],
    recommendedFor: ['Informatik'],
    isTricky: true,
    schedule: [],
    realScheduleLabel: 'Start: Mo ab 19.10.2026 · Zeit/Raum fehlt',
  },
  {
    id: 'wahl-8',
    semester: 'wise2627',
    code: 'WAHL-8',
    title: 'Begriffliche Datenanalyse / Conceptual Data Analysis',
    ecampusTitle: 'Begriffliche Datenanalyse / Conceptual Data Analysis',
    cp: 6,
    area: 'Informatik (WP)',
    language: 'Deutsch (EN-Literatur)',
    ecampusLanguageMismatch: false,
    languageNote:
      'VLmP (2 SWS) + Ü (2 SWS). Start im WiSe 26/27 am Dienstag ab 20.10.2026. Gleichzeitiges oder anschließendes „Labor Qualitative Datenanalyse“ empfohlen.',
    examType: 'Mündliche Prüfung (ca. 30 Min.) oder Klausur (ca. 120 Min.) · Vorleistung S1',
    workload: 4,
    workloadComment:
      '180h (60h Präsenz + 120h Selbststudium). Formale Begriffsanalyse erfordert abstraktes mathematisches Denken; S1-Übungen sind Pflichtzulassung.',
    officialPrerequisite:
      'Informatik (WP) oder Profil CIDA (keine Überschneidung bei Doppelwahl). Mathematik-Grundlagen empfohlen.',
    studentTip:
      'Ideal kombinierbar mit dem Labor Qualitative Datenanalyse (WAHL-14). Für BWLer machbar, wenn man formale Logik und Mengentheorie mag.',
    learningGoals: [
      'Formale Begriffsanalyse (FCA)',
      'Wissensverarbeitung & -repräsentation',
      'Strukturierte Datenexploration',
      'Verbandstheoretische Modelle',
    ],
    recommendedFor: ['Informatik', 'General'],
    isTricky: true,
    schedule: [],
    realScheduleLabel: 'Start: Di ab 20.10.2026 · Zeit/Raum fehlt',
  },
  {
    id: 'wahl-16',
    semester: 'wise2627',
    code: 'WAHL-16',
    title: 'Parallele Programmierung',
    ecampusTitle: 'Parallele Programmierung (Informatik WP)',
    cp: 6,
    area: 'Informatik (WP)',
    language: 'Deutsch (EN-Literatur)',
    ecampusLanguageMismatch: false,
    languageNote:
      'VLmP (2 SWS) + PrM (2 SWS). Start im WiSe 26/27 ab 26.10.2026. Hinweis: Nicht im Profil CIDA anrechenbar, daher ideal für die 12 CP Informatik-Wahlpflicht.',
    examType: 'Projektarbeit',
    workload: 4,
    workloadComment:
      '180h (60h Präsenz + 120h Selbststudium). Hoher Programmier- und Debugging-Anteil bei parallelen Architekturen.',
    officialPrerequisite:
      'Informatik (WP) · Fundierte Programmiererfahrung aus dem Bachelor vorausgesetzt',
    studentTip:
      'Perfekt, wenn du das Profil CIDA wählst und die 12 CP Informatik-Wahlpflicht ohne Überschneidung füllen musst (da WAHL-16 kein CIDA-Profilmodul ist)!',
    learningGoals: [
      'Parallele Programmiersysteme',
      'Multicore- & Architekturklassen',
      'Effiziente & wartbare Parallel-Programme',
      'Aktuelle Forschung zu Parallelität',
    ],
    recommendedFor: ['Informatik'],
    isTricky: true,
    schedule: [],
    realScheduleLabel: 'Start: ab 26.10.2026 · Zeit/Raum fehlt',
  },
  {
    id: 'wahl-59',
    semester: 'wise2627',
    code: 'WAHL-59',
    title: 'Prompt Engineering: Innovation Through Generative AI',
    ecampusTitle: 'Prompt Engineering: Innovation Through Generative AI',
    cp: 6,
    area: 'Profil UCeDI',
    language: 'Englisch',
    ecampusLanguageMismatch: false,
    languageNote:
      'Seminar (4 SWS) auf Englisch, wissenschaftliche Dokumentation nach ACM-Format.',
    examType: 'Präsentation mit schriftlicher Ausarbeitung (ACM-Format)',
    workload: 3,
    workloadComment:
      '180 Std. (40 Std. Kontaktstudium + 140 Std. Selbststudium). Hoher Eigenanteil durch eigenes KI-Projekt und ACM-Paper.',
    officialPrerequisite:
      'Masterprofil UCeDI (24 CP). Mit Prüfungsantritt wird das Masterprofil UCeDI verbindlich festgelegt!',
    studentTip:
      'Sehr praxisnah für KI-Anwendungen und gut für gemischte Teams. Achtung: Sobald du hier eine Prüfung antrittst, bist du auf das Profil UCeDI festgelegt!',
    learningGoals: [
      'NLP & Large Language Models',
      'Strukturiertes Prompt Engineering',
      'Ethik, Recht & Social Impact von KI',
      'ACM-Forschungsdokumentation',
    ],
    recommendedFor: ['Startup', 'Informatik', 'BWL'],
    schedule: [],
  },
  {
    id: 'wahl-60',
    semester: 'wise2627',
    code: 'WAHL-60',
    title: 'Skalierbare digitale Unternehmen (B2B) gründen',
    ecampusTitle: 'Skalierbare digitale Unternehmen (B2B) gründen',
    cp: 6,
    area: 'Profil UCeDI',
    language: 'Deutsch',
    ecampusLanguageMismatch: false,
    languageNote: 'Seminar (4 SWS) mit realen Use Cases eines Kasseler Start-ups auf Deutsch.',
    examType: 'Präsentation mit schriftlicher Ausarbeitung · Vorleistung S1 (Übungsaufgabe)',
    workload: 3,
    workloadComment:
      'Praxisintensive Fallbearbeitung zu B2B-Gründung und Skalierung mit semantischer KI und Feedback durch Gründer.',
    officialPrerequisite:
      'Masterprofil UCeDI (24 CP). Festlegung des Profils mit erstem Prüfungsantritt (§ 8 Abs. 5 FPO).',
    studentTip:
      'Das Top-Modul für Gründerinnen und Gründer im Profil UCeDI! Echte Praxis-Cases eines Kasseler Startups statt trockener Theorie.',
    learningGoals: [
      'Semantische KI in Geschäftsmodellen',
      'B2B-Skalierung & Go-to-Market',
      'Schnelle Produkt-Iteration',
      'Reale Kasseler Startup-Cases',
    ],
    recommendedFor: ['Startup', 'BWL'],
    schedule: [],
  },
  {
    id: 'wahl-uc1',
    semester: 'wise2627',
    code: 'UCeDI-NEU1',
    title: 'Responsible Design and Sustainable Operation of Enterprise Systems',
    ecampusTitle: 'Responsible Design and Sustainable Operation of Enterprise Systems (WS 26/27 neu)',
    cp: 6,
    area: 'Profil UCeDI',
    language: 'Englisch',
    ecampusLanguageMismatch: false,
    languageNote: 'Neues UCeDI-Wahlpflichtmodul ab WiSe 2026/27 komplett auf Englisch.',
    examType: 'Präsentation mit schriftlicher Ausarbeitung',
    workload: 3,
    workloadComment:
      '180 Std. Arbeitsaufwand mit Fokus auf nachhaltige Unternehmenssysteme und verantwortungsvolles IT-Design.',
    officialPrerequisite:
      'Masterprofil UCeDI (24 CP) · Neuangebot laut Studiengangsvorstellung WS 26/27',
    studentTip:
      'Brandneues Modul im WS 26/27 für alle, die Nachhaltigkeit (Green IS) mit Enterprise Systems verbinden wollen.',
    learningGoals: [
      'Sustainable Enterprise Architecture',
      'Responsible System Design',
      'Green IT Operations',
      'Socio-technical Impact',
    ],
    recommendedFor: ['BWL', 'General', 'Informatik'],
    schedule: [],
  },
  {
    id: 'wahl-uc2',
    semester: 'wise2627',
    code: 'UCeDI-NEU2',
    title: 'Trustworthy Emerging Information Systems',
    ecampusTitle: 'Trustworthy Emerging Information Systems (WS 26/27 neu)',
    cp: 6,
    area: 'Profil UCeDI',
    language: 'Englisch',
    ecampusLanguageMismatch: false,
    languageNote: 'Neues englisches Modul im Profil UCeDI (ab WiSe 2026/27).',
    examType: 'Seminararbeit & Präsentation',
    workload: 3,
    workloadComment:
      'Forschungsorientiertes Seminar zu Vertrauen, Transparenz und Governance neuartiger Informationssysteme.',
    officialPrerequisite:
      'Masterprofil UCeDI (24 CP) · Neuangebot laut Studiengangsvorstellung WS 26/27',
    studentTip:
      'Ideal, wenn du später ein Forschungsthema im Bereich Trustworthy AI / Information Systems für Projektseminar oder Masterarbeit suchst.',
    learningGoals: [
      'Trustworthy AI & IS',
      'System-Transparenz & Zertifizierung',
      'Emerging Technologies Governance',
      'Empirische Bewertung',
    ],
    recommendedFor: ['General', 'Informatik', 'BWL'],
    schedule: [],
  },
  {
    id: 'wahl-29',
    semester: 'wise2627',
    code: 'WAHL-29',
    title: 'Business Model Innovation',
    ecampusTitle: 'Business Model Innovation (Profil DITraM)',
    cp: 6,
    area: 'Profil DITraM',
    language: 'Deutsch (EN-Literatur)',
    ecampusLanguageMismatch: false,
    languageNote: 'V/S (4 SWS) inkl. Blended-Learning-Elementen, aktuelle Paper auf Englisch.',
    examType: 'Klausur (90 Min.) oder Referat (ca. 20 Min.) + Ausarbeitung (12 S.) / Hausarbeit',
    workload: 3,
    workloadComment:
      '180 Std. (60 Std. Kontakt + 120 Std. Selbststudium). Abwechslungsreiche Fallstudien zu digitalen & dualen Geschäftsmodellen.',
    officialPrerequisite:
      'Masterprofil DITraM (24 CP) · BWL-Grundlagen hilfreich. Festlegung des Profils DITraM mit Prüfungsantritt!',
    studentTip:
      'Eines der beliebtesten BWL-Module im Profil DITraM – perfekt für Gründer und BWL-Absolventen mit Fokus auf digitale Wertschöpfung.',
    learningGoals: [
      'Geschäftsmodellinnovationen',
      'Ideengenerierung & Strukturierung',
      'Duale & multiple Geschäftsmodelle',
      'Technologische Implikationen',
    ],
    recommendedFor: ['BWL', 'Startup'],
    schedule: [],
  },
  {
    id: 'wahl-31',
    semester: 'wise2627',
    code: 'WAHL-31',
    title: 'Technologiemanagement, Innovation & Entrepreneurship',
    ecampusTitle: 'Ausgewählte Themen des Technologie- und Innovationsmanagements sowie Entrepreneurship',
    cp: 6,
    area: 'Profil DITraM',
    language: 'Deutsch (EN-Literatur)',
    ecampusLanguageMismatch: false,
    languageNote: 'Projektseminar am Fachgebiet TIME (FgTIME) mit individueller Themenwahl.',
    examType: 'Exposé / schriftliche Ausarbeitung (5–10 Seiten)',
    workload: 3,
    workloadComment:
      '162 Std. Arbeitsaufwand. Sehr kompakter Umfang der Ausarbeitung (5–10 S.), hohe inhaltliche Eigenständigkeit.',
    officialPrerequisite: 'Masterprofil DITraM (24 CP)',
    studentTip:
      'Super Wahl im Profil DITraM für Strategic Entrepreneurship, Agilität und Neuproduktentwicklung mit überschaubarer Seitenanzahl!',
    learningGoals: [
      'Strategic Entrepreneurship',
      'Technologie- & Innovationsakzeptanz',
      'Neuproduktentwicklung',
      'Agilität & Change Management',
    ],
    recommendedFor: ['Startup', 'BWL'],
    schedule: [],
  },
  {
    id: 'wahl-34',
    semester: 'wise2627',
    code: 'WAHL-34',
    title: 'Digital Business',
    ecampusTitle: 'Digital Business (Profil DITraM)',
    cp: 6,
    area: 'Profil DITraM',
    language: 'Deutsch',
    ecampusLanguageMismatch: false,
    languageNote: 'Vorlesung (4 SWS) auf Deutsch.',
    examType: 'Klausur (90 Min.)',
    workload: 3,
    workloadComment:
      '180 Std. (60h Kontakt + 120h Selbststudium). Klassische, sehr gut strukturierte 90-Minuten-Klausur ohne wöchentliche Pflichtabgaben.',
    officialPrerequisite: 'Masterprofil DITraM (24 CP)',
    studentTip:
      'Ideal, wenn du ein klares Klausurfach zu IT-Outsourcing, Cloud Computing und KI-Anwendungsbeispielen im Unternehmen suchst.',
    learningGoals: [
      'IT-Management & Wertbeitrag',
      'IT-Outsourcing & Cloud Computing',
      'IT-Landschaftskomplexität',
      'KI/ML-Anwendungsbeispiele',
    ],
    recommendedFor: ['BWL', 'General'],
    schedule: [],
  },
  {
    id: 'wahl-36',
    semester: 'wise2627',
    code: 'WAHL-36',
    title: 'Machine Learning in the Context of Digital Transformation',
    ecampusTitle: 'Machine Learning in the Context of Digital Transformation',
    cp: 6,
    area: 'Profil DITraM',
    language: 'Englisch',
    ecampusLanguageMismatch: false,
    languageNote:
      'Seminar (4 SWS) + Blended Learning; englischer Titel, Lehre mit englischer Fachliteratur.',
    examType: 'Hausarbeit (2.500 Wörter) · Vorleistungen S1 (Präsentation) & S2 (ML-Anwendung)',
    workload: 4,
    workloadComment:
      '180 Std. (30–60h Kontakt + 120–150h Selbststudium). Zwei Vorleistungen (Zwischenpräsentation + eigene ML-Anwendung) vor der Hausarbeit!',
    officialPrerequisite: 'Immatrikulation DIT · Masterprofil DITraM (24 CP)',
    studentTip:
      'Anspruchsvoll durch zwei Studienleistungen plus Hausarbeit – bringt aber echte Praxis im Trainieren und Evaluieren von ML-Modellen für BWLer.',
    learningGoals: [
      'Datenanalyse & Preprocessing',
      'Supervised/Unsupervised/RL-Modelle',
      'ML-Anwendungsentwicklung',
      'Modellevaluation in der Praxis',
    ],
    recommendedFor: ['Informatik', 'BWL'],
    isTricky: true,
    schedule: [],
  },
  {
    id: 'wahl-51',
    semester: 'wise2627',
    code: 'WAHL-51',
    title: 'Leadership & Change Management',
    ecampusTitle: 'Leadership & Change Management (Weitere Grundlagen)',
    cp: 6,
    area: 'Weitere Grundlagen (WP)',
    language: 'Deutsch (EN-Literatur)',
    ecampusLanguageMismatch: false,
    languageNote: 'V/S (4 SWS) + Blended Learning auf Deutsch mit englischen Management-Papers.',
    examType: 'Klausur (90 Min.) oder Referat+Ausarbeitung (12 S.) oder Hausarbeit (20 S.)',
    workload: 2,
    workloadComment:
      '180 Std. Gesamtaufwand; gut planbare Konzepte zu Führung und organisatorischem Wandel.',
    officialPrerequisite: 'Wahlpflichtbereich „Weitere Grundlagen“ (12 CP)',
    studentTip:
      'Sehr gute Alternative oder Ergänzung zu Rechtliche Grundlagen (WAHL-48), um die 12 CP in „Weitere Grundlagen“ entspannt abzudecken.',
    learningGoals: [
      'Leadership-Theorien',
      'Change-Management-Modelle',
      'Organisatorische Umsetzung',
      'Veränderungsprozesse steuern',
    ],
    recommendedFor: ['BWL', 'Startup', 'General'],
    schedule: [],
  },
  {
    id: 'wahl-4',
    semester: 'wise2627',
    code: 'WAHL-4',
    title: 'Labor Deep Learning',
    ecampusTitle: 'Labor Deep Learning (Informatik WP / CIDA)',
    cp: 6,
    area: 'Profil CIDA',
    language: 'Englisch',
    ecampusLanguageMismatch: false,
    languageNote: 'Praktikum (4 SWS); Laborarbeit und Dokumentation auf Englisch/Deutsch.',
    examType: 'Praktikumsarbeit und Praktikumsbericht · Vorleistung S1 (Praktikumsaufgaben)',
    workload: 5,
    workloadComment:
      '180h (60h Präsenz + 120h Selbststudium). Experimentelles Coding und Deep-Learning-Evaluation – hoher Zeitbedarf!',
    officialPrerequisite:
      'Masterprofil CIDA (24 CP) oder Informatik WP (keine Doppelanrechnung!). ML-/Python-Erfahrung dringend nötig.',
    studentTip:
      'Wer CIDA wählt, liebt dieses Labor – aber plane genug Zeit für GPU-Training, Experimente und den Praktikumsbericht ein!',
    learningGoals: [
      'Deep-Learning-Architekturen',
      'Wissenschaftliche Experimente',
      'Modell-Evaluation',
      'Praxisbezogene KI-Forschung',
    ],
    recommendedFor: ['Informatik'],
    isTricky: true,
    schedule: [],
  },
  {
    id: 'wahl-05',
    semester: 'wise2627',
    code: 'WAHL_05',
    title: 'Internet Measurements',
    ecampusTitle: 'Internet Measurements (Informatik WP)',
    cp: 6,
    area: 'Informatik (WP)',
    language: 'Englisch',
    ecampusLanguageMismatch: false,
    languageNote: 'VLmP (2) + Ü (1) + Pr (1 SWS) auf Englisch.',
    examType: 'Klausur (120 Min.) oder mündl. Prüfung (30 Min.) · Vorleistung S1 (50% Aufgaben)',
    workload: 4,
    workloadComment:
      '180 Std. (60h Präsenz + 120h Selbststudium). Mindestens 50% der Praktikums- und Übungsaufgaben als Prüfungszulassung.',
    officialPrerequisite:
      'Informatik (WP) · Netzwerk-Grundlagen empfohlen. Ideal für CIDA-Studierende, da nicht im CIDA-Profil enthalten.',
    studentTip:
      'Sehr spannend für Netzwerksicherheit und empirische Internet-Analyse; zählt sauber zu den 12 CP Informatik-WP ohne CIDA-Konflikt.',
    learningGoals: [
      'Empirische Netzwerkmessung',
      'Internetprotokolle & Traffic',
      'Sicherheitseigenschaften bewerten',
      'Large-Scale Measurements',
    ],
    recommendedFor: ['Informatik'],
    schedule: [],
  },

  // ========================
  // Empfohlene Auflagenfächer (gemäß § 6 FPO & offiziellem Empfehlungs-PDF)
  // ========================
  {
    id: 'auf-inf1',
    semester: 'wise2627',
    code: 'AUF-INF1',
    title: 'Einführung in die Informatik (Auflage)',
    ecampusTitle: 'Empfehlung Auflage Informatik: Einführung in die Informatik (9 CP)',
    cp: 9,
    area: 'Auflagen',
    language: 'Deutsch',
    ecampusLanguageMismatch: false,
    languageNote: 'Bachelor-Pflichtmodul aus dem Bachelor Wirtschaftsinformatik (FB 16) auf Deutsch.',
    examType: 'Klausur (manuelle Prüfungsanmeldung über Prüfungsamt)',
    workload: 4,
    workloadComment:
      '9 CP Zusatzleistung (ca. 270 Std.). Für BWL-Absolventen ohne Informatik-Credit-Nachweis häufige Auflage.',
    officialPrerequisite:
      'Auflage gemäß § 6 FPO (max. 12 CP Informatik). Muss bis zur Anmeldung der Masterarbeit bestanden sein; Note zählt nicht in den Master-Schnitt.',
    studentTip:
      'Bei Auflagen zählt jede Prüfung manuell über das Prüfungsamt (eCampus-Anmeldung wird vorbereitet). Früh im 1. Semester angehen!',
    learningGoals: [
      'Informatik-Grundkonzepte',
      'Datenrepräsentation',
      'Algorithmisches Denken',
      'Rechnerarchitektur-Basis',
    ],
    recommendedFor: ['BWL'],
    isTricky: true,
    schedule: [],
  },
  {
    id: 'auf-inf2',
    semester: 'wise2627',
    code: 'AUF-INF2',
    title: 'Programmierung und Modellierung (Auflage)',
    ecampusTitle: 'Empfehlung Auflage Informatik: Programmierung und Modellierung (6 CP)',
    cp: 6,
    area: 'Auflagen',
    language: 'Deutsch',
    ecampusLanguageMismatch: false,
    languageNote: 'Bachelor-Kurs (6 CP) auf Deutsch.',
    examType: 'Klausur & Übungsaufgaben (Prüfungsamt-Anmeldung)',
    workload: 4,
    workloadComment:
      'Praktisches Programmieren & UML/Datenmodellierung – sehr hilfreich vor Informatik-Wahlpflichtmodulen.',
    officialPrerequisite:
      'Auflage gemäß § 6 FPO (max. 12 CP Informatik). Nachweis bis Anmeldung der Masterarbeit.',
    studentTip:
      'Wer diese Auflage hat, sollte sie vor Pattern Recognition / Deep Learning erledigen, damit die Coding-Praxis sitzt.',
    learningGoals: [
      'Objektorientierte Programmierung',
      'Software-Modellierung',
      'Datenstrukturen',
      'Testen & Debugging',
    ],
    recommendedFor: ['BWL'],
    isTricky: true,
    schedule: [],
  },
  {
    id: 'auf-inf3',
    semester: 'wise2627',
    code: 'AUF-INF3',
    title: 'Datenbanken (Auflage)',
    ecampusTitle: 'Empfehlung Auflage Informatik: Datenbanken (6 CP)',
    cp: 6,
    area: 'Auflagen',
    language: 'Deutsch',
    ecampusLanguageMismatch: false,
    languageNote: 'Bachelor-Kurs (6 CP) auf Deutsch.',
    examType: 'Klausur (manuelle Prüfungsanmeldung über Prüfungsamt)',
    workload: 3,
    workloadComment:
      'Relationale Datenmodelle, SQL und Normalformen – klar abgegrenzter und gut lernbarer Stoff.',
    officialPrerequisite:
      'Auflage gemäß § 6 FPO (Informatik). Bis zur Anmeldung der Masterarbeit nachzuholen.',
    studentTip:
      'Gute Einstiegsauflage neben dem 1. Mastersemester; SQL-Übungen direkt aktiv mitbearbeiten.',
    learningGoals: [
      'ER-Modellierung',
      'Relationale Algebra & SQL',
      'Normalisierung',
      'Transaktionsmanagement',
    ],
    recommendedFor: ['BWL', 'General'],
    schedule: [],
  },
  {
    id: 'auf-mat1',
    semester: 'wise2627',
    code: 'AUF-MAT1',
    title: 'Mathematik (Auflage)',
    ecampusTitle: 'Empfehlung Auflage Mathe/Statistik: Mathematik (9 CP)',
    cp: 9,
    area: 'Auflagen',
    language: 'Deutsch',
    ecampusLanguageMismatch: false,
    languageNote: 'Bachelor-Modul Mathematik (9 CP) auf Deutsch.',
    examType: 'Klausur (manuelle Prüfungsanmeldung über Prüfungsamt)',
    workload: 5,
    workloadComment:
      'Rechenintensives 9-CP-Modul; regelmäßige Übungsblätter sind entscheidend zum Bestehen.',
    officialPrerequisite:
      'Auflage gemäß § 6 FPO (Mathematik, Statistik oder Ökonometrie bis max. 18 CP).',
    studentTip:
      'Altklausuren und Tutorien unbedingt mitnehmen – am besten gleich im 1. oder 2. Semester abhaken, da Note nicht in den Master-Schnitt zählt (4,0 reicht)!',
    learningGoals: [
      'Lineare Algebra',
      'Analysis & Optimierung',
      'Mathematische Beweistechnik',
      'Wahrscheinlichkeitsrechnung',
    ],
    recommendedFor: ['General', 'BWL'],
    isTricky: true,
    schedule: [],
  },
  {
    id: 'auf-mat2',
    semester: 'wise2627',
    code: 'AUF-MAT2',
    title: 'Deskriptive Statistik / Induktive Statistik (Auflage)',
    ecampusTitle: 'Empfehlung Auflage Statistik: Deskriptive / Induktive Statistik (je 6 CP)',
    cp: 6,
    area: 'Auflagen',
    language: 'Deutsch',
    ecampusLanguageMismatch: false,
    languageNote: 'Bachelor-Statistik (je 6 CP) auf Deutsch.',
    examType: 'Klausur (manuelle Prüfungsanmeldung über Prüfungsamt)',
    workload: 4,
    workloadComment:
      'Wichtige Basis für WI-P2 (Forschungsmethoden) und Data-Analytics-Module.',
    officialPrerequisite:
      'Auflage gemäß § 6 FPO (Mathe/Statistik, mind. 18 CP erforderlich). Bis Anmeldung Masterarbeit nachzuweisen.',
    studentTip:
      'Auch wenn du Deskriptive oder Induktive Statistik nachholen musst: hilft direkt im 2. Semester bei Forschungsmethoden in der Wirtschaftsinformatik!',
    learningGoals: [
      'Verteilungen & Kennzahlen',
      'Schätz- & Testverfahren',
      'Hypothesentests',
      'Regressionsgrundlagen',
    ],
    recommendedFor: ['General'],
    isTricky: true,
    schedule: [],
  },
  {
    id: 'auf-winf1',
    semester: 'wise2627',
    code: 'AUF-WINF1',
    title: 'Betriebliche Informationssysteme / Wirtschaftsinformatik (Auflage)',
    ecampusTitle: 'Empfehlung Auflage Wirtschaftsinformatik (6 CP)',
    cp: 6,
    area: 'Auflagen',
    language: 'Deutsch',
    ecampusLanguageMismatch: false,
    languageNote: 'Empfohlenes Wirtschaftsinformatik-Bachelor-Modul (alternativ: IS Analysis & Design oder Prozessmanagement).',
    examType: 'Klausur (manuelle Anmeldung über Prüfungsamt)',
    workload: 3,
    workloadComment:
      'Gut machbarer 6-CP-Einstieg für reine BWL- oder Informatik-Absolventen mit fehlender Wirtschaftsinformatik-Basis.',
    officialPrerequisite:
      'Auflage gemäß § 6 FPO (Wirtschaftsinformatik max. 6 CP). Bei Unsicherheiten vorher studienkoordination-dit@uni-kassel.de fragen!',
    studentTip:
      'Weitere anerkannte Kurse (z. B. Prozessmanagement, Marketing, Finanzwirtschaft, Digitale Disruption) können nach Absprache mit der Studienkoordination gewählt werden.',
    learningGoals: [
      'ERP- & Anwendungssysteme',
      'Geschäftsprozessdigitalisierung',
      'IS Analysis & Design',
      'IT-Business-Alignment',
    ],
    recommendedFor: ['BWL', 'Informatik'],
    schedule: [],
  },

  // ========================
  // SoSe 2027 (2. Semester nach Studienverlaufsplan + offizielle FPO-Module)
  // ========================
  {
    id: 'bwl-p1',
    semester: 'sose27',
    code: 'BWL-P1',
    title: 'Digital Transformation',
    ecampusTitle: 'Digitale Transformation (eCampus) · Modulcode BWL-P1',
    cp: 6,
    area: 'BWL Pflicht',
    language: 'Englisch',
    ecampusLanguageMismatch: true,
    languageNote:
      'Sprachbrücke: Im Vorlesungsverzeichnis/eCampus oft unter „Digitale Transformation“ auffindbar; relevante Konzepte, Literatur und Lehre häufig auf Englisch.',
    examType: 'Klausur (90 Min.) / Referat (20 Min.)+Ausarbeitung (12 S.) / Hausarbeit (20 S.)',
    workload: 3,
    workloadComment:
      '180 Std. (60h Kontakt + 120h Selbststudium). Fallstudien und Wertschöpfungsstrategien – zentrale Pflichtsäule des Studiengangs.',
    officialPrerequisite:
      'Keine formalen Voraussetzungen · Pflichtmodul BWL (laut SVP empfohlen im 2. Semester / SoSe)',
    studentTip:
      'Das Namensgebungs-Modul des Studiengangs! Unbedingt in den ersten beiden Semestern mitnehmen – liefert die theoretische Basis für fast alle Wahlpflichtseminare.',
    learningGoals: [
      'Technologische Trends & Gesellschaft',
      'IS in Geschäftsprozessen & Produkten',
      'Forschungsstand Digitale Transformation',
      'IT-Wertschöpfungsstrategien & Fallstudien',
    ],
    recommendedFor: ['BWL', 'Startup', 'General'],
    schedule: [],
  },
  {
    id: 'wi-p2',
    semester: 'sose27',
    code: 'WI-P2',
    title: 'Forschungsmethoden in der Wirtschaftsinformatik',
    ecampusTitle: 'Forschungsmethoden in der Wirtschaftsinformatik (WI-P2)',
    cp: 6,
    area: 'Wirtschaftsinformatik Pflicht',
    language: 'Deutsch (EN-Literatur)',
    ecampusLanguageMismatch: false,
    languageNote:
      'Vorlesung/Seminar (4 SWS + Blended Learning) auf Deutsch mit englischen Forschungs-Papers.',
    examType: 'Schriftliche Ausarbeitung (15–20 Seiten)',
    workload: 4,
    workloadComment:
      '180 Std. (60h Kontakt + 120h Selbststudium). Wissenschaftliches Arbeiten und Team-Koordination (80% Fachkompetenz / 20% Sozialkompetenz).',
    officialPrerequisite:
      'Keine formalen Voraussetzungen · Pflichtmodul Wirtschaftsinformatik (laut SVP 2. Semester)',
    studentTip:
      'Unverzichtbare Vorbereitung auf das 12-CP-Projektseminar im 3. Semester und die Masterarbeit! Rechtzeitig mit der 15–20-seitigen Ausarbeitung starten.',
    learningGoals: [
      'Empirische & gestaltungsorientierte Methoden',
      'Forschungsfragestellungen konzipieren',
      'Wissenschaftliche Dokumentation',
      'Team-Argumentation & Lösungstransfer',
    ],
    recommendedFor: ['General', 'BWL', 'Informatik'],
    isTricky: true,
    schedule: [],
  },
  {
    id: 'wahl-58',
    semester: 'sose27',
    code: 'WAHL-58',
    title: 'Applied Research',
    ecampusTitle: 'Applied Research (Weitere Grundlagen / Profil UCeDI)',
    cp: 6,
    area: 'Weitere Grundlagen (WP)',
    language: 'Englisch',
    ecampusLanguageMismatch: false,
    languageNote:
      'Seminar (4 SWS) mit englischem Titel und wissenschaftlicher Forschungsmethodik.',
    examType: 'Präsentation mit schriftlicher Ausarbeitung · Vorleistung S1 (Übungsaufgabe)',
    workload: 3,
    workloadComment:
      '180 Std. (40h Kontaktstudium + 140h Selbststudium). Perfektes Praxis-Pendant zu WI-P2 für qualitative, quantitative & Design-Science-Forschung.',
    officialPrerequisite:
      'Wahlpflichtbereich „Weitere Grundlagen“ (oder Profil UCeDI – keine Doppelanrechnung)',
    studentTip:
      'Wer in Weitere Grundlagen noch 6 CP „Forschung“ sucht (siehe SVP), bekommt hier einen strukturierten Leitfaden bis zur fertigen Forschungsarbeit.',
    learningGoals: [
      'Qualitative & quantitative Methoden',
      'Design Science & Literaturanalyse',
      'Forschungsfrage & Methodendesign',
      'Wissenschaftliche Präsentation',
    ],
    recommendedFor: ['General', 'BWL', 'Informatik'],
    schedule: [],
  },
  {
    id: 'wahl-2',
    semester: 'sose27',
    code: 'WAHL-2',
    title: 'Pattern Recognition and Machine Learning II',
    ecampusTitle: 'Pattern Recognition and Machine Learning II',
    cp: 6,
    area: 'Informatik (WP)',
    language: 'Englisch',
    ecampusLanguageMismatch: false,
    languageNote: 'VLmP (2 SWS) + Ü (2 SWS) komplett auf Englisch.',
    examType: 'Klausur (120 Min.) oder mündl. Prüfung (20 Min.) · Vorleistung S1',
    workload: 5,
    workloadComment:
      '180 Std. (60h Präsenz + 120h Selbststudium). Vertiefende ML-Methoden mit verpflichtenden wöchentlichen Übungsaufgaben (S1).',
    officialPrerequisite:
      'Informatik (WP) oder Profil CIDA (keine Doppelanrechnung). PRML I (WAHL-1) dringend empfohlen.',
    studentTip:
      'Tricky Module! Baut direkt auf PRML I aus dem Wintersemester auf – ideal für den zweiten 6-CP-Block in Informatik WP oder im Profil CIDA.',
    learningGoals: [
      'Fortgeschrittene ML-Modelle',
      'Eigenständige Modellierungsansätze',
      'Systematische Evaluation',
      'Kritischer Methodenvergleich',
    ],
    recommendedFor: ['Informatik'],
    isTricky: true,
    schedule: [],
  },
  {
    id: 'wahl-35',
    semester: 'sose27',
    code: 'WAHL-35',
    title: 'Cases of Digital Transformation',
    ecampusTitle: 'Cases of Digital Transformation (Profil DITraM)',
    cp: 6,
    area: 'Profil DITraM',
    language: 'Englisch',
    ecampusLanguageMismatch: false,
    languageNote: 'Fallstudien-Seminar auf Englisch.',
    examType: 'Wissenschaftliche Seminararbeit (4.000 Wörter) · Vorleistung S1 (Zwischenpräsentation)',
    workload: 3,
    workloadComment:
      '180 Std. (30–60h Kontakt + 120–150h Selbststudium). Entwicklung einer umfassenden eigenen Fallstudie.',
    officialPrerequisite: 'Masterprofil DITraM (24 CP)',
    studentTip:
      'Super Anwendung zu BWL-P1 (Digital Transformation): Statt Klausur schreibst du eine tiefe Fallstudie über ein reales Unternehmen.',
    learningGoals: [
      'Frameworks Digitaler Transformation',
      'Fallstudien-Entwicklung',
      'Technologische Unternehmensfolgen',
      'Analytisches Schreiben',
    ],
    recommendedFor: ['BWL', 'Startup'],
    schedule: [],
  },
  {
    id: 'wahl-30',
    semester: 'sose27',
    code: 'WAHL-30',
    title: 'Computing & Society',
    ecampusTitle: 'Computing & Society (Profil DITraM)',
    cp: 6,
    area: 'Profil DITraM',
    language: 'Englisch',
    ecampusLanguageMismatch: false,
    languageNote: 'VLmP (2 SWS) + Ü (2 SWS) komplett auf Englisch mit englischen Fachartikeln.',
    examType: 'Hausarbeit (ca. 4.000 Wörter), Präsentation oder mündl. Prüfung (20 Min.) · S1',
    workload: 3,
    workloadComment:
      '180h (60h Präsenz + 120h Selbststudium). Interdisziplinäre Textarbeit zu Ethik, Politik und Gesellschaft der IT.',
    officialPrerequisite: 'Masterprofil DITraM (24 CP)',
    studentTip:
      'Toller interdisziplinärer Blick über den Tellerrand – stärkt zudem englische akademische Schreib- und Diskussionspraxis.',
    learningGoals: [
      'Kulturelle & politische IT-Kontexte',
      'Verantwortungsvolle Technikgestaltung',
      'Sozial-/Geisteswissenschaftliche Perspektiven',
      'Englisches wissenschaftliches Schreiben',
    ],
    recommendedFor: ['General', 'BWL'],
    schedule: [],
  },
  {
    id: 'wahl-32',
    semester: 'sose27',
    code: 'WAHL-32',
    title: 'Customer Experience Management',
    ecampusTitle: 'Customer Experience Management (Profil DITraM)',
    cp: 6,
    area: 'Profil DITraM',
    language: 'Deutsch (EN-Literatur)',
    ecampusLanguageMismatch: false,
    languageNote: 'Seminar (4 SWS + Blended Learning) auf Deutsch mit internationaler Literatur.',
    examType: 'Präsentation (inkl. Diskussion) mit schriftlicher Ausarbeitung',
    workload: 3,
    workloadComment:
      '180 Std. (60h Kontakt + 120h Selbststudium). Customer Journey Touchpoints und verhaltenswissenschaftliche Theorien.',
    officialPrerequisite: 'Masterprofil DITraM (24 CP)',
    studentTip:
      'Stark für Produktmanagement und digitale Marketing-Rollen – angenehm ohne große Klausur am Semesterende.',
    learningGoals: [
      'Determinanten der Customer Experience',
      'Customer Journey Touchpoints',
      'Verhaltenswissenschaftliche Theorien',
      'Organisatorische CEM-Umsetzung',
    ],
    recommendedFor: ['BWL', 'Startup'],
    schedule: [],
  },
  {
    id: 'wahl-19',
    semester: 'sose27',
    code: 'WAHL-19',
    title: 'Soziale Netzwerkanalyse / Social Network Analysis',
    ecampusTitle: 'Soziale Netzwerkanalyse / Social Network Analysis',
    cp: 6,
    area: 'Informatik (WP)',
    language: 'Deutsch (EN-Literatur)',
    ecampusLanguageMismatch: false,
    languageNote: 'VLmP (2 SWS) + Ü (2 SWS). Gleichzeitiger Besuch von „Labor Netzwerke“ (WAHL-13) empfohlen.',
    examType: 'Mündliche Prüfung (ca. 30 Min.) oder schriftliche Prüfung (ca. 120 Min.)',
    workload: 3,
    workloadComment:
      '180h (60h Präsenz + 120h Selbststudium). Graphentheoretische Grundlagen für soziale & digitale Netzwerke.',
    officialPrerequisite:
      'Informatik (WP) oder Profil CIDA (keine Doppelanrechnung).',
    studentTip:
      'Zählt zu den zugänglicheren Informatik-Wahlpflichtmodulen und verbindet Graphenanalyse sehr schön mit Wirtschaftsinformatik-Fragen.',
    learningGoals: [
      'Netzwerk-Metriken & Zentralität',
      'Community Detection',
      'Soziale Graphenanalyse',
      'Anwendung auf digitale Plattformen',
    ],
    recommendedFor: ['Informatik', 'BWL', 'General'],
    schedule: [],
  },
  {
    id: 'wahl-46',
    semester: 'sose27',
    code: 'WAHL-46',
    title: 'Seminar Automatisierung',
    ecampusTitle: 'Seminar Automatisierung (Profil UCeDI)',
    cp: 6,
    area: 'Profil UCeDI',
    language: 'Deutsch',
    ecampusLanguageMismatch: false,
    languageNote: 'Seminar (4 SWS) auf Deutsch.',
    examType: 'Seminarvortrag oder Hausarbeit · Vorleistung S1 (Anwesenheitspflicht)',
    workload: 3,
    workloadComment:
      '180 Std. (60h Kontakt + 120h Selbststudium). Fokus auf menschzentrierte Automatisierungssysteme.',
    officialPrerequisite: 'Masterprofil UCeDI (24 CP) · Anwesenheitspflicht im Seminar',
    studentTip:
      'Gute 6-CP-Ergänzung im UCeDI-Profil, wenn man Automatisierung und Mensch-Maschine-Systeme verbinden möchte.',
    learningGoals: [
      'Wissenschaftlich-technische Automatisierung',
      'Systemanalyse & Bewertung',
      'Präsentation selbsterarbeiteter Themen',
      'Fachdiskussion',
    ],
    recommendedFor: ['Informatik', 'General'],
    schedule: [],
  },
  {
    id: 'wahl-53',
    semester: 'sose27',
    code: 'WAHL-53',
    title: 'Nachhaltige Unternehmensführung: Grundlagen',
    ecampusTitle: 'Nachhaltige Unternehmensführung: Grundlagen (Weitere Grundlagen)',
    cp: 6,
    area: 'Weitere Grundlagen (WP)',
    language: 'Deutsch',
    ecampusLanguageMismatch: false,
    languageNote: 'Vorlesung (4 SWS) auf Deutsch.',
    examType: 'Klausur (mind. 90 Min.)',
    workload: 2,
    workloadComment:
      '180 Std. (60h Präsenz + 120h Selbststudium). Sehr gut strukturierte Vorlesung ohne verpflichtende Studienleistung.',
    officialPrerequisite: 'Wahlpflichtbereich „Weitere Grundlagen“ (12 CP)',
    studentTip:
      'Ruhiges Klausurfach zum Ausbalancieren neben arbeitsintensiven Modulen wie Forschungsmethoden (WI-P2) oder Machine Learning.',
    learningGoals: [
      'Nachhaltigkeitsparadigma in der BWL',
      'Soziale & ökologische Herausforderungen',
      'Handlungsspielräume von Unternehmen',
      'Nachhaltige Wertschöpfung',
    ],
    recommendedFor: ['BWL', 'General'],
    schedule: [],
  },
  {
    id: 'wahl-13',
    semester: 'sose27',
    code: 'WAHL-13',
    title: 'Labor Netzwerke',
    ecampusTitle: 'Labor Netzwerke (Informatik WP / Profil CIDA)',
    cp: 6,
    area: 'Profil CIDA',
    language: 'Deutsch (EN-Literatur)',
    ecampusLanguageMismatch: false,
    languageNote: 'Praktikum (4 SWS). Gleichzeitiger oder vorheriger Besuch von Soziale Netzwerkanalyse (WAHL-19) empfohlen.',
    examType: 'Bearbeitung der Praktikumsaufgaben, mündliche Prüfung (ca. 30 Min.)',
    workload: 3,
    workloadComment:
      '180 Std. (60h Präsenz + 120h Selbststudium). Praktische Umsetzung von Netzwerkanalyse-Konzepten.',
    officialPrerequisite:
      'Masterprofil CIDA (24 CP) oder Informatik WP (keine Doppelanrechnung!).',
    studentTip:
      'Im Sommersemester eine tolle Ergänzung zu WAHL-19 (Soziale Netzwerkanalyse) – bringt 6 CP direkt fürs CIDA-Profil!',
    learningGoals: [
      'Netzwerkanalyse in der Praxis',
      'Graphen-Implementierung',
      'Empirische Auswertung',
      'Praktikums-Dokumentation',
    ],
    recommendedFor: ['Informatik'],
    schedule: [],
  },

  // ========================
  // Studienweite Pflichtbereiche (Schlüsselkompetenzen, Projektseminar, Masterarbeit)
  // ========================
  {
    id: 'kompetenz-k1',
    semester: 'alle',
    code: 'KOMPETENZ-K1',
    title: 'Additive Schlüsselkompetenzen',
    ecampusTitle: 'Additive Schlüsselkompetenzen (KOMPETENZ-K1 · 6 CP)',
    cp: 6,
    area: 'Schlüsselkompetenzen',
    language: 'Deutsch',
    ecampusLanguageMismatch: false,
    languageNote:
      'Abhängig von der gewählten Veranstaltung (z. B. ISZ-Sprachkurse, fachübergreifende Kurse, studentisches Engagement oder Auslandsstudium).',
    examType: 'Spezifikation gemäß gewählter Lehrveranstaltung / Anerkennung',
    workload: 2,
    workloadComment:
      '6 CP Pflichtanteil (laut FPO bis 360 Std. Rahmen / 1 CP pro 30 Std. Praktikum). Sehr flexibel über Semester 1–3 einbringbar.',
    officialPrerequisite:
      'Pflichtbereich Schlüsselkompetenzen (6 CP) gemäß § 8 Abs. 4 FPO · Anmeldung i. d. R. über das Prüfungsamt',
    studentTip:
      'Nutze ISZ-Sprachkurse, ehrenamtliches Engagement, Auslandsleistungen oder ein fachbezogenes Vorpraktikum (bis 180 Std. = 6 CP ohne Praxisbericht!).',
    learningGoals: [
      'Kommunikations- & Sprachkompetenz',
      'Organisations- & Methodenkompetenz',
      'Fachübergreifende Studien',
      'Berufsqualifizierung',
    ],
    recommendedFor: ['General', 'BWL', 'Informatik', 'Startup'],
    schedule: [],
  },
  {
    id: 'projektseminar',
    semester: 'alle',
    code: 'PROJEKTSEMINAR',
    title: 'Projektseminar entsprechend dem Masterprofil',
    ecampusTitle: 'Projektseminar (PROJEKTSEMINAR · 12 CP, laut SVP 3. Semester)',
    cp: 12,
    area: 'Projektseminar',
    language: 'Deutsch (EN-Literatur)',
    ecampusLanguageMismatch: false,
    languageNote:
      'Wird passend zum gewählten Masterprofil (DITraM, UCeDI oder CIDA) absolviert – häufig als 12-CP-Seminar oder zwei 6-CP-Kurse.',
    examType: 'Präsentation mit schriftlicher Ausarbeitung oder Hausarbeit (Forschungsbericht)',
    workload: 4,
    workloadComment:
      '360 Std. Gesamtaufwand (20 Std. Kontaktstudium + 340 Std. Selbststudium). Hoher eigenständiger Forschungsanteil.',
    officialPrerequisite:
      'Pflichtmodul im Masterprofil (12 CP) · Voraussetzung: Nachweis von mindestens 30 Credits im Masterstudium',
    studentTip:
      'Ideale Vorbereitung auf die Masterarbeit im 3. Semester – am besten direkt an dem Fachgebiet belegen, an dem du später auch deine Thesis schreiben möchtest.',
    learningGoals: [
      'Empirische Forschungstätigkeit',
      'Untersuchungsmodell konzipieren',
      'Eigenständige Fragestellung',
      'Wissenschaftlicher Forschungsbericht',
    ],
    recommendedFor: ['General', 'BWL', 'Informatik', 'Startup'],
    schedule: [],
  },
  {
    id: 'masterarbeit',
    semester: 'alle',
    code: 'MASTER',
    title: 'Abschlussmodul: Masterarbeit & Masterkolloquium',
    ecampusTitle: 'Abschlussmodul Masterarbeit (MASTER · 30 CP, § 9 FPO)',
    cp: 30,
    area: 'Masterarbeit',
    language: 'Deutsch',
    ecampusLanguageMismatch: false,
    languageNote:
      'Kann im Einvernehmen mit den Prüfern auch in englischer oder einer anderen Sprache erbracht werden (§ 9 Abs. 5 FPO).',
    examType: 'Masterarbeit (24 Wochen) + Masterkolloquium (25% Gewichtung)',
    workload: 5,
    workloadComment:
      '720 Std. Selbststudium + Abschlusskolloquium (30–60 Min.) oder Begleitkolloquium (3 Präsentationen à 10–20 Min.).',
    officialPrerequisite:
      'Abschlussmodul (30 CP) gemäß § 9 FPO · Voraussetzung: Nachweis von 84 Credits im Masterstudium + alle Auflagen bestanden',
    studentTip:
      'Anmeldung erst möglich, wenn 84 CP erreicht UND alle Auflagen erfüllt sind! Das Thema kann einmalig innerhalb der ersten 7 Wochen zurückgegeben werden.',
    learningGoals: [
      'Anwendungsbezogene Forschungsfrage',
      'Selbständige wissenschaftliche Bearbeitung',
      'Fristgerechte Forschung (24 Wochen)',
      'Verteidigung im Kolloquium',
    ],
    recommendedFor: ['General', 'BWL', 'Informatik', 'Startup'],
    isTricky: true,
    schedule: [],
  },
];

// Default empty timetable on page load / reload; users can pick modules or adopt Dr. Raccoon's 5-module (30 CP) plan
export const DEFAULT_SELECTED_BY_SEMESTER: Record<SemesterId, string[]> = {
  wise2627: [],
  sose27: [],
};

// Exact official Studienverlaufsplan (SVP) 30-CP 1st Semester & 2nd Semester load (conflict-free):
// WiSe 1. Sem: BWL-P2 (6) + WI-P1 (6) + WAHL-48 (6) + WAHL-1 (6) + WAHL-59 (6) = 30 CP
// SoSe 2. Sem: BWL-P1 (6) + WI-P2 (6) + WAHL-58 (6) + WAHL-2 (6) + WAHL-35 (6) = 30 CP
export const PRESET_30_CP_BY_SEMESTER: Record<SemesterId, string[]> = {
  wise2627: ['bwl-p2', 'wi-p1', 'wahl-48', 'wahl-1', 'wahl-59'],
  sose27: ['bwl-p1', 'wi-p2', 'wahl-58', 'wahl-2', 'wahl-35'],
};

export const EXAM_EVENTS: ExamEvent[] = [
  // Nur echte, in den offiziellen Uni-Kassel-PDFs (Vorstellung Master DIT WiSe 26/27, S. 25) dokumentierte Termine
  {
    id: 'ev-kickoff-wahl48',
    semester: 'wise2627',
    dateISO: '2026-10-14',
    dateLabel: 'ab 14.10.2026 (Mi)',
    title: 'Veranstaltungsstart: Rechtliche Grundlagen für Wirtschaftsinformatik',
    moduleCode: 'WAHL-48',
    moduleId: 'wahl-48',
    category: 'Frist',
    locationOrSystem: 'Zeit/Raum fehlt',
    urgency: 'mittel',
  },
  {
    id: 'ev-kickoff-wip1',
    semester: 'wise2627',
    dateISO: '2026-10-15',
    dateLabel: '15.10.2026 (Do) · 10:00–11:00 Uhr',
    title: 'Kickoff: Service-Engineering & -Management',
    moduleCode: 'WI-P1',
    moduleId: 'wi-p1',
    category: 'Frist',
    locationOrSystem: 'Online via Zoom (Regeltermine: Zeit/Raum fehlt)',
    urgency: 'hoch',
  },
  {
    id: 'ev-kickoff-bwlp2',
    semester: 'wise2627',
    dateISO: '2026-10-19',
    dateLabel: '19.10.2026 (Mo) · Uhrzeit fehlt',
    title: 'Kickoff: Informationsmanagement',
    moduleCode: 'BWL-P2',
    moduleId: 'bwl-p2',
    category: 'Frist',
    locationOrSystem: 'Nora-Platiel-Str. 8 · Raum 0422',
    urgency: 'hoch',
  },
  {
    id: 'ev-kickoff-wahl1',
    semester: 'wise2627',
    dateISO: '2026-10-19',
    dateLabel: 'ab 19.10.2026 (Mo)',
    title: 'Veranstaltungsstart: Pattern Recognition and Machine Learning I',
    moduleCode: 'WAHL-1',
    moduleId: 'wahl-1',
    category: 'Frist',
    locationOrSystem: 'Zeit/Raum fehlt',
    urgency: 'mittel',
  },
  {
    id: 'ev-kickoff-wahl8',
    semester: 'wise2627',
    dateISO: '2026-10-20',
    dateLabel: 'ab 20.10.2026 (Di)',
    title: 'Veranstaltungsstart: Begriffliche Datenanalyse / Conceptual Data Analysis',
    moduleCode: 'WAHL-8',
    moduleId: 'wahl-8',
    category: 'Frist',
    locationOrSystem: 'Zeit/Raum fehlt',
    urgency: 'mittel',
  },
  {
    id: 'ev-kickoff-wahl16',
    semester: 'wise2627',
    dateISO: '2026-10-26',
    dateLabel: 'ab 26.10.2026',
    title: 'Veranstaltungsstart: Parallele Programmierung',
    moduleCode: 'WAHL-16',
    moduleId: 'wahl-16',
    category: 'Frist',
    locationOrSystem: 'Zeit/Raum fehlt',
    urgency: 'mittel',
  },
];

export const SEMESTER_MILESTONES: SemesterMilestone[] = [
  {
    id: 'sem-1',
    semester: 1,
    semesterTitle: '1. Semester (WiSe) · Pflichtbasis & Orientierung',
    targetCp: 30,
    tasks: [
      {
        id: 'm1-1',
        label: 'Moodle-Studiengangskurs & Auflagen-Check (§ 6 FPO)',
        detail:
          'Moodle-Kurs (ID 19889) beitreten. Evtl. Auflagen (max. 30 CP aus B.Sc.-Kursen) prüfen; Anmeldung erfolgt manuell über Prüfungsamt, Fragen an studienkoordination-dit@uni-kassel.de.',
      },
      {
        id: 'm1-2',
        label: 'Pflichtmodule BWL-P2 & WI-P1 abschließen (12 CP)',
        detail:
          'Informationsmanagement (BWL-P2) und Service-Engineering & -Management (WI-P1) gemäß Studienverlaufsplan im 1. Semester belegen.',
      },
      {
        id: 'm1-3',
        label: 'Erste Wahlpflichtmodule wählen (18 CP → 30 CP)',
        detail:
          'Aus „Weitere Grundlagen“ (12 CP gesamt, z. B. WAHL-48 Recht), „Informatik WP“ (12 CP gesamt, z. B. WAHL-1/8/16) und einem Masterprofil.',
      },
    ],
  },
  {
    id: 'sem-2',
    semester: 2,
    semesterTitle: '2. Semester (SoSe) · Profilwahl & Forschungsmethoden',
    targetCp: 60,
    tasks: [
      {
        id: 'm2-1',
        label: 'Pflichtmodule BWL-P1 & WI-P2 abschließen (12 CP)',
        detail:
          'Digital Transformation (BWL-P1) und Forschungsmethoden in der Wirtschaftsinformatik (WI-P2) als Kernfundament für Projektseminar und Thesis.',
      },
      {
        id: 'm2-2',
        label: 'Masterprofil verbindlich festlegen (§ 8 Abs. 5 FPO)',
        detail:
          'Wähle DITraM (BWL), UCeDI (Wirtschaftsinformatik) oder CIDA (Informatik, keine Überschneidung mit Informatik-WP!). Profilwechsel nur mit Genehmigung des Prüfungsausschusses.',
      },
      {
        id: 'm2-3',
        label: 'Grundlagen- & Informatik-WP-Kontingente aufbauen (auf 60 CP)',
        detail:
          'Beide 12-CP-Blöcke („Weitere Grundlagen“ & „Informatik WP“) plus erste Profilmodule vorantreiben.',
      },
    ],
  },
  {
    id: 'sem-3',
    semester: 3,
    semesterTitle: '3. Semester (WiSe) · Projektseminar, Schlüsselkompetenzen & Profilabschluss',
    targetCp: 90,
    tasks: [
      {
        id: 'm3-1',
        label: 'Projektseminar entsprechend dem Masterprofil (PROJEKTSEMINAR · 12 CP)',
        detail:
          'Voraussetzung: mind. 30 CP im Studium. Eigenständige empirische/anwendungsbezogene Forschung (ggf. auch 2×6 CP Kurse) mit Forschungsbericht.',
      },
      {
        id: 'm3-2',
        label: 'Additive Schlüsselkompetenzen einbringen (KOMPETENZ-K1 · 6 CP)',
        detail:
          'Z. B. Sprachkurse (ISZ/Sprachenzentrum), studentisches Engagement, Auslandsstudium oder fachfremde Module (Anmeldung i. d. R. über Prüfungsamt).',
      },
      {
        id: 'm3-3',
        label: 'Masterprofil (24 CP) & alle Auflagen vor 84-CP-Marke abschließen',
        detail:
          'Spätestens jetzt alle Auflagen nach § 6 FPO nachweisen, da ab 84 CP die Masterarbeit angemeldet werden darf.',
      },
    ],
  },
  {
    id: 'sem-4',
    semester: 4,
    semesterTitle: '4. Semester (SoSe) · Masterabschlussmodul (MASTER · 30 CP)',
    targetCp: 120,
    tasks: [
      {
        id: 'm4-1',
        label: 'Anmeldung der Masterarbeit ab 84 Credits (§ 9 FPO)',
        detail:
          'Voraussetzung: mind. 84 Master-CP + alle Auflagen erfüllt. Bearbeitungszeit: 24 Wochen (Thema einmalig in ersten 7 Wochen rückgebbar).',
      },
      {
        id: 'm4-2',
        label: 'Masterarbeit & Masterkolloquium erfolgreich verteidigen (30 CP)',
        detail:
          'Abschlusskolloquium (30–60 Min., max. 10 Wochen nach Abgabe) oder 3 Begleitkolloquiums-Präsentationen (25% Gewichtung) → Master of Science (120 CP).',
      },
    ],
  },
];

export function detectScheduleConflicts(modules: DitModule[]): ScheduleConflict[] {
  const slotMap = new Map<string, { day: Weekday; startHour: number; modules: DitModule[] }>();

  for (const mod of modules) {
    for (const slot of mod.schedule) {
      const key = `${slot.day}-${slot.startHour}`;
      const existing = slotMap.get(key);
      if (existing) {
        if (!existing.modules.some((m) => m.id === mod.id)) {
          existing.modules.push(mod);
        }
      } else {
        slotMap.set(key, {
          day: slot.day,
          startHour: slot.startHour,
          modules: [mod],
        });
      }
    }
  }

  return Array.from(slotMap.values()).filter((entry) => entry.modules.length > 1);
}

export function getLastUserExam(
  semester: SemesterId,
  selectedModuleIds: string[]
): ExamEvent | null {
  const semesterEvents = EXAM_EVENTS.filter((ev) => ev.semester === semester);
  const matching = semesterEvents.filter(
    (ev) => ev.moduleId && selectedModuleIds.includes(ev.moduleId)
  );
  const pool = matching.length > 0 ? matching : semesterEvents;
  if (pool.length === 0) return null;

  return [...pool].sort((a, b) => a.dateISO.localeCompare(b.dateISO))[
    pool.length - 1
  ];
}

export function getModuleWorkloadPhases(mod: DitModule): WorkloadPhase[] {
  const examLower = mod.examType.toLowerCase();
  const hasS1 =
    examLower.includes('vorleistung') ||
    examLower.includes('s1') ||
    mod.workloadComment.toLowerCase().includes('übungs') ||
    mod.workloadComment.toLowerCase().includes('studienleistung');
  const isSeminarOrProject =
    examLower.includes('präsentation') ||
    examLower.includes('ausarbeitung') ||
    examLower.includes('hausarbeit') ||
    examLower.includes('projektarbeit') ||
    examLower.includes('exposé') ||
    examLower.includes('praktikum');

  if (mod.area === 'Masterarbeit') {
    return [
      {
        phase: 'Themenfindung & Exposé (Woche 1–7)',
        detail:
          'Forschungsfrage schärfen, Betreuer abstimmen; einmalige Rückgabe des Themas innerhalb der ersten 7 Wochen möglich.',
        intensity: 'Mittel',
      },
      {
        phase: 'Empirie, Implementierung & Begleitkolloquium',
        detail:
          'Hauptbearbeitungsphase (24 Wochen insgesamt) inkl. Datenerhebung/Prototyping und Zwischenpräsentationen.',
        intensity: 'Hoch',
      },
      {
        phase: 'Schriftliche Finalisierung & Kolloquium',
        detail:
          'Abgabe in 2 gebundenen Exemplaren + PDF sowie Verteidigung (25 % Gewichtung an der Modulnote).',
        intensity: 'Hoch',
      },
    ];
  }

  if (mod.area === 'Projektseminar') {
    return [
      {
        phase: 'Einarbeitung & Untersuchungsmodell',
        detail:
          '20 Std. Kontaktstudium mit Lehrstuhl-Betreuung; Literaturbasis und Forschungsdesign festlegen.',
        intensity: 'Mittel',
      },
      {
        phase: 'Datenerhebung / Empirische Durchführung',
        detail:
          '340 Std. Selbststudium: Interviews, Experimente oder Artefakt-Entwicklung im Team.',
        intensity: 'Hoch',
      },
      {
        phase: 'Forschungsbericht & Abschlusspräsentation',
        detail:
          'Wissenschaftlicher Bericht und Präsentation der Ergebnisse am Fachgebiet.',
        intensity: 'Hoch',
      },
    ];
  }

  if (mod.area === 'Schlüsselkompetenzen') {
    return [
      {
        phase: 'Kurs- / Engagementwahl',
        detail:
          'ISZ-Sprachkurs, studentisches Engagement, Auslandsleistung oder Vorpraktikum (bis 180 Std.) auswählen.',
        intensity: 'Niedrig',
      },
      {
        phase: 'Laufende Teilnahme / Nachweise sammeln',
        detail:
          'Regelmäßige Anwesenheit bzw. Dokumentation der erbrachten Stunden über Semester 1–3.',
        intensity: 'Niedrig',
      },
      {
        phase: 'Anerkennung beim Prüfungsamt',
        detail:
          'Einreichen der Bescheinigung / Teilnahmescheine (ohne Einfluss auf Master-Endnote bei unbenoteten Leistungen).',
        intensity: 'Niedrig',
      },
    ];
  }

  const weeklyIntensity: WorkloadIntensity =
    mod.workload >= 5 || mod.cp >= 9
      ? 'Hoch'
      : mod.workload >= 3 || mod.language === 'Englisch'
      ? 'Mittel'
      : 'Niedrig';

  const midtermIntensity: WorkloadIntensity = hasS1
    ? 'Hoch'
    : isSeminarOrProject
    ? 'Mittel'
    : 'Niedrig';

  const finalIntensity: WorkloadIntensity =
    mod.workload >= 4 || mod.isTricky ? 'Hoch' : 'Mittel';

  return [
    {
      phase: 'Wöchentliche Vorlesung / Seminar & Lektüre',
      detail:
        mod.language === 'Englisch'
          ? `Englischsprachige Sitzungen (${mod.schedule.length > 0 ? `${mod.schedule.length} Blöcke/Woche` : 'Block/Seminar'}) und Fachliteratur.`
          : mod.language === 'Deutsch (EN-Literatur)'
          ? 'Vorlesung/Seminar auf Deutsch mit ergänzender englischsprachiger Fachliteratur.'
          : 'Regelmäßige Teilnahme an Vorlesung/Übung und Nachbereitung auf Deutsch.',
      intensity: weeklyIntensity,
    },
    {
      phase: hasS1
        ? 'Midterm-Leistung & Pflicht-Studienleistung (S1/S2)'
        : 'Zwischenphase: Midterm-Pitch / Fallstudien-Vorbereitung',
      detail: hasS1
        ? 'Verbindliche Übungszettel, Praktikumsaufgaben oder Zwischenpräsentation als Voraussetzung für die Prüfungszulassung.'
        : isSeminarOrProject
        ? 'Themenabstimmung, Literaturrecherche und Gliederung bzw. Gruppen-Pitch zur Semestermitte.'
        : 'Kontinuierliche Übungsfälle und Altklausur-Check zur Festigung vor dem Prüfungszeitraum.',
      intensity: midtermIntensity,
    },
    {
      phase: 'Prüfungsphase / Abschlussleistung',
      detail: mod.examType,
      intensity: finalIntensity,
    },
  ];
}

export function getRaccoonWeekTip(mod: DitModule, currentWeek = 5): string {
  const prefix = `Semesterwoche ${currentWeek}`;
  if (mod.area === 'Auflagen') {
    return `${prefix}: Denke daran, Auflagenprüfungen manuell über das Prüfungsamt anzumelden – die Note zählt nicht in den Master-Schnitt, Hauptsache 4,0 bestanden vor der Masterarbeit!`;
  }
  if (mod.area === 'Masterarbeit') {
    return `${prefix}: Prüfe im eCampus, ob deine 84 CP inkl. aller Auflagen vollständig verbucht sind, und bereite 2–3 Themenvorschläge für das Erstgespräch vor.`;
  }
  if (mod.area === 'Projektseminar') {
    return `${prefix}: Jetzt das Forschungsdesign und den Interview-/Datenzugang fixieren, damit am Semesterende genug Puffer für den Forschungsbericht bleibt.`;
  }
  if (mod.area === 'Schlüsselkompetenzen') {
    return `${prefix}: Prüfe ISZ-Sprachkurs-Fristen oder lass dir bereits geleistete Vorpraktika (bis 180 Std. = 6 CP ohne Bericht) direkt anerkennen.`;
  }
  if (mod.isTricky) {
    return `${prefix}: Achtung bei „${mod.code}“ – bilde jetzt eine feste Lerngruppe für die wöchentlichen Übungsaufgaben (S1/Praktikum), damit die Zulassung nicht wackelt.`;
  }
  if (mod.ecampusLanguageMismatch) {
    return `${prefix}: Sprachbrücke beachten! Auch wenn eCampus einen deutschen Titel anzeigt, lohnt es sich jetzt, englische Fachbegriffe und Folien direkt mitzuschreiben.`;
  }
  if (
    mod.examType.toLowerCase().includes('präsentation') ||
    mod.examType.toLowerCase().includes('ausarbeitung')
  ) {
    return `${prefix}: Guter Zeitpunkt, um innerhalb der Seminargruppe Arbeitspakete, Literaturquellen und Interview-/Case-Partner verbindlich abzustimmen.`;
  }
  return `${prefix}: Nutze die aktuellen Vorlesungsinhalte für eine erste kompakte Zusammenfassung – ${mod.studentTip}`;
}

export function getModuleIntroduction(mod: DitModule): string {
  if (mod.description && mod.description.trim()) {
    return mod.description.trim();
  }
  const goalsText =
    mod.learningGoals.length > 0
      ? `Im Mittelpunkt stehen Themen wie ${mod.learningGoals.join(', ')}.`
      : '';
  const parts = [
    `Das Modul „${mod.title}“ (${mod.code}) umfasst ${mod.cp} ECTS im Bereich „${mod.area}“.`,
    goalsText,
    mod.languageNote,
    mod.workloadComment,
  ].filter(Boolean);
  return parts.join(' ');
}

