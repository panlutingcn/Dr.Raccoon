import type {
  DitModule,
  ModuleArea,
  SemesterId,
  SessionType,
  TeachingLanguage,
  Weekday,
} from "../data/ditCatalog";
import {
  BACHELOR_BACKGROUND_OPTIONS,
  MASTER_PROFILE_OPTIONS,
  WORKLOAD_PREFERENCE_OPTIONS,
  type AppLanguage,
  type BachelorBackground,
  type CurrentStudySemester,
  type MasterProfileChoice,
  type UserProfile,
  type WorkloadPreference,
} from "../types/userProfile";

export function isRtlLanguage(lang: AppLanguage): boolean {
  return lang === "fa";
}

export function getLanguageDirection(lang: AppLanguage): "rtl" | "ltr" {
  return isRtlLanguage(lang) ? "rtl" : "ltr";
}

export const LANGUAGE_SELECT_LABELS: Record<
  AppLanguage,
  Record<AppLanguage, string>
> = {
  de: {
    de: "Deutsch",
    en: "Englisch (English)",
    fa: "Persisch (فارسی)",
    fr: "Französisch (Français)",
    zh: "Chinesisch (中文)",
  },
  en: {
    de: "German (Deutsch)",
    en: "English",
    fa: "Persian (فارسی)",
    fr: "French (Français)",
    zh: "Chinese (中文)",
  },
  fa: {
    de: "آلمانی (Deutsch)",
    en: "انگلیسی (English)",
    fa: "فارسی (Persian)",
    fr: "فرانسوی (Français)",
    zh: "چینی (中文)",
  },
  fr: {
    de: "Allemand (Deutsch)",
    en: "Anglais (English)",
    fa: "Persan (فارسی)",
    fr: "Français",
    zh: "Chinois (中文)",
  },
  zh: {
    de: "德语 (Deutsch)",
    en: "英语 (English)",
    fa: "波斯语 (فارسی)",
    fr: "法语 (Français)",
    zh: "中文 (Chinese)",
  },
};

export interface AppTranslation {
  documentTitle: {
    base: string;
    timetable: string;
    exams: string;
  };
  nav: {
    homeAria: string;
    mainNavAria: string;
    timetable: string;
    exams: string;
    editProfileTitle: string;
    editProfileAriaPrefix: string;
  };
  bridge: {
    label: (shortLabel: string) => string;
  };
  sections: {
    timetableTitle: (shortLabel: string) => string;
    examsTitle: (shortLabel: string) => string;
    currentSemesterBadge: string;
    nextSemesterBadge: string;
  };
  footer: {
    aboutHeading: string;
    description: string;
    moduleContext: string;
    docsHeading: string;
    docLinks: {
      svp: string;
      fpo: string;
      makeup: string;
      intro: string;
    };
    quickLinksHeading: string;
    quickLinks: {
      chat: string;
      timetable: string;
      exams: string;
      editProfile: string;
      fillProfile: string;
    };
    bottomLeft: string;
    bottomRight: string;
  };
  chat: {
    sectionAria: string;
    emptyProfileNote: string;
    fillProfileBtn: string;
    editProfileTitle: string;
    subtitle: string;
    greetingPrefix: string;
    greetingQuestion: string;
    inputSrLabel: string;
    inputPlaceholder: (targetEcts: number) => string;
    send: string;
    startersHeading: string;
    refreshStarters: string;
    refreshTitle: string;
    docTitle: string;
    docMeta: string;
    thinking: string;
    proposalQuestion: string;
    proposalModulesLabel: string;
    proposalAccept: string;
    proposalDismiss: string;
    proposalAccepted: (codes: string) => string;
    newChat: string;
    newChatTitle: string;
    errorFallback: string;
    streamError: string;
    emptyResponseError: string;
    connectionError: string;
    promptStarters: string[];
  };
  profileModal: {
    title: string;
    subtitle: string;
    closeAria: string;
    fields: {
      language: string;
      bachelor: string;
      customBachelor: string;
      customBachelorPlaceholder: string;
      masterProfile: string;
      semester: string;
      partTimeJob: string;
      jobStatusAria: string;
      noJob: string;
      partTimeStudent: string;
      hoursPerWeek: string;
      hoursUnit: string;
      workload: string;
    };
    resetBtn: string;
    cancelBtn: string;
    saveBtn: string;
  };
  profileOptions: {
    bachelor: Record<
      BachelorBackground,
      { label: string; shortLabel: string }
    >;
    masterProfile: Record<
      MasterProfileChoice,
      { label: string; shortLabel: string }
    >;
    semester: Record<CurrentStudySemester, string>;
    workload: Record<
      WorkloadPreference,
      { label: string; description: string; chipLabel: string }
    >;
    openLabel: string;
    hoursPerWeekShort: (hours: number) => string;
    bachelorChipPrefix: string;
    profileChipPrefix: string;
    partTimeChip: (hours: number) => string;
    noJobChip: string;
    targetChipPrefix: string;
    otherBachelorPrefix: string;
  };
  timetable: {
    conflictSingular: string;
    conflictPlural: string;
    makeupAddOn: (cp: number) => string;
    savePdf: string;
    savePdfDisabledTitle: string;
    savePdfTitle: string;
    clear: string;
    emptyProfileStatus: string;
    adjustProfile: string;
    emptyGridTitle: (shortLabel: string) => string;
    emptyGridSubtitle: string;
    gridTimeCol: string;
    gridTimeUntil: (endHourStr: string) => string;
    editSlotTitle: (title: string, sessionType: string) => string;
    removeModuleTitle: (title: string) => string;
    editDetailsTitle: string;
    selectedModulesHeading: (count: number) => string;
    catalogHeading: (shortLabel: string) => string;
    addCustomModule: string;
    cancel: string;
    newModuleHeading: (shortLabel: string) => string;
    missingScheduleHint: string;
    customForm: {
      code: string;
      codePlaceholder: string;
      title: string;
      titlePlaceholder: string;
      ects: string;
      area: string;
      language: string;
      sessionType: string;
      weekdayOptional: string;
      noDayOption: string;
      startFree: string;
      endFree: string;
      roomOptional: string;
      roomPlaceholder: string;
      examTypeOptional: string;
      examTypePlaceholder: string;
      examDateOptional: string;
      examDatePlaceholder: string;
      saveAndAdd: string;
      errMissingTitle: string;
      errInvalidTime: string;
    };
    searchPlaceholder: string;
    languageFilterAria: string;
    languageFilterOptions: {
      all: string;
      english: string;
      german: string;
      bridge: string;
    };
    noModulesFound: string;
    resetFilters: string;
    customModuleBadge: string;
    languageBridgeBadge: string;
    conflictBadge: string;
    deleteCustomTitle: (title: string) => string;
    selectedBtn: string;
    addBtn: string;
    moduleAriaLabel: (code: string, title: string) => string;
    detailModal: {
      closeAria: string;
      introHeading: string;
      prerequisiteLabel: string;
      editSectionHeading: string;
      addSlotBtn: string;
      sessionTypeAria: (idx: number) => string;
      inTimetableLabel: string;
      removeSlotTitle: string;
      resetSlotTitle: string;
      weekdayLabel: string;
      startLabel: string;
      endLabel: string;
      roomLabel: string;
      roomPlaceholder: string;
      slotTip: string;
      examTypeLabel: string;
      examDateLabel: string;
      teachingLangLabel: string;
      notesLabel: string;
      resetBtn: string;
      saveChangesBtn: string;
      errMissingWeekday: (sessionType: string) => string;
      errInvalidSlotTime: (sessionType: string, day: string) => string;
    };
  };
  exams: {
    trackerAria: string;
    trackerTitle: string;
    trackerSubtitle: (studySemesterLabel: string) => string;
    progressAria: string;
    collected: string;
    planned: (shortLabel: string) => string;
    remaining: string;
    currentSemesterLead: string;
    currentSemesterTextPrefix: string;
    currentSemesterName: string;
    nextSemesterLead: string;
    nextSemesterTextPrefix: string;
    nextSemesterName: string;
    nextSemesterCarriedOver: (cp: number) => string;
    lastExamFinished: string;
    confirmLastExam: string;
    backToWise: string;
    selectedExamsHeading: (shortLabel: string) => string;
    selectedExamsSubheading: string;
    moduleSingular: string;
    modulePlural: string;
    savePdf: string;
    savePdfDisabledTitle: string;
    savePdfTitle: string;
    emptyTitle: string;
    emptySubtitle: string;
    goToTimetable: string;
    makeupDone: string;
    makeupOpen: string;
    examTypeLabel: string;
    examDateRoomLabel: string;
    courseScheduleLabel: string;
    missingDateRoom: string;
  };
  catalog: {
    semesters: Record<
      SemesterId,
      { label: string; shortLabel: string; studySemesterLabel: string }
    >;
    weekdays: Record<Weekday, string>;
    sessionTypes: Record<SessionType, string>;
    teachingLanguages: Record<TeachingLanguage, string>;
    areas: Record<ModuleArea, string>;
    areaFilters: Record<"Alle" | ModuleArea, string>;
    noTimeRoom: string;
    noRoom: string;
    noTime: string;
    noSlotSelected: string;
    introSentence: (
      title: string,
      code: string,
      cp: number,
      areaLabel: string
    ) => string;
    goalsSentence: (goals: string) => string;
    languageLabel: string;
    examLabel: string;
    workloadLabel: string;
    hoursShort: string;
  };
}

export const TRANSLATIONS: Record<AppLanguage, AppTranslation> = {
  de: {
    documentTitle: {
      base: "Dr. Raccoon · Master DIT, Uni Kassel",
      timetable: "Stundenplan · Dr. Raccoon (Master DIT, Uni Kassel)",
      exams: "Prüfungen · Dr. Raccoon (Master DIT, Uni Kassel)",
    },
    nav: {
      homeAria: "Dr. Raccoon – Startseite",
      mainNavAria: "Hauptnavigation",
      timetable: "Stundenplan",
      exams: "Prüfungen",
      editProfileTitle: "Profil bearbeiten",
      editProfileAriaPrefix: "Profil bearbeiten",
    },
    bridge: {
      label: (shortLabel) => `Semesterplanung & Kurswahl (${shortLabel})`,
    },
    sections: {
      timetableTitle: (shortLabel) => `Stundenplan · ${shortLabel}`,
      examsTitle: (shortLabel) => `Prüfungen · ${shortLabel}`,
      currentSemesterBadge: "Aktuelles Semester",
      nextSemesterBadge: "Nächstes Semester",
    },
    footer: {
      aboutHeading: "KI-Studienberatung",
      description:
        "Digitale Semesterplanung, Modulauswahl und Prüfungsübersicht für den Masterstudiengang Digitale Innovation und Transformation an der Universität Kassel.",
      moduleContext: "Modul: Prompt Engineering · Universität Kassel",
      docsHeading: "Offizielle Unterlagen (FB 07)",
      docLinks: {
        svp: "Studienverlaufsplan (WiSe 2026/27)",
        fpo: "Fachprüfungsordnung (PO 2025)",
        makeup: "Kursempfehlung für Auflagen (§ 6 FPO)",
        intro: "Studiengangsvorstellung Master DIT",
      },
      quickLinksHeading: "Schnellzugriff",
      quickLinks: {
        chat: "KI-Studienberatung",
        timetable: "Stundenplan & Kurswahl",
        exams: "Prüfungen & ECTS",
        editProfile: "Profil bearbeiten",
        fillProfile: "Studienprofil ausfüllen",
      },
      bottomLeft: "Universität Kassel · Master DIT · Modul: Prompt Engineering",
      bottomRight:
        "Unverbindliche Planungshilfe – verbindliche Zeiten & Fristen in eCampus/HISPOS prüfen.",
    },
    chat: {
      sectionAria: "Interaktiver KI-Studienberater Dr. Raccoon",
      emptyProfileNote:
        "Hinweis: Fülle dein Studienprofil aus, damit Dr. Raccoon dich passgenau berät.",
      fillProfileBtn: "Profil ausfüllen",
      editProfileTitle: "Gespeichertes Studienprofil bearbeiten",
      subtitle: "KI-Studienberatung · Master DIT · Universität Kassel (FB 07)",
      greetingPrefix: "Hi, ich bin",
      greetingQuestion: "Wie planen wir dieses Semester?",
      inputSrLabel: "Frage an Dr. Raccoon stellen",
      inputPlaceholder: (targetEcts) =>
        `Frag mich zu Modulen, Auflagen (§ 6 FPO) oder einem konfliktfreien ${targetEcts}-ECTS-Stundenplan.`,
      send: "Senden",
      startersHeading: "Schnellstart-Fragen",
      refreshStarters: "Aktualisieren",
      refreshTitle: "Neue Schnellstart-Fragen anzeigen",
      docTitle: "Prüfungsordnung und Modulhandbuch",
      docMeta: "Universität Kassel · Master DIT (FB 07)",
      thinking: "Dr. Raccoon prüft Prüfungsordnung & Zeiten…",
      proposalQuestion:
        "Soll dein aktueller Stundenplan durch diesen Vorschlag ersetzt werden?",
      proposalModulesLabel: "Module",
      proposalAccept: "Ja, Stundenplan aktualisieren",
      proposalDismiss: "Nicht übernehmen",
      proposalAccepted: (codes) =>
        `Dein Stundenplan wurde mit diesem Vorschlag aktualisiert (${codes}).`,
      newChat: "Neuer Chat",
      newChatTitle: "Zurück zur Startansicht mit Schnellstart-Fragen",
      errorFallback:
        "Die Studienberatung konnte deine Anfrage leider nicht verarbeiten.",
      streamError: "Stream-Verbindung konnte nicht aufgebaut werden.",
      emptyResponseError: "Keine Antwort vom KI-Studienberater erhalten.",
      connectionError: "Verbindungsfehler zur KI-Studienberatung.",
      promptStarters: [
        "Stelle mir einen 30-CP-Stundenplan für dieses Semester zusammen.",
        "Ich habe einen B.Sc. in BWL – welche Module & Auflagen passen?",
        "Ich komme aus der Informatik – welchen 30-CP-Plan empfiehlst du?",
        "Welches Masterprofil (DITraM, UCeDI, CIDA) passt am besten zu mir?",
        "Welche Module im WiSe 2026/27 sind komplett auf Englisch?",
        "Wie funktionieren Auflagenfächer (§ 6 FPO) und die Prüfungsanmeldung?",
        "Welche Module gelten als besonders arbeitsintensiv („Tricky Modules“)?",
        "Was muss ich bei der Wahl von CIDA und Informatik-WP beachten?",
        "Wann kann ich frühestens das Projektseminar (12 CP) und die Masterarbeit anmelden?",
        "Wie kann ich die 6 CP Additive Schlüsselkompetenzen (KOMPETENZ-K1) einbringen?",
        "Welche Kickoff-Termine stehen zum Semesterstart im WiSe 2026/27 an?",
        "Kann ich mein Masterprofil nach der ersten Prüfung noch wechseln?",
        "Stelle mir einen entspannten 24-CP-Plan plus 6 CP Auflagen zusammen.",
        "Welche Module aus „Weitere Grundlagen (WP)“ eignen sich für BWLer?",
      ],
    },
    profileModal: {
      title: "Mein Studienprofil · Master DIT",
      subtitle:
        "Personalisiert deinen ECTS-Zähler und Dr. Raccoons Empfehlungen",
      closeAria: "Studienprofil-Fenster schließen",
      fields: {
        language: "6. Sprache",
        bachelor: "1. Bachelor-Hintergrund",
        customBachelor: "Genauer Bachelorstudiengang",
        customBachelorPlaceholder:
          "z. B. Wirtschaftsrecht, Soziologie, Psychologie",
        masterProfile: "2. Gewähltes Master-Profil",
        semester: "3. Aktuelles Fachsemester",
        partTimeJob: "4. Nebenjob / Werkstudent",
        jobStatusAria: "Nebenjob-Status auswählen",
        noJob: "Kein Nebenjob",
        partTimeStudent: "Werkstudent / HiWi",
        hoursPerWeek: "Wochenstunden",
        hoursUnit: "Std./Woche",
        workload: "5. Gewünschter Semester-Workload",
      },
      resetBtn: "Profil zurücksetzen",
      cancelBtn: "Abbrechen",
      saveBtn: "Profil speichern",
    },
    profileOptions: {
      bachelor: {
        wirtschaftsinformatik: { label: "Wirtschaftsinformatik", shortLabel: "WI" },
        wirtschaftswissenschaften: {
          label: "Wirtschaftswissenschaften",
          shortLabel: "WiWi",
        },
        informationswissenschaften: {
          label: "Informationswissenschaften",
          shortLabel: "InfoWiss",
        },
        software_engineering: {
          label: "Software Engineering",
          shortLabel: "SE",
        },
        sonstiges: { label: "Sonstiges", shortLabel: "Sonstiges" },
      },
      masterProfile: {
        undecided: { label: "Noch unentschieden", shortLabel: "Unentschieden" },
        DITraM: {
          label: "DITraM (Digital Transformation Management)",
          shortLabel: "DITraM",
        },
        UCeDI: {
          label: "UCeDI (User-Centered Digital Innovation)",
          shortLabel: "UCeDI",
        },
        CIDA: {
          label: "CIDA (Computational Intelligence & Data Analytics)",
          shortLabel: "CIDA",
        },
      },
      semester: {
        1: "1. Semester",
        2: "2. Semester",
        3: "3. Semester",
        4: "4. Semester (Masterarbeit)",
      },
      workload: {
        relaxed: {
          label: "Entspannt (~24 ECTS)",
          description:
            "Mehr Puffer für Nebenjob, Auflagen oder vertieftes Lernen.",
          chipLabel: "24 ECTS",
        },
        standard: {
          label: "Standard (~30 ECTS)",
          description: "Reguläres Vollzeit-Tempo gemäß Studienverlaufsplan.",
          chipLabel: "30 ECTS",
        },
        intensive: {
          label: "Intensiv (>30 ECTS, z. B. inkl. Auflagen)",
          description:
            "Erhöhtes Arbeitspensum z. B. beim Nachholen von Auflagen (§ 6 FPO).",
          chipLabel: ">30 ECTS",
        },
      },
      openLabel: "Offen",
      hoursPerWeekShort: (h) => `${h}h/Wo.`,
      bachelorChipPrefix: "Bachelor",
      profileChipPrefix: "Profil",
      partTimeChip: (h) => `Werkstudent: ${h}h/Wo.`,
      noJobChip: "Kein Nebenjob",
      targetChipPrefix: "Ziel",
      otherBachelorPrefix: "Sonstiges",
    },
    timetable: {
      conflictSingular: "Konflikt",
      conflictPlural: "Konflikte",
      makeupAddOn: (cp) => `(+${cp} ECTS Auflagen)`,
      savePdf: "Als PDF speichern",
      savePdfDisabledTitle: "Wähle zuerst mindestens ein Modul aus",
      savePdfTitle: "Stundenplan als PDF herunterladen",
      clear: "Leeren",
      emptyProfileStatus:
        "Noch kein Studienprofil hinterlegt · Standardziel: 30 ECTS",
      adjustProfile: "Profil anpassen",
      emptyGridTitle: (shortLabel) =>
        `Dein Stundenplan für ${shortLabel} ist aktuell leer.`,
      emptyGridSubtitle:
        "Wähle unten Module aus dem Angebot oder füge ein eigenes Modul hinzu.",
      gridTimeCol: "Zeit",
      gridTimeUntil: (endHourStr) => `bis ${endHourStr}`,
      editSlotTitle: (title, sessionType) =>
        `${title} (${sessionType}) bearbeiten`,
      removeModuleTitle: (title) => `${title} entfernen`,
      editDetailsTitle: "Termine & Details bearbeiten",
      selectedModulesHeading: (count) =>
        `Aktuell ausgewählte Module (${count}):`,
      catalogHeading: (shortLabel) => `Kurswahl · Modulangebot (${shortLabel})`,
      addCustomModule: "Eigenes Modul hinzufügen",
      cancel: "Abbrechen",
      newModuleHeading: (shortLabel) =>
        `Neues Modul für ${shortLabel} anlegen`,
      missingScheduleHint:
        "Fehlende Zeiten/Räume werden als „Zeit/Raum fehlt“ markiert",
      customForm: {
        code: "Modulcode",
        codePlaceholder: "z. B. WAHL-99",
        title: "Modultitel *",
        titlePlaceholder: "z. B. Data Science Seminar",
        ects: "ECTS",
        area: "Bereich",
        language: "Sprache",
        sessionType: "Terminart",
        weekdayOptional: "Wochentag (optional)",
        noDayOption: "Keine Angabe",
        startFree: "Beginn (frei)",
        endFree: "Ende (frei)",
        roomOptional: "Raum / Ort (optional)",
        roomPlaceholder: "z. B. Nora-Platiel-Str. 1 · R 0210",
        examTypeOptional: "Prüfungsform (optional)",
        examTypePlaceholder: "z. B. Klausur (90 Min.) oder Hausarbeit",
        examDateOptional: "Prüfungstermin & Raum (optional)",
        examDatePlaceholder: "z. B. 18.02.2027, 10:00 · HS 1",
        saveAndAdd: "Speichern & zum Stundenplan",
        errMissingTitle: "Bitte gib einen Modultitel ein.",
        errInvalidTime:
          "Bitte prüfe Start- und Endzeit (Ende muss nach Beginn liegen).",
      },
      searchPlaceholder: "Modul oder Code suchen…",
      languageFilterAria: "Nach Unterrichtssprache filtern",
      languageFilterOptions: {
        all: "Alle Sprachen",
        english: "Englisch",
        german: "Deutsch",
        bridge: "Sprachbrücke (DE → EN)",
      },
      noModulesFound: "Keine passenden Module gefunden.",
      resetFilters: "Filter zurücksetzen",
      customModuleBadge: "Eigenes Modul",
      languageBridgeBadge: "Sprachbrücke",
      conflictBadge: "Zeitüberschneidung",
      deleteCustomTitle: (title) => `${title} löschen`,
      selectedBtn: "Ausgewählt",
      addBtn: "Hinzufügen",
      moduleAriaLabel: (code, title) =>
        `${code} ${title} – Details anzeigen und bearbeiten`,
      detailModal: {
        closeAria: "Detailansicht schließen",
        introHeading: "Kurzvorstellung des Moduls",
        prerequisiteLabel: "Hinweis / Voraussetzung:",
        editSectionHeading: "Termine, Uhrzeiten & Infos anpassen",
        addSlotBtn: "Übung / Tutorium hinzufügen",
        sessionTypeAria: (idx) => `Veranstaltungsart für Termin ${idx}`,
        inTimetableLabel: "Im Stundenplan",
        removeSlotTitle: "Termin entfernen",
        resetSlotTitle: "Termin zurücksetzen",
        weekdayLabel: "Wochentag",
        startLabel: "Beginn",
        endLabel: "Ende",
        roomLabel: "Raum / Ort",
        roomPlaceholder: "z. B. R 0210",
        slotTip:
          "Tipp: Uhrzeiten sind frei wählbar. Über „Im Stundenplan“ wählst du aus, ob ein Termin (z. B. Übung oder Tutorium) im Wochenplan erscheint.",
        examTypeLabel: "Prüfungsform",
        examDateLabel: "Prüfungstermin & Raum",
        teachingLangLabel: "Unterrichtssprache",
        notesLabel: "Kurzvorstellung / Notiz anpassen",
        resetBtn: "Zurücksetzen",
        saveChangesBtn: "Änderungen speichern",
        errMissingWeekday: (sessionType) =>
          `Bitte wähle für „${sessionType}“ einen Wochentag aus oder entferne den leeren Termin.`,
        errInvalidSlotTime: (sessionType, day) =>
          `Bitte prüfe die Uhrzeit für „${sessionType} (${day})“: Die Endzeit muss nach der Startzeit liegen.`,
      },
    },
    exams: {
      trackerAria: "ECTS-Tracker",
      trackerTitle: "ECTS-Tracker",
      trackerSubtitle: (studySemesterLabel) =>
        `Digital Innovation & Transformation · Universität Kassel (FB 07) · ${studySemesterLabel}`,
      progressAria: "Fortschritt im Master DIT in ECTS",
      collected: "Gesammelt",
      planned: (shortLabel) => `Geplant (${shortLabel})`,
      remaining: "Noch offen",
      currentSemesterLead: "Aktuelles Semester:",
      currentSemesterTextPrefix: "Alle Angaben gelten für das",
      currentSemesterName: "Wintersemester 2026/27",
      nextSemesterLead: "Nächstes Semester:",
      nextSemesterTextPrefix: "Planung für",
      nextSemesterName: "Sommersemester 2027",
      nextSemesterCarriedOver: (cp) => `(${cp} ECTS aus WiSe übernommen).`,
      lastExamFinished: "Letzte Prüfung beendet",
      confirmLastExam: "Prüfungsende bestätigen",
      backToWise: "Zurück zu WiSe 2026/27",
      selectedExamsHeading: (shortLabel) =>
        `Prüfungen der gewählten Module (${shortLabel})`,
      selectedExamsSubheading:
        "Es werden ausschließlich deine im Stundenplan ausgewählten Module angezeigt.",
      moduleSingular: "Modul",
      modulePlural: "Module",
      savePdf: "Als PDF speichern",
      savePdfDisabledTitle: "Wähle zuerst mindestens ein Modul im Stundenplan aus",
      savePdfTitle: "Prüfungen als PDF herunterladen",
      emptyTitle: "Keine Module im Stundenplan ausgewählt",
      emptySubtitle:
        "Wähle im Tab „Stundenplan“ Module aus, um ihre Prüfungsinfos zu sehen.",
      goToTimetable: "Zum Stundenplan",
      makeupDone: "Bestanden",
      makeupOpen: "Offen",
      examTypeLabel: "Prüfungsform:",
      examDateRoomLabel: "Prüfungstermin/Raum:",
      courseScheduleLabel: "Lehrveranstaltung:",
      missingDateRoom: "Zeit/Raum fehlt",
    },
    catalog: {
      semesters: {
        wise2627: {
          label: "Wintersemester 2026/27",
          shortLabel: "WiSe 2026/27",
          studySemesterLabel: "1. Fachsemester",
        },
        sose27: {
          label: "Sommersemester 2027",
          shortLabel: "SoSe 2027",
          studySemesterLabel: "2. Fachsemester",
        },
      },
      weekdays: {
        Mo: "Mo",
        Di: "Di",
        Mi: "Mi",
        Do: "Do",
        Fr: "Fr",
      },
      sessionTypes: {
        Vorlesung: "Vorlesung",
        Übung: "Übung",
        Tutorium: "Tutorium",
        Seminar: "Seminar",
        "Übung / Lab": "Übung / Lab",
      },
      teachingLanguages: {
        Englisch: "Englisch",
        Deutsch: "Deutsch",
        "Deutsch (EN-Literatur)": "Deutsch (EN-Literatur)",
      },
      areas: {
        "BWL Pflicht": "BWL Pflicht",
        "Wirtschaftsinformatik Pflicht": "Wirtschaftsinformatik Pflicht",
        "Weitere Grundlagen (WP)": "Weitere Grundlagen (WP)",
        "Informatik (WP)": "Informatik (WP)",
        "Profil DITraM": "Profil DITraM",
        "Profil UCeDI": "Profil UCeDI",
        "Profil CIDA": "Profil CIDA",
        Schlüsselkompetenzen: "Schlüsselkompetenzen",
        Projektseminar: "Projektseminar",
        Masterarbeit: "Masterarbeit",
        Auflagen: "Auflagen",
      },
      areaFilters: {
        Alle: "Alle",
        "BWL Pflicht": "BWL Pflicht (12 CP)",
        "Wirtschaftsinformatik Pflicht": "Wirtschaftsinformatik Pflicht (12 CP)",
        "Weitere Grundlagen (WP)": "Weitere Grundlagen (WP) (12 CP)",
        "Informatik (WP)": "Informatik (WP) (12 CP)",
        "Profil DITraM": "Profil DITraM (24 CP)",
        "Profil UCeDI": "Profil UCeDI (24 CP)",
        "Profil CIDA": "Profil CIDA (24 CP)",
        Schlüsselkompetenzen: "Schlüsselkompetenzen (6 CP)",
        Projektseminar: "Projektseminar (12 CP)",
        Masterarbeit: "Masterarbeit (30 CP)",
        Auflagen: "Auflagen",
      },
      noTimeRoom: "Zeit/Raum fehlt",
      noRoom: "Raum fehlt",
      noTime: "Uhrzeit fehlt",
      noSlotSelected: "Kein Termin im Stundenplan ausgewählt",
      introSentence: (title, code, cp, areaLabel) =>
        `Das Modul „${title}“ (${code}) umfasst ${cp} ECTS im Bereich „${areaLabel}“.`,
      goalsSentence: (goals) => `Im Mittelpunkt stehen Themen wie ${goals}.`,
      languageLabel: "Unterrichtssprache",
      examLabel: "Prüfungsform",
      workloadLabel: "Workload",
      hoursShort: "Std.",
    },
  },

  en: {
    documentTitle: {
      base: "Dr. Raccoon · Master DIT, Universität Kassel",
      timetable: "Timetable · Dr. Raccoon (Master DIT, Universität Kassel)",
      exams: "Exams · Dr. Raccoon (Master DIT, Universität Kassel)",
    },
    nav: {
      homeAria: "Dr. Raccoon – Home",
      mainNavAria: "Main navigation",
      timetable: "Timetable",
      exams: "Exams",
      editProfileTitle: "Edit profile",
      editProfileAriaPrefix: "Edit profile",
    },
    bridge: {
      label: (shortLabel) =>
        `Semester Planning & Course Selection (${shortLabel})`,
    },
    sections: {
      timetableTitle: (shortLabel) => `Timetable · ${shortLabel}`,
      examsTitle: (shortLabel) => `Exams · ${shortLabel}`,
      currentSemesterBadge: "Current Semester",
      nextSemesterBadge: "Next Semester",
    },
    footer: {
      aboutHeading: "AI Study Advisor",
      description:
        "Digital semester planning, course selection, and exam overview for the Master DIT (Digitale Innovation und Transformation) program at Universität Kassel.",
      moduleContext: "Course: Prompt Engineering · Universität Kassel",
      docsHeading: "Official Documents (FB 07)",
      docLinks: {
        svp: "Study Plan / Studienverlaufsplan (WiSe 2026/27)",
        fpo: "Examination Regulations / FPO (PO 2025)",
        makeup: "Recommended Prerequisite Courses / Auflagen (§ 6 FPO)",
        intro: "Program Presentation Master DIT",
      },
      quickLinksHeading: "Quick Access",
      quickLinks: {
        chat: "AI Study Advisor",
        timetable: "Timetable & Course Selection",
        exams: "Exams & ECTS",
        editProfile: "Edit Profile",
        fillProfile: "Set Up Study Profile",
      },
      bottomLeft: "Universität Kassel · Master DIT · Course: Prompt Engineering",
      bottomRight:
        "Non-binding planning aid – verify official schedules & deadlines in eCampus/HISPOS.",
    },
    chat: {
      sectionAria: "Interactive AI Study Advisor Dr. Raccoon",
      emptyProfileNote:
        "Tip: Complete your study profile so Dr. Raccoon can tailor recommendations to you.",
      fillProfileBtn: "Set Up Profile",
      editProfileTitle: "Edit saved study profile",
      subtitle: "AI Study Advisor · Master DIT · Universität Kassel (FB 07)",
      greetingPrefix: "Hi, I'm",
      greetingQuestion: "How should we plan this semester?",
      inputSrLabel: "Ask Dr. Raccoon a question",
      inputPlaceholder: (targetEcts) =>
        `Ask me about modules, Auflagen (§ 6 FPO), or a conflict-free ${targetEcts}-ECTS timetable.`,
      send: "Send",
      startersHeading: "Quick-Start Questions",
      refreshStarters: "Refresh",
      refreshTitle: "Show new quick-start questions",
      docTitle: "Examination Regulations & Module Handbook",
      docMeta: "Universität Kassel · Master DIT (FB 07)",
      thinking: "Dr. Raccoon is checking FPO rules & schedules…",
      proposalQuestion:
        "Would you like to replace your current timetable with this suggestion?",
      proposalModulesLabel: "Modules",
      proposalAccept: "Yes, update timetable",
      proposalDismiss: "Dismiss",
      proposalAccepted: (codes) =>
        `Your timetable has been updated with this suggestion (${codes}).`,
      newChat: "New Chat",
      newChatTitle: "Back to start view with quick-start questions",
      errorFallback:
        "The study advisor could not process your request right now.",
      streamError: "Could not establish stream connection.",
      emptyResponseError: "No response received from the AI study advisor.",
      connectionError: "Connection error to the AI study advisor.",
      promptStarters: [
        "Build me a 30-CP timetable for this semester.",
        "I have a B.Sc. in Business/BWL – which modules & Auflagen fit?",
        "I have a Computer Science background – what 30-CP plan do you recommend?",
        "Which Master track (DITraM, UCeDI, CIDA) suits me best?",
        "Which modules in WiSe 2026/27 are taught completely in English?",
        "How do Auflagen (§ 6 FPO) and exam registration work?",
        "Which modules are considered especially workload-heavy (Tricky Modules)?",
        "What should I watch out for when combining CIDA and Informatik-WP?",
        "When can I register for the Projektseminar (12 CP) and Masterarbeit at the earliest?",
        "How can I fulfill the 6 CP Additive Schlüsselkompetenzen (KOMPETENZ-K1)?",
        "Which kickoff dates are scheduled at the start of WiSe 2026/27?",
        "Can I still switch my Master track after taking my first exam?",
        "Put together a relaxed 24-CP plan plus 6 CP Auflagen.",
        "Which modules from Weitere Grundlagen (WP) work well for BWL students?",
      ],
    },
    profileModal: {
      title: "My Study Profile · Master DIT",
      subtitle:
        "Personalizes your ECTS tracker and Dr. Raccoon's recommendations",
      closeAria: "Close study profile dialog",
      fields: {
        language: "6. Language",
        bachelor: "1. Bachelor Background",
        customBachelor: "Exact Bachelor Program",
        customBachelorPlaceholder:
          "e.g. Business Law, Sociology, Psychology",
        masterProfile: "2. Chosen Master Track",
        semester: "3. Current Study Semester",
        partTimeJob: "4. Part-Time Job / Working Student",
        jobStatusAria: "Select part-time job status",
        noJob: "No Part-Time Job",
        partTimeStudent: "Working Student / HiWi",
        hoursPerWeek: "Hours per week",
        hoursUnit: "hrs/week",
        workload: "5. Desired Semester Workload",
      },
      resetBtn: "Reset Profile",
      cancelBtn: "Cancel",
      saveBtn: "Save Profile",
    },
    profileOptions: {
      bachelor: {
        wirtschaftsinformatik: {
          label: "Wirtschaftsinformatik (Business Information Systems)",
          shortLabel: "WI",
        },
        wirtschaftswissenschaften: {
          label: "Wirtschaftswissenschaften (Business / Economics)",
          shortLabel: "WiWi",
        },
        informationswissenschaften: {
          label: "Informationswissenschaften (Information Science)",
          shortLabel: "InfoSci",
        },
        software_engineering: {
          label: "Software Engineering",
          shortLabel: "SE",
        },
        sonstiges: { label: "Other", shortLabel: "Other" },
      },
      masterProfile: {
        undecided: { label: "Still undecided", shortLabel: "Undecided" },
        DITraM: {
          label: "DITraM (Digital Transformation Management)",
          shortLabel: "DITraM",
        },
        UCeDI: {
          label: "UCeDI (User-Centered Digital Innovation)",
          shortLabel: "UCeDI",
        },
        CIDA: {
          label: "CIDA (Computational Intelligence & Data Analytics)",
          shortLabel: "CIDA",
        },
      },
      semester: {
        1: "1st Semester",
        2: "2nd Semester",
        3: "3rd Semester",
        4: "4th Semester (Masterarbeit)",
      },
      workload: {
        relaxed: {
          label: "Relaxed (~24 ECTS)",
          description:
            "More buffer for part-time work, Auflagen, or deeper study.",
          chipLabel: "24 ECTS",
        },
        standard: {
          label: "Standard (~30 ECTS)",
          description:
            "Regular full-time pace according to the Studienverlaufsplan.",
          chipLabel: "30 ECTS",
        },
        intensive: {
          label: "Intensive (>30 ECTS, e.g. incl. Auflagen)",
          description:
            "Increased workload e.g. when catching up on Auflagen (§ 6 FPO).",
          chipLabel: ">30 ECTS",
        },
      },
      openLabel: "Undecided",
      hoursPerWeekShort: (h) => `${h}h/wk`,
      bachelorChipPrefix: "Bachelor",
      profileChipPrefix: "Track",
      partTimeChip: (h) => `Working student: ${h}h/wk`,
      noJobChip: "No part-time job",
      targetChipPrefix: "Target",
      otherBachelorPrefix: "Other",
    },
    timetable: {
      conflictSingular: "Conflict",
      conflictPlural: "Conflicts",
      makeupAddOn: (cp) => `(+${cp} ECTS Auflagen)`,
      savePdf: "Save as PDF",
      savePdfDisabledTitle: "Select at least one module first",
      savePdfTitle: "Download timetable as PDF",
      clear: "Clear",
      emptyProfileStatus: "No study profile saved yet · Default target: 30 ECTS",
      adjustProfile: "Edit Profile",
      emptyGridTitle: (shortLabel) =>
        `Your timetable for ${shortLabel} is currently empty.`,
      emptyGridSubtitle:
        "Select modules from the catalog below or add a custom module.",
      gridTimeCol: "Time",
      gridTimeUntil: (endHourStr) => `to ${endHourStr}`,
      editSlotTitle: (title, sessionType) => `Edit ${title} (${sessionType})`,
      removeModuleTitle: (title) => `Remove ${title}`,
      editDetailsTitle: "Edit dates & details",
      selectedModulesHeading: (count) => `Currently selected modules (${count}):`,
      catalogHeading: (shortLabel) => `Course Catalog (${shortLabel})`,
      addCustomModule: "Add Custom Module",
      cancel: "Cancel",
      newModuleHeading: (shortLabel) => `Create new module for ${shortLabel}`,
      missingScheduleHint:
        'Missing times/rooms are marked as "Time/Room missing"',
      customForm: {
        code: "Module Code",
        codePlaceholder: "e.g. WAHL-99",
        title: "Module Title *",
        titlePlaceholder: "e.g. Data Science Seminar",
        ects: "ECTS",
        area: "Area",
        language: "Language",
        sessionType: "Session Type",
        weekdayOptional: "Weekday (optional)",
        noDayOption: "Not specified",
        startFree: "Start (custom)",
        endFree: "End (custom)",
        roomOptional: "Room / Location (optional)",
        roomPlaceholder: "e.g. Nora-Platiel-Str. 1 · R 0210",
        examTypeOptional: "Exam Format (optional)",
        examTypePlaceholder: "e.g. Klausur (90 min) or Term Paper",
        examDateOptional: "Exam Date & Room (optional)",
        examDatePlaceholder: "e.g. 18.02.2027, 10:00 · HS 1",
        saveAndAdd: "Save & Add to Timetable",
        errMissingTitle: "Please enter a module title.",
        errInvalidTime:
          "Please check start and end time (end time must be after start time).",
      },
      searchPlaceholder: "Search module or code…",
      languageFilterAria: "Filter by teaching language",
      languageFilterOptions: {
        all: "All Languages",
        english: "English",
        german: "German",
        bridge: "Language Bridge (DE → EN)",
      },
      noModulesFound: "No matching modules found.",
      resetFilters: "Reset Filters",
      customModuleBadge: "Custom Module",
      languageBridgeBadge: "Language Bridge",
      conflictBadge: "Time Conflict",
      deleteCustomTitle: (title) => `Delete ${title}`,
      selectedBtn: "Selected",
      addBtn: "Add",
      moduleAriaLabel: (code, title) =>
        `${code} ${title} – view and edit details`,
      detailModal: {
        closeAria: "Close detail view",
        introHeading: "Module Overview",
        prerequisiteLabel: "Note / Prerequisite:",
        editSectionHeading: "Customize Dates, Times & Info",
        addSlotBtn: "Add Exercise / Tutorial",
        sessionTypeAria: (idx) => `Session type for slot ${idx}`,
        inTimetableLabel: "In timetable",
        removeSlotTitle: "Remove slot",
        resetSlotTitle: "Reset slot",
        weekdayLabel: "Weekday",
        startLabel: "Start",
        endLabel: "End",
        roomLabel: "Room / Location",
        roomPlaceholder: "e.g. R 0210",
        slotTip:
          'Tip: Times can be edited freely. Use "In timetable" to toggle whether a slot (e.g. exercise or tutorial) appears in the weekly grid.',
        examTypeLabel: "Exam Format",
        examDateLabel: "Exam Date & Room",
        teachingLangLabel: "Teaching Language",
        notesLabel: "Edit Overview / Notes",
        resetBtn: "Reset",
        saveChangesBtn: "Save Changes",
        errMissingWeekday: (sessionType) =>
          `Please select a weekday for "${sessionType}" or remove the empty slot.`,
        errInvalidSlotTime: (sessionType, day) =>
          `Please check the time for "${sessionType} (${day})": end time must be after start time.`,
      },
    },
    exams: {
      trackerAria: "ECTS-Tracker",
      trackerTitle: "ECTS-Tracker",
      trackerSubtitle: (studySemesterLabel) =>
        `Digital Innovation & Transformation · Universität Kassel (FB 07) · ${studySemesterLabel}`,
      progressAria: "Progress in Master DIT in ECTS",
      collected: "Earned",
      planned: (shortLabel) => `Planned (${shortLabel})`,
      remaining: "Remaining",
      currentSemesterLead: "Current Semester:",
      currentSemesterTextPrefix: "All details apply to",
      currentSemesterName: "Winter Semester 2026/27 (WiSe 2026/27)",
      nextSemesterLead: "Next Semester:",
      nextSemesterTextPrefix: "Planning for",
      nextSemesterName: "Summer Semester 2027 (SoSe 2027)",
      nextSemesterCarriedOver: (cp) =>
        `(${cp} ECTS carried over from WiSe).`,
      lastExamFinished: "Last exam finished",
      confirmLastExam: "Confirm exams finished",
      backToWise: "Back to WiSe 2026/27",
      selectedExamsHeading: (shortLabel) =>
        `Exams of Selected Modules (${shortLabel})`,
      selectedExamsSubheading:
        "Only modules currently selected in your timetable are displayed.",
      moduleSingular: "Module",
      modulePlural: "Modules",
      savePdf: "Save as PDF",
      savePdfDisabledTitle: "Select at least one module in the timetable first",
      savePdfTitle: "Download exams as PDF",
      emptyTitle: "No modules selected in timetable",
      emptySubtitle:
        'Select modules in the "Timetable" section to see their exam details.',
      goToTimetable: "Go to Timetable",
      makeupDone: "Passed",
      makeupOpen: "Open",
      examTypeLabel: "Exam Format:",
      examDateRoomLabel: "Exam Date/Room:",
      courseScheduleLabel: "Course Schedule:",
      missingDateRoom: "Time/Room missing",
    },
    catalog: {
      semesters: {
        wise2627: {
          label: "Winter Semester 2026/27",
          shortLabel: "WiSe 2026/27",
          studySemesterLabel: "1st Study Semester",
        },
        sose27: {
          label: "Summer Semester 2027",
          shortLabel: "SoSe 2027",
          studySemesterLabel: "2nd Study Semester",
        },
      },
      weekdays: {
        Mo: "Mon",
        Di: "Tue",
        Mi: "Wed",
        Do: "Thu",
        Fr: "Fri",
      },
      sessionTypes: {
        Vorlesung: "Lecture",
        Übung: "Exercise",
        Tutorium: "Tutorial",
        Seminar: "Seminar",
        "Übung / Lab": "Lab / Exercise",
      },
      teachingLanguages: {
        Englisch: "English",
        Deutsch: "German",
        "Deutsch (EN-Literatur)": "German (EN literature)",
      },
      areas: {
        "BWL Pflicht": "BWL Mandatory",
        "Wirtschaftsinformatik Pflicht": "WI Mandatory",
        "Weitere Grundlagen (WP)": "General Foundations (WP)",
        "Informatik (WP)": "Computer Science (WP)",
        "Profil DITraM": "Track DITraM",
        "Profil UCeDI": "Track UCeDI",
        "Profil CIDA": "Track CIDA",
        Schlüsselkompetenzen: "Schlüsselkompetenzen",
        Projektseminar: "Projektseminar",
        Masterarbeit: "Masterarbeit",
        Auflagen: "Auflagen (§ 6 FPO)",
      },
      areaFilters: {
        Alle: "All",
        "BWL Pflicht": "BWL Mandatory (12 CP)",
        "Wirtschaftsinformatik Pflicht": "WI Mandatory (12 CP)",
        "Weitere Grundlagen (WP)": "General Foundations (WP) (12 CP)",
        "Informatik (WP)": "Computer Science (WP) (12 CP)",
        "Profil DITraM": "Track DITraM (24 CP)",
        "Profil UCeDI": "Track UCeDI (24 CP)",
        "Profil CIDA": "Track CIDA (24 CP)",
        Schlüsselkompetenzen: "Schlüsselkompetenzen (6 CP)",
        Projektseminar: "Projektseminar (12 CP)",
        Masterarbeit: "Masterarbeit (30 CP)",
        Auflagen: "Auflagen",
      },
      noTimeRoom: "Time/Room missing",
      noRoom: "Room missing",
      noTime: "Time missing",
      noSlotSelected: "No slot selected in timetable",
      introSentence: (title, code, cp, areaLabel) =>
        `The module "${title}" (${code}) carries ${cp} ECTS in the area "${areaLabel}".`,
      goalsSentence: (goals) => `Key focus topics include ${goals}.`,
      languageLabel: "Language",
      examLabel: "Exam format",
      workloadLabel: "Workload",
      hoursShort: "hrs",
    },
  },

  fa: {
    documentTitle: {
      base: "Dr. Raccoon · Master DIT, Universität Kassel",
      timetable: "برنامه هفتگی · Dr. Raccoon (Master DIT, Universität Kassel)",
      exams: "امتحانات · Dr. Raccoon (Master DIT, Universität Kassel)",
    },
    nav: {
      homeAria: "Dr. Raccoon – صفحه اصلی",
      mainNavAria: "منوی اصلی",
      timetable: "برنامه هفتگی",
      exams: "امتحانات",
      editProfileTitle: "ویرایش پروفایل",
      editProfileAriaPrefix: "ویرایش پروفایل",
    },
    bridge: {
      label: (shortLabel) => `برنامه‌ریزی ترم و انتخاب واحد (${shortLabel})`,
    },
    sections: {
      timetableTitle: (shortLabel) => `برنامه هفتگی · ${shortLabel}`,
      examsTitle: (shortLabel) => `امتحانات · ${shortLabel}`,
      currentSemesterBadge: "ترم جاری",
      nextSemesterBadge: "ترم آینده",
    },
    footer: {
      aboutHeading: "مشاوره تحصیلی هوشمند",
      description:
        "برنامه‌ریزی دیجیتال ترم، انتخاب واحد و نمای کلی امتحانات برای رشته کارشناسی ارشد Digitale Innovation und Transformation (Master DIT) در Universität Kassel.",
      moduleContext: "درس: Prompt Engineering · Universität Kassel",
      docsHeading: "مستندات رسمی (FB 07)",
      docLinks: {
        svp: "برنامه پیشنهادی ترم · Studienverlaufsplan (WiSe 2026/27)",
        fpo: "آیین‌نامه امتحانات · Fachprüfungsordnung (PO 2025)",
        makeup: "دروس پیشنهادی جبرانی · Auflagen (§ 6 FPO)",
        intro: "معرفی رشته Master DIT",
      },
      quickLinksHeading: "دسترسی سریع",
      quickLinks: {
        chat: "مشاوره تحصیلی هوشمند",
        timetable: "برنامه هفتگی و انتخاب واحد",
        exams: "امتحانات و ECTS",
        editProfile: "ویرایش پروفایل",
        fillProfile: "تکمیل پروفایل تحصیلی",
      },
      bottomLeft: "Universität Kassel · Master DIT · درس: Prompt Engineering",
      bottomRight:
        "راهنمای برنامه‌ریزی غیررسمی – زمان‌ها و مهلت‌های رسمی را در eCampus/HISPOS بررسی کنید.",
    },
    chat: {
      sectionAria: "مشاور تحصیلی هوشمند Dr. Raccoon",
      emptyProfileNote:
        "نکته: پروفایل تحصیلی خود را تکمیل کنید تا Dr. Raccoon راهنمایی دقیق‌تری به شما ارائه دهد.",
      fillProfileBtn: "تکمیل پروفایل",
      editProfileTitle: "ویرایش پروفایل تحصیلی ذخیره‌شده",
      subtitle: "مشاوره تحصیلی هوشمند · Master DIT · Universität Kassel (FB 07)",
      greetingPrefix: "سلام، من",
      greetingQuestion: "این ترم را چطور برنامه‌ریزی کنیم؟",
      inputSrLabel: "سوال خود را از Dr. Raccoon بپرسید",
      inputPlaceholder: (targetEcts) =>
        `درباره ماژول‌ها، دروس پیش‌نیاز (Auflagen · § 6 FPO) یا یک برنامه بدون تداخل ${targetEcts} ECTS بپرسید.`,
      send: "ارسال",
      startersHeading: "سوالات پیشنهادی",
      refreshStarters: "به‌روزرسانی",
      refreshTitle: "نمایش سوالات پیشنهادی جدید",
      docTitle: "آیین‌نامه امتحانات و دفترچه ماژول‌ها (FPO & Modulhandbuch)",
      docMeta: "Universität Kassel · Master DIT (FB 07)",
      thinking: "Dr. Raccoon در حال بررسی آیین‌نامه FPO و زمان‌بندی‌هاست…",
      proposalQuestion:
        "آیا مایلید برنامه هفتگی فعلی شما با این پیشنهاد جایگزین شود؟",
      proposalModulesLabel: "ماژول‌ها",
      proposalAccept: "بله، برنامه هفتگی به‌روز شود",
      proposalDismiss: "اعمال نشود",
      proposalAccepted: (codes) =>
        `برنامه هفتگی شما با این پیشنهاد به‌روزرسانی شد (${codes}).`,
      newChat: "گفتگوی جدید",
      newChatTitle: "بازگشت به نمای شروع با سوالات پیشنهادی",
      errorFallback: "مشاور تحصیلی در حال حاضر نتوانست درخواست شما را پردازش کند.",
      streamError: "برقراری اتصال استریم امکان‌پذیر نبود.",
      emptyResponseError: "پاسخی از مشاور تحصیلی دریافت نشد.",
      connectionError: "خطا در اتصال به مشاور تحصیلی هوشمند.",
      promptStarters: [
        "یک برنامه ۳۰ واحدی (30-CP) برای این ترم برای من بچین.",
        "مدرک کارشناسی BWL دارم – کدام ماژول‌ها و Auflagen مناسب است؟",
        "پیش‌زمینه علوم کامپیوتر (Informatik) دارم – چه برنامه 30-CP پیشنهاد می‌کنی؟",
        "کدام گرایش ارشد (DITraM، UCeDI، CIDA) بیشتر با شرایط من هماهنگ است؟",
        "کدام ماژول‌ها در WiSe 2026/27 کاملاً به زبان انگلیسی ارائه می‌شوند؟",
        "قوانین دروس جبرانی Auflagen (§ 6 FPO) و ثبت‌نام امتحان چگونه است؟",
        "کدام ماژول‌ها حجم کاری بسیار بالایی دارند (Tricky Modules)؟",
        "در انتخاب هم‌زمان CIDA و Informatik-WP به چه نکته‌ای باید توجه کنم؟",
        "زودترین زمان ثبت‌نام برای Projektseminar (12 CP) و Masterarbeit چه زمانی است؟",
        "چگونه می‌توانم ۶ واحد مهارت‌های کلیدی KOMPETENZ-K1 را دریافت کنم؟",
        "جلسات معارفه (Kickoff) در شروع ترم WiSe 2026/27 چه زمانی هستند؟",
        "آیا می‌توانم بعد از اولین امتحان، گرایش ارشد خود را تغییر دهم؟",
        "یک برنامه سبک 24-CP به همراه 6 CP از دروس Auflagen پیشنهاد بده.",
        "کدام ماژول‌های بخش Weitere Grundlagen (WP) برای دانشجویان BWL مناسب‌ترند؟",
      ],
    },
    profileModal: {
      title: "پروفایل تحصیلی من · Master DIT",
      subtitle: "شمارنده ECTS و پیشنهادهای Dr. Raccoon را شخصی‌سازی می‌کند",
      closeAria: "بستن پنجره پروفایل تحصیلی",
      fields: {
        language: "۶. زبان (Language)",
        bachelor: "۱. پیش‌زمینه کارشناسی (Bachelor)",
        customBachelor: "عنوان دقیق رشته کارشناسی",
        customBachelorPlaceholder: "مثال: حقوق تجارت، جامعه‌شناسی، روان‌شناسی",
        masterProfile: "۲. گرایش انتخابی ارشد (Master-Profil)",
        semester: "۳. ترم تحصیلی فعلی",
        partTimeJob: "۴. کار دانشجویی / نیمه‌وقت (Werkstudent)",
        jobStatusAria: "انتخاب وضعیت کار نیمه‌وقت",
        noJob: "بدون کار نیمه‌وقت",
        partTimeStudent: "کار دانشجویی / HiWi",
        hoursPerWeek: "ساعات کاری در هفته",
        hoursUnit: "ساعت/هفته",
        workload: "۵. حجم کاری دلخواه در ترم (ECTS)",
      },
      resetBtn: "بازنشانی پروفایل",
      cancelBtn: "انصراف",
      saveBtn: "ذخیره پروفایل",
    },
    profileOptions: {
      bachelor: {
        wirtschaftsinformatik: {
          label: "Wirtschaftsinformatik (انفورماتیک تجاری)",
          shortLabel: "WI",
        },
        wirtschaftswissenschaften: {
          label: "Wirtschaftswissenschaften (اقتصاد و مدیریت)",
          shortLabel: "WiWi",
        },
        informationswissenschaften: {
          label: "Informationswissenschaften (علوم اطلاعات)",
          shortLabel: "InfoWiss",
        },
        software_engineering: {
          label: "Software Engineering (مهندسی نرم‌افزار)",
          shortLabel: "SE",
        },
        sonstiges: { label: "سایر رشته‌ها", shortLabel: "سایر" },
      },
      masterProfile: {
        undecided: { label: "هنوز تصمیم نگرفته‌ام", shortLabel: "نامشخص" },
        DITraM: {
          label: "DITraM (Digital Transformation Management)",
          shortLabel: "DITraM",
        },
        UCeDI: {
          label: "UCeDI (User-Centered Digital Innovation)",
          shortLabel: "UCeDI",
        },
        CIDA: {
          label: "CIDA (Computational Intelligence & Data Analytics)",
          shortLabel: "CIDA",
        },
      },
      semester: {
        1: "ترم ۱",
        2: "ترم ۲",
        3: "ترم ۳",
        4: "ترم ۴ (Masterarbeit)",
      },
      workload: {
        relaxed: {
          label: "سبک (~24 ECTS)",
          description:
            "فضای بیشتر برای کار دانشجویی، دروس Auflagen یا مطالعه عمیق‌تر.",
          chipLabel: "24 ECTS",
        },
        standard: {
          label: "استاندارد (~30 ECTS)",
          description:
            "روند عادی تمام‌وقت مطابق برنامه پیشنهادی (Studienverlaufsplan).",
          chipLabel: "30 ECTS",
        },
        intensive: {
          label: "فشرده (>30 ECTS، مثلاً همراه با Auflagen)",
          description:
            "حجم کاری بالاتر برای مثال هنگام گذراندن هم‌زمان Auflagen (§ 6 FPO).",
          chipLabel: ">30 ECTS",
        },
      },
      openLabel: "نامشخص",
      hoursPerWeekShort: (h) => `${h} ساعت/هفته`,
      bachelorChipPrefix: "کارشناسی",
      profileChipPrefix: "گرایش",
      partTimeChip: (h) => `کار دانشجویی: ${h} ساعت/هفته`,
      noJobChip: "بدون کار نیمه‌وقت",
      targetChipPrefix: "هدف",
      otherBachelorPrefix: "سایر",
    },
    timetable: {
      conflictSingular: "تداخل زمانی",
      conflictPlural: "تداخل زمانی",
      makeupAddOn: (cp) => `(+${cp} ECTS Auflagen)`,
      savePdf: "ذخیره به عنوان PDF",
      savePdfDisabledTitle: "ابتدا حداقل یک ماژول انتخاب کنید",
      savePdfTitle: "دانلود برنامه هفتگی به صورت PDF",
      clear: "پاک کردن",
      emptyProfileStatus:
        "پروفایل تحصیلی ثبت نشده است · هدف پیش‌فرض: 30 ECTS",
      adjustProfile: "تنظیم پروفایل",
      emptyGridTitle: (shortLabel) =>
        `برنامه هفتگی شما برای ${shortLabel} در حال حاضر خالی است.`,
      emptyGridSubtitle:
        "ماژول‌ها را از فهرست زیر انتخاب کنید یا یک ماژول دلخواه اضافه کنید.",
      gridTimeCol: "ساعت",
      gridTimeUntil: (endHourStr) => `تا ${endHourStr}`,
      editSlotTitle: (title, sessionType) => `ویرایش ${title} (${sessionType})`,
      removeModuleTitle: (title) => `حذف ${title}`,
      editDetailsTitle: "ویرایش زمان‌ها و جزئیات",
      selectedModulesHeading: (count) => `ماژول‌های انتخاب‌شده فعلی (${count}):`,
      catalogHeading: (shortLabel) => `انتخاب واحد · فهرست ماژول‌ها (${shortLabel})`,
      addCustomModule: "افزودن ماژول دلخواه",
      cancel: "انصراف",
      newModuleHeading: (shortLabel) => `ایجاد ماژول جدید برای ${shortLabel}`,
      missingScheduleHint:
        "زمان‌ها/کلاس‌های نامشخص با «زمان/کلاس نامشخص» نمایش داده می‌شوند",
      customForm: {
        code: "کد ماژول",
        codePlaceholder: "مثال: WAHL-99",
        title: "عنوان ماژول *",
        titlePlaceholder: "مثال: Data Science Seminar",
        ects: "ECTS",
        area: "بخش",
        language: "زبان",
        sessionType: "نوع کلاس",
        weekdayOptional: "روز هفته (اختیاری)",
        noDayOption: "نامشخص",
        startFree: "ساعت شروع",
        endFree: "ساعت پایان",
        roomOptional: "کلاس / مکان (اختیاری)",
        roomPlaceholder: "مثال: Nora-Platiel-Str. 1 · R 0210",
        examTypeOptional: "نوع امتحان (اختیاری)",
        examTypePlaceholder: "مثال: Klausur (90 Min.) یا Hausarbeit",
        examDateOptional: "تاریخ و محل امتحان (اختیاری)",
        examDatePlaceholder: "مثال: 18.02.2027, 10:00 · HS 1",
        saveAndAdd: "ذخیره و افزودن به برنامه",
        errMissingTitle: "لطفاً عنوان ماژول را وارد کنید.",
        errInvalidTime:
          "لطفاً ساعت شروع و پایان را بررسی کنید (پایان باید بعد از شروع باشد).",
      },
      searchPlaceholder: "جستجوی نام یا کد ماژول…",
      languageFilterAria: "فیلتر بر اساس زبان تدریس",
      languageFilterOptions: {
        all: "همه زبان‌ها",
        english: "انگلیسی (Englisch)",
        german: "آلمانی (Deutsch)",
        bridge: "پل زبانی (DE → EN)",
      },
      noModulesFound: "هیچ ماژول مطابقی یافت نشد.",
      resetFilters: "بازنشانی فیلترها",
      customModuleBadge: "ماژول دلخواه",
      languageBridgeBadge: "پل زبانی",
      conflictBadge: "تداخل زمانی",
      deleteCustomTitle: (title) => `حذف ${title}`,
      selectedBtn: "انتخاب‌شده",
      addBtn: "افزودن",
      moduleAriaLabel: (code, title) =>
        `${code} ${title} – مشاهده و ویرایش جزئیات`,
      detailModal: {
        closeAria: "بستن نمای جزئیات",
        introHeading: "معرفی کوتاه ماژول",
        prerequisiteLabel: "توضیح / پیش‌نیاز:",
        editSectionHeading: "ویرایش زمان‌ها، ساعات و اطلاعات",
        addSlotBtn: "افزودن Übung / Tutorium",
        sessionTypeAria: (idx) => `نوع کلاس برای جلسه ${idx}`,
        inTimetableLabel: "در برنامه هفتگی",
        removeSlotTitle: "حذف جلسه",
        resetSlotTitle: "بازنشانی جلسه",
        weekdayLabel: "روز هفته",
        startLabel: "شروع",
        endLabel: "پایان",
        roomLabel: "کلاس / مکان",
        roomPlaceholder: "مثال: R 0210",
        slotTip:
          "نکته: ساعات کلاس قابل ویرایش هستند. با گزینه «در برنامه هفتگی» می‌توانید مشخص کنید آیا این جلسه در جدول هفتگی نمایش داده شود یا خیر.",
        examTypeLabel: "نوع امتحان",
        examDateLabel: "تاریخ و محل امتحان",
        teachingLangLabel: "زبان تدریس",
        notesLabel: "ویرایش معرفی / یادداشت",
        resetBtn: "بازنشانی",
        saveChangesBtn: "ذخیره تغییرات",
        errMissingWeekday: (sessionType) =>
          `لطفاً برای «${sessionType}» یک روز هفته انتخاب کنید یا جلسه خالی را حذف کنید.`,
        errInvalidSlotTime: (sessionType, day) =>
          `لطفاً ساعت «${sessionType} (${day})» را بررسی کنید: ساعت پایان باید بعد از ساعت شروع باشد.`,
      },
    },
    exams: {
      trackerAria: "ECTS-Tracker",
      trackerTitle: "ECTS-Tracker",
      trackerSubtitle: (studySemesterLabel) =>
        `Digital Innovation & Transformation · Universität Kassel (FB 07) · ${studySemesterLabel}`,
      progressAria: "پیشرفت در Master DIT بر حسب ECTS",
      collected: "گذرانده‌شده",
      planned: (shortLabel) => `برنامه‌ریزی‌شده (${shortLabel})`,
      remaining: "باقی‌مانده",
      currentSemesterLead: "ترم جاری:",
      currentSemesterTextPrefix: "همه اطلاعات مربوط به",
      currentSemesterName: "ترم زمستانی 2026/27 (WiSe 2026/27)",
      nextSemesterLead: "ترم آینده:",
      nextSemesterTextPrefix: "برنامه‌ریزی برای",
      nextSemesterName: "ترم تابستانی 2027 (SoSe 2027)",
      nextSemesterCarriedOver: (cp) =>
        `(${cp} ECTS از ترم زمستانی منتقل شد).`,
      lastExamFinished: "آخرین امتحان به پایان رسید",
      confirmLastExam: "تایید پایان امتحانات",
      backToWise: "بازگشت به WiSe 2026/27",
      selectedExamsHeading: (shortLabel) =>
        `امتحانات ماژول‌های انتخاب‌شده (${shortLabel})`,
      selectedExamsSubheading:
        "فقط ماژول‌هایی که در برنامه هفتگی انتخاب کرده‌اید نمایش داده می‌شوند.",
      moduleSingular: "ماژول",
      modulePlural: "ماژول",
      savePdf: "ذخیره به عنوان PDF",
      savePdfDisabledTitle: "ابتدا حداقل یک ماژول در برنامه هفتگی انتخاب کنید",
      savePdfTitle: "دانلود امتحانات به صورت PDF",
      emptyTitle: "هیچ ماژولی در برنامه هفتگی انتخاب نشده است",
      emptySubtitle:
        "برای مشاهده اطلاعات امتحان، ماژول‌ها را از بخش «برنامه هفتگی» انتخاب کنید.",
      goToTimetable: "رفتن به برنامه هفتگی",
      makeupDone: "قبول‌شده",
      makeupOpen: "در انتظار",
      examTypeLabel: "نوع امتحان:",
      examDateRoomLabel: "تاریخ/محل امتحان:",
      courseScheduleLabel: "زمان کلاس:",
      missingDateRoom: "زمان/مکان نامشخص",
    },
    catalog: {
      semesters: {
        wise2627: {
          label: "Wintersemester 2026/27",
          shortLabel: "WiSe 2026/27",
          studySemesterLabel: "ترم ۱ تحصیلی",
        },
        sose27: {
          label: "Sommersemester 2027",
          shortLabel: "SoSe 2027",
          studySemesterLabel: "ترم ۲ تحصیلی",
        },
      },
      weekdays: {
        Mo: "دوشنبه",
        Di: "سه‌شنبه",
        Mi: "چهارشنبه",
        Do: "پنج‌شنبه",
        Fr: "جمعه",
      },
      sessionTypes: {
        Vorlesung: "Vorlesung (درس)",
        Übung: "Übung (تمرین)",
        Tutorium: "Tutorium",
        Seminar: "Seminar",
        "Übung / Lab": "Übung / Lab",
      },
      teachingLanguages: {
        Englisch: "انگلیسی (Englisch)",
        Deutsch: "آلمانی (Deutsch)",
        "Deutsch (EN-Literatur)": "آلمانی (منابع انگلیسی)",
      },
      areas: {
        "BWL Pflicht": "الزامی BWL (BWL Pflicht)",
        "Wirtschaftsinformatik Pflicht": "الزامی WI (WI Pflicht)",
        "Weitere Grundlagen (WP)": "مبانی تکمیلی انتخابی (WP)",
        "Informatik (WP)": "علوم کامپیوتر انتخابی (Informatik WP)",
        "Profil DITraM": "گرایش DITraM",
        "Profil UCeDI": "گرایش UCeDI",
        "Profil CIDA": "گرایش CIDA",
        Schlüsselkompetenzen: "مهارت‌های کلیدی (Schlüsselkompetenzen)",
        Projektseminar: "Projektseminar",
        Masterarbeit: "پایان‌نامه (Masterarbeit)",
        Auflagen: "دروس پیش‌نیاز Auflagen",
      },
      areaFilters: {
        Alle: "همه",
        "BWL Pflicht": "BWL Pflicht (12 CP)",
        "Wirtschaftsinformatik Pflicht": "WI Pflicht (12 CP)",
        "Weitere Grundlagen (WP)": "Weitere Grundlagen (WP) (12 CP)",
        "Informatik (WP)": "Informatik (WP) (12 CP)",
        "Profil DITraM": "Profil DITraM (24 CP)",
        "Profil UCeDI": "Profil UCeDI (24 CP)",
        "Profil CIDA": "Profil CIDA (24 CP)",
        Schlüsselkompetenzen: "Schlüsselkompetenzen (6 CP)",
        Projektseminar: "Projektseminar (12 CP)",
        Masterarbeit: "Masterarbeit (30 CP)",
        Auflagen: "Auflagen",
      },
      noTimeRoom: "زمان/مکان نامشخص",
      noRoom: "مکان نامشخص",
      noTime: "ساعت نامشخص",
      noSlotSelected: "هیچ جلسه‌ای در برنامه هفتگی انتخاب نشده",
      introSentence: (title, code, cp, areaLabel) =>
        `ماژول «${title}» (${code}) دارای ${cp} واحد ECTS در بخش «${areaLabel}» است.`,
      goalsSentence: (goals) => `محورهای اصلی این درس عبارت‌اند از: ${goals}.`,
      languageLabel: "زبان تدریس",
      examLabel: "نوع امتحان",
      workloadLabel: "حجم کاری",
      hoursShort: "ساعت",
    },
  },

  fr: {
    documentTitle: {
      base: "Dr. Raccoon · Master DIT, Universität Kassel",
      timetable: "Emploi du temps · Dr. Raccoon (Master DIT, Universität Kassel)",
      exams: "Examens · Dr. Raccoon (Master DIT, Universität Kassel)",
    },
    nav: {
      homeAria: "Dr. Raccoon – Accueil",
      mainNavAria: "Navigation principale",
      timetable: "Emploi du temps",
      exams: "Examens",
      editProfileTitle: "Modifier le profil",
      editProfileAriaPrefix: "Modifier le profil",
    },
    bridge: {
      label: (shortLabel) =>
        `Planification du semestre & choix des cours (${shortLabel})`,
    },
    sections: {
      timetableTitle: (shortLabel) => `Emploi du temps · ${shortLabel}`,
      examsTitle: (shortLabel) => `Examens · ${shortLabel}`,
      currentSemesterBadge: "Semestre actuel",
      nextSemesterBadge: "Semestre suivant",
    },
    footer: {
      aboutHeading: "Conseil d'études IA",
      description:
        "Planification numérique du semestre, sélection des modules et suivi des examens pour le Master Digitale Innovation und Transformation à l'Universität Kassel.",
      moduleContext: "Module : Prompt Engineering · Universität Kassel",
      docsHeading: "Documents officiels (FB 07)",
      docLinks: {
        svp: "Plan d'études / Studienverlaufsplan (WiSe 2026/27)",
        fpo: "Règlement des examens / FPO (PO 2025)",
        makeup: "Cours recommandés pour Auflagen (§ 6 FPO)",
        intro: "Présentation du cursus Master DIT",
      },
      quickLinksHeading: "Accès rapide",
      quickLinks: {
        chat: "Conseil d'études IA",
        timetable: "Emploi du temps & modules",
        exams: "Examens & ECTS",
        editProfile: "Modifier le profil",
        fillProfile: "Compléter le profil d'études",
      },
      bottomLeft:
        "Universität Kassel · Master DIT · Module : Prompt Engineering",
      bottomRight:
        "Aide à la planification non contractuelle – vérifiez les horaires et délais officiels dans eCampus/HISPOS.",
    },
    chat: {
      sectionAria: "Conseiller d'études IA interactif Dr. Raccoon",
      emptyProfileNote:
        "Conseil : complétez votre profil d'études pour que Dr. Raccoon personnalise ses recommandations.",
      fillProfileBtn: "Compléter le profil",
      editProfileTitle: "Modifier le profil d'études enregistré",
      subtitle:
        "Conseil d'études IA · Master DIT · Universität Kassel (FB 07)",
      greetingPrefix: "Salut, je suis",
      greetingQuestion: "Comment planifions-nous ce semestre ?",
      inputSrLabel: "Poser une question à Dr. Raccoon",
      inputPlaceholder: (targetEcts) =>
        `Pose-moi tes questions sur les modules, Auflagen (§ 6 FPO) ou un emploi du temps de ${targetEcts} ECTS sans conflits.`,
      send: "Envoyer",
      startersHeading: "Questions de démarrage",
      refreshStarters: "Actualiser",
      refreshTitle: "Afficher de nouvelles questions",
      docTitle: "Règlement des examens et manuel des modules (FPO & Modulhandbuch)",
      docMeta: "Universität Kassel · Master DIT (FB 07)",
      thinking: "Dr. Raccoon vérifie la FPO et les horaires…",
      proposalQuestion:
        "Souhaitez-vous remplacer votre emploi du temps actuel par cette proposition ?",
      proposalModulesLabel: "Modules",
      proposalAccept: "Oui, mettre à jour",
      proposalDismiss: "Ne pas appliquer",
      proposalAccepted: (codes) =>
        `Votre emploi du temps a été mis à jour avec cette proposition (${codes}).`,
      newChat: "Nouveau chat",
      newChatTitle: "Retour à l'accueil avec les questions de démarrage",
      errorFallback:
        "Le conseiller d'études n'a pas pu traiter votre demande pour le moment.",
      streamError: "Impossible d'établir la connexion en continu.",
      emptyResponseError: "Aucune réponse reçue du conseiller IA.",
      connectionError: "Erreur de connexion au conseiller d'études IA.",
      promptStarters: [
        "Élabore-moi un emploi du temps de 30 CP pour ce semestre.",
        "J'ai un Bachelor en BWL – quels modules et Auflagen me conviennent ?",
        "Je viens de l'informatique (Informatik) – quel plan de 30 CP recommandes-tu ?",
        "Quel profil Master (DITraM, UCeDI, CIDA) me correspond le mieux ?",
        "Quels modules du WiSe 2026/27 sont entièrement enseignés en anglais ?",
        "Comment fonctionnent les Auflagen (§ 6 FPO) et l'inscription aux examens ?",
        "Quels modules ont la charge de travail la plus élevée (« Tricky Modules ») ?",
        "À quoi dois-je faire attention entre CIDA et Informatik-WP ?",
        "Quand puis-je m'inscrire au plus tôt au Projektseminar (12 CP) et au Masterarbeit ?",
        "Comment valider les 6 CP de Schlüsselkompetenzen (KOMPETENZ-K1) ?",
        "Quelles séances Kickoff ont lieu au début du WiSe 2026/27 ?",
        "Puis-je encore changer de profil Master après le premier examen ?",
        "Propose-moi un plan allégé de 24 CP plus 6 CP d'Auflagen.",
        "Quels modules de Weitere Grundlagen (WP) conviennent aux profils BWL ?",
      ],
    },
    profileModal: {
      title: "Mon profil d'études · Master DIT",
      subtitle:
        "Personnalise votre compteur ECTS et les conseils de Dr. Raccoon",
      closeAria: "Fermer la fenêtre du profil d'études",
      fields: {
        language: "6. Langue",
        bachelor: "1. Parcours de Bachelor",
        customBachelor: "Intitulé exact du Bachelor",
        customBachelorPlaceholder: "ex. Droit des affaires, Sociologie, Psychologie",
        masterProfile: "2. Profil Master choisi",
        semester: "3. Semestre d'études actuel",
        partTimeJob: "4. Emploi étudiant / Werkstudent",
        jobStatusAria: "Sélectionner le statut d'emploi étudiant",
        noJob: "Pas d'emploi étudiant",
        partTimeStudent: "Werkstudent / HiWi",
        hoursPerWeek: "Heures par semaine",
        hoursUnit: "h/semaine",
        workload: "5. Charge de travail souhaitée (ECTS)",
      },
      resetBtn: "Réinitialiser le profil",
      cancelBtn: "Annuler",
      saveBtn: "Enregistrer le profil",
    },
    profileOptions: {
      bachelor: {
        wirtschaftsinformatik: {
          label: "Wirtschaftsinformatik (Informatique de gestion)",
          shortLabel: "WI",
        },
        wirtschaftswissenschaften: {
          label: "Wirtschaftswissenschaften (Économie & Gestion)",
          shortLabel: "WiWi",
        },
        informationswissenschaften: {
          label: "Informationswissenschaften (Sciences de l'information)",
          shortLabel: "InfoWiss",
        },
        software_engineering: {
          label: "Software Engineering (Génie logiciel)",
          shortLabel: "SE",
        },
        sonstiges: { label: "Autre", shortLabel: "Autre" },
      },
      masterProfile: {
        undecided: { label: "Pas encore décidé", shortLabel: "Indécis" },
        DITraM: {
          label: "DITraM (Digital Transformation Management)",
          shortLabel: "DITraM",
        },
        UCeDI: {
          label: "UCeDI (User-Centered Digital Innovation)",
          shortLabel: "UCeDI",
        },
        CIDA: {
          label: "CIDA (Computational Intelligence & Data Analytics)",
          shortLabel: "CIDA",
        },
      },
      semester: {
        1: "1er semestre",
        2: "2e semestre",
        3: "3e semestre",
        4: "4e semestre (Masterarbeit)",
      },
      workload: {
        relaxed: {
          label: "Allégé (~24 ECTS)",
          description:
            "Plus de marge pour un emploi étudiant, des Auflagen ou un apprentissage approfondi.",
          chipLabel: "24 ECTS",
        },
        standard: {
          label: "Standard (~30 ECTS)",
          description:
            "Rythme temps plein normal selon le Studienverlaufsplan.",
          chipLabel: "30 ECTS",
        },
        intensive: {
          label: "Intensif (>30 ECTS, ex. avec Auflagen)",
          description:
            "Charge accrue, p. ex. lors du rattrapage d'Auflagen (§ 6 FPO).",
          chipLabel: ">30 ECTS",
        },
      },
      openLabel: "Indécis",
      hoursPerWeekShort: (h) => `${h}h/sem.`,
      bachelorChipPrefix: "Bachelor",
      profileChipPrefix: "Profil",
      partTimeChip: (h) => `Werkstudent : ${h}h/sem.`,
      noJobChip: "Sans emploi étudiant",
      targetChipPrefix: "Objectif",
      otherBachelorPrefix: "Autre",
    },
    timetable: {
      conflictSingular: "Conflit",
      conflictPlural: "Conflits",
      makeupAddOn: (cp) => `(+${cp} ECTS Auflagen)`,
      savePdf: "Enregistrer en PDF",
      savePdfDisabledTitle: "Sélectionnez d'abord au moins un module",
      savePdfTitle: "Télécharger l'emploi du temps en PDF",
      clear: "Vider",
      emptyProfileStatus:
        "Aucun profil d'études enregistré · Objectif par défaut : 30 ECTS",
      adjustProfile: "Modifier le profil",
      emptyGridTitle: (shortLabel) =>
        `Votre emploi du temps pour ${shortLabel} est actuellement vide.`,
      emptyGridSubtitle:
        "Sélectionnez des modules ci-dessous ou ajoutez un module personnalisé.",
      gridTimeCol: "Heure",
      gridTimeUntil: (endHourStr) => `à ${endHourStr}`,
      editSlotTitle: (title, sessionType) =>
        `Modifier ${title} (${sessionType})`,
      removeModuleTitle: (title) => `Retirer ${title}`,
      editDetailsTitle: "Modifier les horaires et détails",
      selectedModulesHeading: (count) =>
        `Modules actuellement sélectionnés (${count}) :`,
      catalogHeading: (shortLabel) => `Catalogue des cours (${shortLabel})`,
      addCustomModule: "Ajouter un module",
      cancel: "Annuler",
      newModuleHeading: (shortLabel) =>
        `Créer un nouveau module pour ${shortLabel}`,
      missingScheduleHint:
        "Les horaires/salles manquants sont marqués « Horaire/Salle manquant(e) »",
      customForm: {
        code: "Code du module",
        codePlaceholder: "ex. WAHL-99",
        title: "Intitulé du module *",
        titlePlaceholder: "ex. Data Science Seminar",
        ects: "ECTS",
        area: "Domaine",
        language: "Langue",
        sessionType: "Type de séance",
        weekdayOptional: "Jour (optionnel)",
        noDayOption: "Non précisé",
        startFree: "Début (libre)",
        endFree: "Fin (libre)",
        roomOptional: "Salle / Lieu (optionnel)",
        roomPlaceholder: "ex. Nora-Platiel-Str. 1 · R 0210",
        examTypeOptional: "Format d'examen (optionnel)",
        examTypePlaceholder: "ex. Klausur (90 min) ou Hausarbeit",
        examDateOptional: "Date & salle d'examen (optionnel)",
        examDatePlaceholder: "ex. 18.02.2027, 10:00 · HS 1",
        saveAndAdd: "Enregistrer & ajouter",
        errMissingTitle: "Veuillez saisir un intitulé de module.",
        errInvalidTime:
          "Veuillez vérifier les heures de début et de fin (la fin doit suivre le début).",
      },
      searchPlaceholder: "Rechercher un module ou code…",
      languageFilterAria: "Filtrer par langue d'enseignement",
      languageFilterOptions: {
        all: "Toutes les langues",
        english: "Anglais (Englisch)",
        german: "Allemand (Deutsch)",
        bridge: "Pont linguistique (DE → EN)",
      },
      noModulesFound: "Aucun module correspondant trouvé.",
      resetFilters: "Réinitialiser les filtres",
      customModuleBadge: "Module personnalisé",
      languageBridgeBadge: "Pont linguistique",
      conflictBadge: "Chevauchement horaire",
      deleteCustomTitle: (title) => `Supprimer ${title}`,
      selectedBtn: "Sélectionné",
      addBtn: "Ajouter",
      moduleAriaLabel: (code, title) =>
        `${code} ${title} – afficher et modifier les détails`,
      detailModal: {
        closeAria: "Fermer les détails",
        introHeading: "Présentation rapide du module",
        prerequisiteLabel: "Remarque / Prérequis :",
        editSectionHeading: "Adapter les séances, horaires et infos",
        addSlotBtn: "Ajouter Übung / Tutorium",
        sessionTypeAria: (idx) => `Type de séance pour le créneau ${idx}`,
        inTimetableLabel: "Dans l'emploi du temps",
        removeSlotTitle: "Supprimer le créneau",
        resetSlotTitle: "Réinitialiser le créneau",
        weekdayLabel: "Jour",
        startLabel: "Début",
        endLabel: "Fin",
        roomLabel: "Salle / Lieu",
        roomPlaceholder: "ex. R 0210",
        slotTip:
          "Astuce : les horaires sont libres. Cochez « Dans l'emploi du temps » pour afficher ou masquer une séance (Übung, Tutorium) dans la grille.",
        examTypeLabel: "Format d'examen",
        examDateLabel: "Date et salle d'examen",
        teachingLangLabel: "Langue d'enseignement",
        notesLabel: "Modifier la description / note",
        resetBtn: "Réinitialiser",
        saveChangesBtn: "Enregistrer",
        errMissingWeekday: (sessionType) =>
          `Veuillez choisir un jour pour « ${sessionType} » ou supprimer le créneau vide.`,
        errInvalidSlotTime: (sessionType, day) =>
          `Veuillez vérifier l'horaire pour « ${sessionType} (${day}) » : l'heure de fin doit suivre le début.`,
      },
    },
    exams: {
      trackerAria: "ECTS-Tracker",
      trackerTitle: "ECTS-Tracker",
      trackerSubtitle: (studySemesterLabel) =>
        `Digital Innovation & Transformation · Universität Kassel (FB 07) · ${studySemesterLabel}`,
      progressAria: "Progression dans le Master DIT en ECTS",
      collected: "Acquis",
      planned: (shortLabel) => `Planifiés (${shortLabel})`,
      remaining: "Restants",
      currentSemesterLead: "Semestre actuel :",
      currentSemesterTextPrefix: "Toutes les données concernent le",
      currentSemesterName: "Semestre d'hiver 2026/27 (WiSe 2026/27)",
      nextSemesterLead: "Semestre suivant :",
      nextSemesterTextPrefix: "Planification pour le",
      nextSemesterName: "Semestre d'été 2027 (SoSe 2027)",
      nextSemesterCarriedOver: (cp) =>
        `(${cp} ECTS repris du WiSe).`,
      lastExamFinished: "Dernier examen terminé",
      confirmLastExam: "Confirmer la fin des examens",
      backToWise: "Retour au WiSe 2026/27",
      selectedExamsHeading: (shortLabel) =>
        `Examens des modules sélectionnés (${shortLabel})`,
      selectedExamsSubheading:
        "Seuls les modules sélectionnés dans votre emploi du temps sont affichés.",
      moduleSingular: "Module",
      modulePlural: "Modules",
      savePdf: "Enregistrer en PDF",
      savePdfDisabledTitle:
        "Sélectionnez d'abord au moins un module dans l'emploi du temps",
      savePdfTitle: "Télécharger les examens en PDF",
      emptyTitle: "Aucun module sélectionné dans l'emploi du temps",
      emptySubtitle:
        "Sélectionnez des modules dans l'onglet « Emploi du temps » pour voir leurs infos d'examen.",
      goToTimetable: "Aller à l'emploi du temps",
      makeupDone: "Réussi",
      makeupOpen: "En attente",
      examTypeLabel: "Format d'examen :",
      examDateRoomLabel: "Date/Salle d'examen :",
      courseScheduleLabel: "Cours :",
      missingDateRoom: "Horaire/Salle manquant(e)",
    },
    catalog: {
      semesters: {
        wise2627: {
          label: "Wintersemester 2026/27",
          shortLabel: "WiSe 2026/27",
          studySemesterLabel: "1er semestre d'études",
        },
        sose27: {
          label: "Sommersemester 2027",
          shortLabel: "SoSe 2027",
          studySemesterLabel: "2e semestre d'études",
        },
      },
      weekdays: {
        Mo: "Lun",
        Di: "Mar",
        Mi: "Mer",
        Do: "Jeu",
        Fr: "Ven",
      },
      sessionTypes: {
        Vorlesung: "Cours (Vorlesung)",
        Übung: "TD (Übung)",
        Tutorium: "Tutorat",
        Seminar: "Séminaire",
        "Übung / Lab": "TP / Lab",
      },
      teachingLanguages: {
        Englisch: "Anglais",
        Deutsch: "Allemand",
        "Deutsch (EN-Literatur)": "Allemand (littérature EN)",
      },
      areas: {
        "BWL Pflicht": "BWL Obligatoire",
        "Wirtschaftsinformatik Pflicht": "WI Obligatoire",
        "Weitere Grundlagen (WP)": "Fondamentaux (WP)",
        "Informatik (WP)": "Informatique (WP)",
        "Profil DITraM": "Profil DITraM",
        "Profil UCeDI": "Profil UCeDI",
        "Profil CIDA": "Profil CIDA",
        Schlüsselkompetenzen: "Schlüsselkompetenzen",
        Projektseminar: "Projektseminar",
        Masterarbeit: "Masterarbeit",
        Auflagen: "Auflagen (§ 6 FPO)",
      },
      areaFilters: {
        Alle: "Tous",
        "BWL Pflicht": "BWL Obligatoire (12 CP)",
        "Wirtschaftsinformatik Pflicht": "WI Obligatoire (12 CP)",
        "Weitere Grundlagen (WP)": "Fondamentaux (WP) (12 CP)",
        "Informatik (WP)": "Informatique (WP) (12 CP)",
        "Profil DITraM": "Profil DITraM (24 CP)",
        "Profil UCeDI": "Profil UCeDI (24 CP)",
        "Profil CIDA": "Profil CIDA (24 CP)",
        Schlüsselkompetenzen: "Schlüsselkompetenzen (6 CP)",
        Projektseminar: "Projektseminar (12 CP)",
        Masterarbeit: "Masterarbeit (30 CP)",
        Auflagen: "Auflagen",
      },
      noTimeRoom: "Horaire/Salle manquant(e)",
      noRoom: "Salle manquante",
      noTime: "Horaire manquant",
      noSlotSelected: "Aucune séance sélectionnée",
      introSentence: (title, code, cp, areaLabel) =>
        `Le module « ${title} » (${code}) vaut ${cp} ECTS dans le domaine « ${areaLabel} ».`,
      goalsSentence: (goals) => `Les thèmes principaux incluent : ${goals}.`,
      languageLabel: "Langue d'enseignement",
      examLabel: "Format d'examen",
      workloadLabel: "Charge",
      hoursShort: "h",
    },
  },

  zh: {
    documentTitle: {
      base: "Dr. Raccoon · Master DIT, Universität Kassel",
      timetable: "课程表 · Dr. Raccoon (Master DIT, Universität Kassel)",
      exams: "考试 · Dr. Raccoon (Master DIT, Universität Kassel)",
    },
    nav: {
      homeAria: "Dr. Raccoon – 首页",
      mainNavAria: "主导航",
      timetable: "课程表",
      exams: "考试",
      editProfileTitle: "编辑个人资料",
      editProfileAriaPrefix: "编辑个人资料",
    },
    bridge: {
      label: (shortLabel) => `学期规划与选课 (${shortLabel})`,
    },
    sections: {
      timetableTitle: (shortLabel) => `课程表 · ${shortLabel}`,
      examsTitle: (shortLabel) => `考试 · ${shortLabel}`,
      currentSemesterBadge: "当前学期",
      nextSemesterBadge: "下学期",
    },
    footer: {
      aboutHeading: "AI 学业顾问",
      description:
        "为 Universität Kassel 的 Digitale Innovation und Transformation (Master DIT) 硕士项目提供数字化学期规划、选课与考试总览。",
      moduleContext: "课程：Prompt Engineering · Universität Kassel",
      docsHeading: "官方文件 (FB 07)",
      docLinks: {
        svp: "推荐修读计划 · Studienverlaufsplan (WiSe 2026/27)",
        fpo: "专业考试条例 · Fachprüfungsordnung (PO 2025)",
        makeup: "补修课程推荐 · Auflagen (§ 6 FPO)",
        intro: "Master DIT 专业介绍",
      },
      quickLinksHeading: "快速入口",
      quickLinks: {
        chat: "AI 学业顾问",
        timetable: "课程表与选课",
        exams: "考试与 ECTS",
        editProfile: "编辑个人资料",
        fillProfile: "填写学习档案",
      },
      bottomLeft: "Universität Kassel · Master DIT · 课程：Prompt Engineering",
      bottomRight:
        "非正式规划辅助工具 – 请以 eCampus/HISPOS 中的官方时间与截止日期为准。",
    },
    chat: {
      sectionAria: "交互式 AI 学业顾问 Dr. Raccoon",
      emptyProfileNote:
        "提示：请填写你的学习档案，以便 Dr. Raccoon 为你提供精准的选课建议。",
      fillProfileBtn: "填写档案",
      editProfileTitle: "编辑已保存的学习档案",
      subtitle: "AI 学业顾问 · Master DIT · Universität Kassel (FB 07)",
      greetingPrefix: "你好，我是",
      greetingQuestion: "这学期我们怎么规划课程？",
      inputSrLabel: "向 Dr. Raccoon 提问",
      inputPlaceholder: (targetEcts) =>
        `可以问我关于模块、补修课 Auflagen (§ 6 FPO) 或无冲突 ${targetEcts}-ECTS 课表的问题。`,
      send: "发送",
      startersHeading: "快速提问",
      refreshStarters: "换一批",
      refreshTitle: "显示新的快速提问",
      docTitle: "考试条例与课程手册 (FPO & Modulhandbuch)",
      docMeta: "Universität Kassel · Master DIT (FB 07)",
      thinking: "Dr. Raccoon 正在核对考试条例与时间安排…",
      proposalQuestion: "是否要用此建议方案替换你当前的课程表？",
      proposalModulesLabel: "推荐模块",
      proposalAccept: "是的，更新课程表",
      proposalDismiss: "暂不采纳",
      proposalAccepted: (codes) =>
        `已根据该建议更新你的课程表 (${codes})。`,
      newChat: "新对话",
      newChatTitle: "返回带快速提问的初始界面",
      errorFallback: "学业顾问暂时无法处理你的请求，请稍后再试。",
      streamError: "无法建立流式连接。",
      emptyResponseError: "未收到 AI 学业顾问的回复。",
      connectionError: "连接 AI 学业顾问时出错。",
      promptStarters: [
        "帮我制定本学期一套 30 CP 的课程表。",
        "我本科是 BWL（企业管理）背景——哪些模块和 Auflagen 适合我？",
        "我来自计算机（Informatik）背景——推荐怎样的 30 CP 方案？",
        "哪个硕士方向（DITraM、UCeDI、CIDA）最适合我？",
        "WiSe 2026/27 学期有哪些模块是全英文授课？",
        "补修课 Auflagen (§ 6 FPO) 及考试报名是如何规定的？",
        "哪些模块的学习任务特别繁重（Tricky Modules）？",
        "选择 CIDA 和 Informatik-WP 时需要注意什么防重规则？",
        "最早什么时候可以报名 Projektseminar (12 CP) 和 Masterarbeit？",
        "如何修满 6 CP 的附加关键能力模块 KOMPETENZ-K1？",
        "WiSe 2026/27 开学有哪些 Kickoff 见面会安排？",
        "参加完第一门专业方向考试后，还能更换硕士方向吗？",
        "帮我搭配一个轻松的 24 CP 方案外加 6 CP Auflagen。",
        "Weitere Grundlagen (WP) 中有哪些模块适合 BWL 背景同学？",
      ],
    },
    profileModal: {
      title: "我的学习档案 · Master DIT",
      subtitle: "用于个性化你的 ECTS 统计与 Dr. Raccoon 的选课建议",
      closeAria: "关闭学习档案窗口",
      fields: {
        language: "6. 语言 (Language)",
        bachelor: "1. 本科背景 (Bachelor)",
        customBachelor: "具体本科专业名称",
        customBachelorPlaceholder: "例如：经济法、社会学、心理学",
        masterProfile: "2. 硕士培养方向 (Master-Profil)",
        semester: "3. 当前修读学期",
        partTimeJob: "4. 兼职 / 实习 (Werkstudent)",
        jobStatusAria: "选择兼职状态",
        noJob: "无兼职",
        partTimeStudent: "Werkstudent / HiWi",
        hoursPerWeek: "每周工时",
        hoursUnit: "小时/周",
        workload: "5. 期望的学期学分负荷 (ECTS)",
      },
      resetBtn: "重置档案",
      cancelBtn: "取消",
      saveBtn: "保存档案",
    },
    profileOptions: {
      bachelor: {
        wirtschaftsinformatik: {
          label: "Wirtschaftsinformatik (经济信息学)",
          shortLabel: "WI",
        },
        wirtschaftswissenschaften: {
          label: "Wirtschaftswissenschaften (经济与管理)",
          shortLabel: "WiWi",
        },
        informationswissenschaften: {
          label: "Informationswissenschaften (信息科学)",
          shortLabel: "InfoWiss",
        },
        software_engineering: {
          label: "Software Engineering (软件工程)",
          shortLabel: "SE",
        },
        sonstiges: { label: "其他专业", shortLabel: "其他" },
      },
      masterProfile: {
        undecided: { label: "尚未决定", shortLabel: "待定" },
        DITraM: {
          label: "DITraM (Digital Transformation Management)",
          shortLabel: "DITraM",
        },
        UCeDI: {
          label: "UCeDI (User-Centered Digital Innovation)",
          shortLabel: "UCeDI",
        },
        CIDA: {
          label: "CIDA (Computational Intelligence & Data Analytics)",
          shortLabel: "CIDA",
        },
      },
      semester: {
        1: "第 1 学期",
        2: "第 2 学期",
        3: "第 3 学期",
        4: "第 4 学期 (Masterarbeit)",
      },
      workload: {
        relaxed: {
          label: "轻松 (~24 ECTS)",
          description: "为兼职工作、Auflagen 补修或深入学习预留更多缓冲。",
          chipLabel: "24 ECTS",
        },
        standard: {
          label: "标准 (~30 ECTS)",
          description: "按照 Studienverlaufsplan 的标准全日制节奏。",
          chipLabel: "30 ECTS",
        },
        intensive: {
          label: "高强度 (>30 ECTS，例如含 Auflagen)",
          description: "更高学习负荷，例如同时补修 Auflagen (§ 6 FPO)。",
          chipLabel: ">30 ECTS",
        },
      },
      openLabel: "待定",
      hoursPerWeekShort: (h) => `${h}h/周`,
      bachelorChipPrefix: "本科",
      profileChipPrefix: "方向",
      partTimeChip: (h) => `兼职: ${h}h/周`,
      noJobChip: "无兼职",
      targetChipPrefix: "目标",
      otherBachelorPrefix: "其他",
    },
    timetable: {
      conflictSingular: "时间冲突",
      conflictPlural: "处时间冲突",
      makeupAddOn: (cp) => `(+${cp} ECTS Auflagen)`,
      savePdf: "导出为 PDF",
      savePdfDisabledTitle: "请先至少选择一个模块",
      savePdfTitle: "下载 PDF 版课程表",
      clear: "清空",
      emptyProfileStatus: "尚未设置学习档案 · 默认目标：30 ECTS",
      adjustProfile: "调整档案",
      emptyGridTitle: (shortLabel) =>
        `你当前的 ${shortLabel} 课程表为空。`,
      emptyGridSubtitle: "请在下方课程目录中选择模块，或添加自定义模块。",
      gridTimeCol: "时间",
      gridTimeUntil: (endHourStr) => `至 ${endHourStr}`,
      editSlotTitle: (title, sessionType) => `编辑 ${title} (${sessionType})`,
      removeModuleTitle: (title) => `移除 ${title}`,
      editDetailsTitle: "编辑时间与详情",
      selectedModulesHeading: (count) => `当前已选模块 (${count})：`,
      catalogHeading: (shortLabel) => `选课 · 模块目录 (${shortLabel})`,
      addCustomModule: "添加自定义模块",
      cancel: "取消",
      newModuleHeading: (shortLabel) => `为 ${shortLabel} 新建模块`,
      missingScheduleHint: "缺失时间/教室的课程将标记为「时间/教室待定」",
      customForm: {
        code: "模块代码",
        codePlaceholder: "例如 WAHL-99",
        title: "模块名称 *",
        titlePlaceholder: "例如 Data Science Seminar",
        ects: "ECTS",
        area: "所属板块",
        language: "授课语言",
        sessionType: "课程类型",
        weekdayOptional: "星期（可选）",
        noDayOption: "未填写",
        startFree: "开始时间（自选）",
        endFree: "结束时间（自选）",
        roomOptional: "教室 / 地点（可选）",
        roomPlaceholder: "例如 Nora-Platiel-Str. 1 · R 0210",
        examTypeOptional: "考核形式（可选）",
        examTypePlaceholder: "例如 Klausur (90 Min.) 或 Hausarbeit",
        examDateOptional: "考试时间与教室（可选）",
        examDatePlaceholder: "例如 18.02.2027, 10:00 · HS 1",
        saveAndAdd: "保存并加入课程表",
        errMissingTitle: "请输入模块名称。",
        errInvalidTime: "请检查开始和结束时间（结束时间必须晚于开始时间）。",
      },
      searchPlaceholder: "搜索模块名称或代码…",
      languageFilterAria: "按授课语言筛选",
      languageFilterOptions: {
        all: "全部语言",
        english: "英语 (Englisch)",
        german: "德语 (Deutsch)",
        bridge: "语言桥 (DE → EN)",
      },
      noModulesFound: "未找到匹配的模块。",
      resetFilters: "重置筛选",
      customModuleBadge: "自定义模块",
      languageBridgeBadge: "语言桥",
      conflictBadge: "时间冲突",
      deleteCustomTitle: (title) => `删除 ${title}`,
      selectedBtn: "已选",
      addBtn: "添加",
      moduleAriaLabel: (code, title) => `${code} ${title} – 查看与编辑详情`,
      detailModal: {
        closeAria: "关闭详情弹窗",
        introHeading: "模块简介",
        prerequisiteLabel: "提示 / 先修要求：",
        editSectionHeading: "自定义时间、课时与信息",
        addSlotBtn: "添加 Übung / Tutorium",
        sessionTypeAria: (idx) => `第 ${idx} 节课程类型`,
        inTimetableLabel: "显示在课表中",
        removeSlotTitle: "删除该时段",
        resetSlotTitle: "重置该时段",
        weekdayLabel: "星期",
        startLabel: "开始",
        endLabel: "结束",
        roomLabel: "教室 / 地点",
        roomPlaceholder: "例如 R 0210",
        slotTip:
          "提示：时间可自由调整。勾选「显示在课表中」即可控制 Übung 或 Tutorium 等时段是否出现在周课表中。",
        examTypeLabel: "考核形式",
        examDateLabel: "考试时间与教室",
        teachingLangLabel: "授课语言",
        notesLabel: "编辑简介 / 备注",
        resetBtn: "恢复默认",
        saveChangesBtn: "保存修改",
        errMissingWeekday: (sessionType) =>
          `请为「${sessionType}」选择星期几，或删除该空时段。`,
        errInvalidSlotTime: (sessionType, day) =>
          `请检查「${sessionType} (${day})」的时间：结束时间必须晚于开始时间。`,
      },
    },
    exams: {
      trackerAria: "ECTS-Tracker",
      trackerTitle: "ECTS-Tracker",
      trackerSubtitle: (studySemesterLabel) =>
        `Digital Innovation & Transformation · Universität Kassel (FB 07) · ${studySemesterLabel}`,
      progressAria: "Master DIT 的 ECTS 学分进度",
      collected: "已获学分",
      planned: (shortLabel) => `本学期规划 (${shortLabel})`,
      remaining: "剩余学分",
      currentSemesterLead: "当前学期：",
      currentSemesterTextPrefix: "当前所有信息适用于",
      currentSemesterName: "2026/27 冬季学期 (WiSe 2026/27)",
      nextSemesterLead: "下学期：",
      nextSemesterTextPrefix: "当前规划学期为",
      nextSemesterName: "2027 夏季学期 (SoSe 2027)",
      nextSemesterCarriedOver: (cp) =>
        `（已结转冬季学期 ${cp} ECTS）。`,
      lastExamFinished: "最后一场考试已结束",
      confirmLastExam: "确认考试全部结束",
      backToWise: "返回 WiSe 2026/27",
      selectedExamsHeading: (shortLabel) =>
        `已选模块考试列表 (${shortLabel})`,
      selectedExamsSubheading: "此处仅显示你在课程表中已选中的模块。",
      moduleSingular: "个模块",
      modulePlural: "个模块",
      savePdf: "导出为 PDF",
      savePdfDisabledTitle: "请先在课程表中至少选择一个模块",
      savePdfTitle: "下载 PDF 版考试安排",
      emptyTitle: "课程表中尚未选择任何模块",
      emptySubtitle: "请先在「课程表」板块中选择模块，以查看对应的考试信息。",
      goToTimetable: "前往课程表",
      makeupDone: "已通过",
      makeupOpen: "待完成",
      examTypeLabel: "考核形式：",
      examDateRoomLabel: "考试时间/教室：",
      courseScheduleLabel: "上课安排：",
      missingDateRoom: "时间/教室待定",
    },
    catalog: {
      semesters: {
        wise2627: {
          label: "Wintersemester 2026/27",
          shortLabel: "WiSe 2026/27",
          studySemesterLabel: "第 1 学期",
        },
        sose27: {
          label: "Sommersemester 2027",
          shortLabel: "SoSe 2027",
          studySemesterLabel: "第 2 学期",
        },
      },
      weekdays: {
        Mo: "周一",
        Di: "周二",
        Mi: "周三",
        Do: "周四",
        Fr: "周五",
      },
      sessionTypes: {
        Vorlesung: "Vorlesung (大课)",
        Übung: "Übung (习题课)",
        Tutorium: "Tutorium (辅导课)",
        Seminar: "Seminar (研讨课)",
        "Übung / Lab": "Übung / Lab (实验)",
      },
      teachingLanguages: {
        Englisch: "英语 (Englisch)",
        Deutsch: "德语 (Deutsch)",
        "Deutsch (EN-Literatur)": "德语 (英文文献)",
      },
      areas: {
        "BWL Pflicht": "BWL 必修",
        "Wirtschaftsinformatik Pflicht": "WI 必修",
        "Weitere Grundlagen (WP)": "其他基础选修 (WP)",
        "Informatik (WP)": "计算机选修 (Informatik WP)",
        "Profil DITraM": "方向 DITraM",
        "Profil UCeDI": "方向 UCeDI",
        "Profil CIDA": "方向 CIDA",
        Schlüsselkompetenzen: "关键能力 (Schlüsselkompetenzen)",
        Projektseminar: "项目研讨 (Projektseminar)",
        Masterarbeit: "硕士论文 (Masterarbeit)",
        Auflagen: "补修要求 Auflagen (§ 6 FPO)",
      },
      areaFilters: {
        Alle: "全部",
        "BWL Pflicht": "BWL 必修 (12 CP)",
        "Wirtschaftsinformatik Pflicht": "WI 必修 (12 CP)",
        "Weitere Grundlagen (WP)": "其他基础 (WP) (12 CP)",
        "Informatik (WP)": "计算机 (WP) (12 CP)",
        "Profil DITraM": "Profil DITraM (24 CP)",
        "Profil UCeDI": "Profil UCeDI (24 CP)",
        "Profil CIDA": "Profil CIDA (24 CP)",
        Schlüsselkompetenzen: "Schlüsselkompetenzen (6 CP)",
        Projektseminar: "Projektseminar (12 CP)",
        Masterarbeit: "Masterarbeit (30 CP)",
        Auflagen: "Auflagen",
      },
      noTimeRoom: "时间/教室待定",
      noRoom: "教室待定",
      noTime: "时间待定",
      noSlotSelected: "未选择课表时段",
      introSentence: (title, code, cp, areaLabel) =>
        `模块「${title}」(${code}) 为 ${cp} ECTS，属于「${areaLabel}」板块。`,
      goalsSentence: (goals) => `核心内容涵盖：${goals}。`,
      languageLabel: "授课语言",
      examLabel: "考核形式",
      workloadLabel: "工作量",
      hoursShort: "小时",
    },
  },
};

export function getTranslations(lang: AppLanguage): AppTranslation {
  return TRANSLATIONS[lang] ?? TRANSLATIONS.de;
}

export function getLocalizedProfileOptions(lang: AppLanguage) {
  const t = getTranslations(lang).profileOptions;
  return {
    bachelorOptions: BACHELOR_BACKGROUND_OPTIONS.map((opt) => ({
      ...opt,
      label: t.bachelor[opt.value].label,
      shortLabel: t.bachelor[opt.value].shortLabel,
    })),
    masterProfileOptions: MASTER_PROFILE_OPTIONS.map((opt) => ({
      ...opt,
      label: t.masterProfile[opt.value].label,
      shortLabel: t.masterProfile[opt.value].shortLabel,
    })),
    semesterOptions: ([1, 2, 3, 4] as CurrentStudySemester[]).map((val) => ({
      value: val,
      label: t.semester[val],
    })),
    workloadOptions: WORKLOAD_PREFERENCE_OPTIONS.map((opt) => ({
      ...opt,
      label: t.workload[opt.value].label,
      description: t.workload[opt.value].description,
      chipLabel: t.workload[opt.value].chipLabel,
    })),
  };
}

export function getLocalizedProfileDisplayParts(
  profile: UserProfile,
  lang: AppLanguage
) {
  const t = getTranslations(lang).profileOptions;
  const { bachelorOptions, masterProfileOptions, semesterOptions, workloadOptions } =
    getLocalizedProfileOptions(lang);

  const baseBachelorOpt =
    bachelorOptions.find((o) => o.value === profile.bachelorBackground) ??
    bachelorOptions[0];
  const customBachelor =
    profile.bachelorBackground === "sonstiges"
      ? profile.customBachelorProgram?.trim() || ""
      : "";
  const bachelorOpt = customBachelor
    ? {
        ...baseBachelorOpt,
        label: `${t.otherBachelorPrefix}: ${customBachelor}`,
        chipLabel: customBachelor,
        shortLabel: customBachelor,
      }
    : {
        ...baseBachelorOpt,
        chipLabel: baseBachelorOpt.label,
      };
  const masterOpt =
    masterProfileOptions.find((o) => o.value === profile.masterProfile) ??
    masterProfileOptions[0];
  const semesterOpt =
    semesterOptions.find((o) => o.value === profile.currentSemester) ??
    semesterOptions[0];
  const workloadOpt =
    workloadOptions.find((o) => o.value === profile.workloadPreference) ??
    workloadOptions[1];

  const jobShort = profile.hasPartTimeJob
    ? t.hoursPerWeekShort(profile.jobHoursPerWeek)
    : t.hoursPerWeekShort(0);

  const buttonSummary = `${bachelorOpt.shortLabel} · ${
    masterOpt.value === "undecided" ? t.openLabel : masterOpt.shortLabel
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

export function getPromptStartersByIndices(
  lang: AppLanguage,
  indices: number[]
): string[] {
  const pool = getTranslations(lang).chat.promptStarters;
  return indices.map((idx) => pool[idx % pool.length]);
}

export function getRandomStarterIndices(count = 3): number[] {
  const total = TRANSLATIONS.de.chat.promptStarters.length;
  const indices = Array.from({ length: total }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, Math.min(count, indices.length));
}

export function translateScheduleLabel(
  label: string,
  lang: AppLanguage
): string {
  if (lang === "de") return label;
  const c = getTranslations(lang).catalog;
  let result = label;

  result = result
    .replace(/Kein Termin im Stundenplan ausgewählt/g, c.noSlotSelected)
    .replace(/Zeit\/Raum fehlt/g, c.noTimeRoom)
    .replace(/Uhrzeit fehlt/g, c.noTime)
    .replace(/Raum fehlt/g, c.noRoom)
    .replace(/\(Vorlesung\)/g, `(${c.sessionTypes.Vorlesung})`)
    .replace(/\(Übung \/ Lab\)/g, `(${c.sessionTypes["Übung / Lab"]})`)
    .replace(/\(Übung\)/g, `(${c.sessionTypes.Übung})`)
    .replace(/\(Tutorium\)/g, `(${c.sessionTypes.Tutorium})`)
    .replace(/\(Seminar\)/g, `(${c.sessionTypes.Seminar})`)
    .replace(/\bMo\b/g, c.weekdays.Mo)
    .replace(/\bDi\b/g, c.weekdays.Di)
    .replace(/\bMi\b/g, c.weekdays.Mi)
    .replace(/\bDo\b/g, c.weekdays.Do)
    .replace(/\bFr\b/g, c.weekdays.Fr);

  if (lang === "en") {
    result = result
      .replace(/Regeltermine:/g, "Regular schedule:")
      .replace(/\bUhr\b/g, "")
      .replace(/\bab\b/g, "from");
  } else if (lang === "fr") {
    result = result
      .replace(/Regeltermine:/g, "Horaires réguliers :")
      .replace(/\bUhr\b/g, "h")
      .replace(/\bab\b/g, "à partir du");
  } else if (lang === "fa") {
    result = result
      .replace(/Regeltermine:/g, "برنامه عادی:")
      .replace(/\bUhr\b/g, "")
      .replace(/\bab\b/g, "از");
  } else if (lang === "zh") {
    result = result
      .replace(/Regeltermine:/g, "常规上课时间：")
      .replace(/\bUhr\b/g, "")
      .replace(/\bab\b/g, "起自");
  }

  return result.replace(/\s{2,}/g, " ").trim();
}

export function formatLocalizedScheduleSummary(
  mod: DitModule,
  lang: AppLanguage
): string {
  const c = getTranslations(lang).catalog;
  const activeSlots = mod.schedule.filter((s) => s.selected !== false);
  if (activeSlots.length > 0) {
    return activeSlots
      .map((s) => {
        const startStr =
          s.startTime ?? `${String(Math.floor(s.startHour)).padStart(2, "0")}:00`;
        const endStr =
          s.endTime ?? `${String(Math.floor(s.endHour)).padStart(2, "0")}:00`;
        const typeLabel =
          activeSlots.length > 1 || s.sessionType !== "Vorlesung"
            ? ` (${c.sessionTypes[s.sessionType] ?? s.sessionType})`
            : "";
        const roomLabel = s.room === "Raum fehlt" ? c.noRoom : s.room;
        return `${c.weekdays[s.day]} ${startStr}–${endStr}${typeLabel} · ${roomLabel}`;
      })
      .join("; ");
  }
  if (mod.schedule.length > 0) {
    return c.noSlotSelected;
  }
  const raw = mod.realScheduleLabel ?? "Zeit/Raum fehlt";
  return translateScheduleLabel(raw, lang);
}

export function getLocalizedModuleIntroduction(
  mod: DitModule,
  lang: AppLanguage
): string {
  if (mod.description && mod.description.trim()) {
    return mod.description.trim();
  }
  const c = getTranslations(lang).catalog;
  if (lang === "de") {
    const goalsText =
      mod.learningGoals.length > 0
        ? c.goalsSentence(mod.learningGoals.join(", "))
        : "";
    return [
      c.introSentence(mod.title, mod.code, mod.cp, c.areas[mod.area]),
      goalsText,
      mod.languageNote,
      mod.workloadComment,
    ]
      .filter(Boolean)
      .join(" ");
  }

  const goalsText =
    mod.learningGoals.length > 0
      ? c.goalsSentence(mod.learningGoals.join(", "))
      : "";
  const langLabel = c.teachingLanguages[mod.language] ?? mod.language;
  return [
    c.introSentence(mod.title, mod.code, mod.cp, c.areas[mod.area]),
    goalsText,
    `${c.languageLabel}: ${langLabel}.`,
    `${c.examLabel}: ${mod.examType}.`,
    `${c.workloadLabel}: ${mod.cp * 30} ${c.hoursShort} (${mod.cp} ECTS).`,
  ]
    .filter(Boolean)
    .join(" ");
}
