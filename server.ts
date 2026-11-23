import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import {
  DIT_MODULES,
  SEMESTER_INFOS,
  detectScheduleConflicts,
  type DitModule,
  type SemesterId,
} from "./src/data/ditCatalog.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function createGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function isRetryableGeminiError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return (
    msg.includes("503") ||
    msg.includes("502") ||
    msg.includes("504") ||
    msg.includes("500") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("DEADLINE_EXCEEDED") ||
    msg.includes("INTERNAL") ||
    msg.includes("ECONNRESET") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("fetch failed")
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface ChatRequestMessage {
  role: "user" | "assistant";
  content: string;
}

function buildSystemInstruction(
  selectedModuleIds: string[],
  completedMakeupIds: string[],
  activeSemester: SemesterId,
  customModules: DitModule[],
  moduleOverrides: Record<string, Partial<DitModule>> = {}
): string {
  const semesterInfo = SEMESTER_INFOS[activeSemester] ?? SEMESTER_INFOS.wise2627;
  const allModules = [...DIT_MODULES, ...customModules].map((m) =>
    moduleOverrides[m.id] ? { ...m, ...moduleOverrides[m.id] } : m
  );
  const semesterModules = allModules.filter(
    (m) =>
      m.semester === activeSemester ||
      m.semester === "alle" ||
      m.area === "Auflagen"
  );
  const selectedModules: DitModule[] = semesterModules.filter((m) =>
    selectedModuleIds.includes(m.id)
  );
  const regularCp = selectedModules
    .filter((m) => m.area !== "Auflagen")
    .reduce((sum, m) => sum + m.cp, 0);
  const makeupCp = selectedModules
    .filter((m) => m.area === "Auflagen")
    .reduce((sum, m) => sum + m.cp, 0);
  const conflicts = detectScheduleConflicts(selectedModules);

  const catalogLines = semesterModules
    .map((m) => {
      const slots =
        m.realScheduleLabel
          ? m.realScheduleLabel
          : m.schedule.length > 0
          ? m.schedule
              .map(
                (s) =>
                  `${s.day} ${String(s.startHour).padStart(2, "0")}:00–${String(s.endHour).padStart(2, "0")}:00 (${s.room})`
              )
              .join(", ")
          : "Zeit/Raum fehlt";
      return `- [${m.code}] "${m.title}" | eCampus-Titel: "${m.ecampusTitle}" | ${m.cp} ECTS | Bereich: ${m.area} | Sprache: ${m.language} | Sprachbrücke nötig: ${m.ecampusLanguageMismatch ? "JA (" + m.languageNote + ")" : "Nein"} | Prüfung: ${m.examType} | Workload: ${m.workload}/5 (${m.workloadComment}) | Zeiten: ${slots} | Voraussetzung: ${m.officialPrerequisite} | Studententipp: ${m.studentTip} | Lernziele: ${m.learningGoals.join(", ")}`;
    })
    .join("\n");

  const currentSelectionText =
    selectedModules.length > 0
      ? selectedModules
          .map((m) => `${m.code} (${m.title}, ${m.cp} CP)`)
          .join(", ")
      : "Noch keine Module ausgewählt.";

  const conflictText =
    conflicts.length > 0
      ? conflicts
          .map(
            (c) =>
              `${c.day} ${c.startHour}:00–${c.startHour + 2}:00: ${c.modules.map((m) => m.code).join(" vs. ")}`
          )
          .join("; ")
      : "Keine Zeitkonflikte";

  return `Du bist „Dr. Raccoon“, ein freundlicher, kluger Waschbär mit Brille und der KI-Studienberater für Erstsemester-Studierende des Masterstudiengangs „Digitale Innovation und Transformation (DIT / Digital Innovation & Transformation)“ an der Universität Kassel (Fachbereich 07 Wirtschaftswissenschaften).

ANTWORTSPRACHE: Antworte IMMER komplett, natürlich und präzise auf Deutsch.

SEMESTER-KONTEXT:
- Das aktuell aktive Semester in der App ist: **${semesterInfo.label}** (${semesterInfo.studySemesterLabel}).
- Alle Informationen, Kickoffs, Vorlesungszeiten und Prüfungen beziehen sich auf das aktuell betrachtete Semester (${semesterInfo.label}). Weise bei Planungen klar darauf hin, dass sich die Angaben auf das aktuelle Semester beziehen.

OFFIZIELLE STUDIENSTRUKTUR GEMÄSS FPO 2024/2025 (120 CREDITS GESAMT · REGELSTUDIENZEIT 4 SEMESTER):
1. **Pflichtbereich (24 CP):**
   - *Betriebswirtschaftslehre (12 CP):* **BWL-P1** Digital Transformation (SoSe, 6 CP) und **BWL-P2** Informationsmanagement (WiSe, 6 CP; Kickoff WiSe 26/27: Mo 19.10.2026, R 0422 Nora-Platiel-Str. 8).
   - *Wirtschaftsinformatik (12 CP):* **WI-P1** Service-Engineering & -Management (WiSe, 6 CP; Kickoff WiSe 26/27: Do 15.10.2026 10–11 Uhr via Zoom) und **WI-P2** Forschungsmethoden in der Wirtschaftsinformatik (SoSe, 6 CP).
2. **Weitere Grundlagen Wahlpflicht (12 CP):** z. B. **WAHL-48** Rechtliche Grundlagen für Wirtschaftsinformatik (WiSe, Mi ab 14.10.26), **WAHL-51** Leadership & Change Management (WiSe), **WAHL-53** Nachhaltige Unternehmensführung (SoSe), **WAHL-58** Applied Research / Analytics for Sustainable Marketing (SoSe).
3. **Informatik Wahlpflicht (12 CP):** z. B. **WAHL-1** PRML I (WiSe, Mo ab 19.10.26), **WAHL-2** PRML II (SoSe), **WAHL-8** Begriffliche Datenanalyse (WiSe, Di ab 20.10.26), **WAHL-16** Parallele Programmierung (WiSe, ab 26.10.26), **WAHL-4** Labor Deep Learning (WiSe), **WAHL_05** Internet Measurements (WiSe), **WAHL-19** Soziale Netzwerkanalyse (SoSe).
4. **Masterprofil (24 CP – genau 1 Profil wählen!):**
   - **DITraM** (*Digital Innovation & Transformation Management*): u. a. **WAHL-29** Business Model Innovation, **WAHL-31** Technologiemanagement/Innovation & Entrepreneurship, **WAHL-34** Digital Business, **WAHL-36** ML in Digital Transformation (WiSe), **WAHL-35** Cases of Digital Transformation, **WAHL-30** Computing & Society, **WAHL-32** Customer Experience Management (SoSe).
   - **UCeDI** (*User-Centered Design and Engineering of Digital Innovations*): u. a. **WAHL-59** Prompt Engineering: Innovation Through Generative AI (WiSe), **WAHL-60** Skalierbare digitale Unternehmen (B2B) gründen (WiSe), **UCeDI-NEU1** Responsible Design and Sustainable Operation of Enterprise Systems (WiSe), **UCeDI-NEU2** Trustworthy Emerging Information Systems (WiSe), **WAHL-46** Seminar Automatisierung (SoSe).
   - **CIDA** (*Computational Intelligence and Data Analytics*): wählbar aus WAHL-1, WAHL-2, WAHL-4, WAHL-8, WAHL-9, WAHL-11, WAHL-12, WAHL-13, WAHL-14, WAHL-19. **WICHTIG:** Module aus CIDA dürfen NICHT gleichzeitig im Bereich Informatik-Wahlpflicht angerechnet werden (kein Doppelzählen!).
   - **Profilwechsel (§ 7 FPO):** Nach der ersten angetretenen Modulprüfung in einem Profil ist das Masterprofil grundsätzlich verbindlich festgelegt (Wechsel nur in Ausnahmefällen über den Prüfungsausschuss).
5. **Projektseminar (12 CP):** **PROJEKTSEMINAR** passend zum gewählten Masterprofil (Voraussetzung: mindestens 30 CP im Master; oft im 3. Semester, kann ggf. aus zwei 6-CP-Seminaren kombiniert werden).
6. **Additive Schlüsselkompetenzen (6 CP):** **KOMPETENZ-K1** (z. B. ISZ-Sprachkurse, ehrenamtliches Engagement, Auslandsstudium, fachfremde B.Sc.-Kurse; Anmeldung i. d. R. über das Prüfungsamt).
7. **Abschlussmodul Masterarbeit (30 CP):** Start ab **84 CP** UND **vollständiger Erfüllung aller Auflagen**. Bearbeitungszeit **24 Wochen** (einmalige Rückgabe des Themas innerhalb der ersten 7 Wochen möglich). Abschluss mit **Masterkolloquium** (25 % der Modulnote).

AUFLAGENFÄCHER GEMÄSS § 6 FPO (MAX. 30 CP INSGESAMT):
- Auflagen aus dem Zulassungsbescheid zählen NICHT zu den 120 Master-CP und gehen NICHT in die Gesamtnote ein, müssen aber **spätestens bis zur Anmeldung der Masterarbeit** bestanden sein.
- Obergrenzen je Bereich: Informatik max. 12 CP (Mindestanforderung im B.Sc. sind 24 CP), Mathe/Statistik/Ökonometrie max. 18 CP, Wirtschaftswissenschaften max. 12 CP, Wirtschaftsinformatik max. 6 CP.
- **Empfohlene B.Sc.-Kurse an der Uni Kassel:**
  - *Informatik:* Einführung in die Informatik (9 CP, WiSe), Programmierung und Modellierung (6 CP, WiSe), Datenbanken (6 CP, WiSe), Algorithmen und Datenstrukturen (6 CP, SoSe), Theoretische Informatik I (6 CP, SoSe), Softwaretechnik (6 CP, SoSe).
  - *Mathe / Statistik:* Mathematik (9 CP, WiSe), Deskriptive und induktive Statistik (6 CP, WiSe), Vertiefung der Mathematik I (9 CP, SoSe), Schließende Statistik / Ökonometrie (6 CP, SoSe).
  - *WiWi:* Grundlagen der Rechnungslegung (6 CP, WiSe), BWL II (6 CP, WiSe), VWL II (6 CP, WiSe), BWL I (6 CP, SoSe), BWL III / Wirtschaftsinformatik & Marketing (6 CP, SoSe), VWL I (6 CP, SoSe).
  - *Wirtschaftsinformatik:* Betriebliche Informationssysteme / Wirtschaftsinformatik (6 CP, WiSe).
- **Wichtige Auflagen-Regel:** Die Prüfungsanmeldung für Auflagenfächer läuft derzeit i. d. R. manuell über das Prüfungsamt (nicht standardmäßig in eCampus) – bei Unklarheiten zu bescheidkonformen Alternativkursen an \`studienkoordination-dit@uni-kassel.de\` wenden.

OFFIZIELLE ANSPRECHPARTNER & RESSOURCEN (FB 07):
- **Studienfachberatung:** Sophia Meywirth (\`fb07-dit@uni-kassel.de\`, Pfannkuchstraße 1, 34121 Kassel)
- **Studentische Studienfachberatung:** Alen Culina (\`fb07-ssb-dit@uni-kassel.de\`, Henschelstr. 2, R 3133, Präsenzsprechstunde Mo 13–14 Uhr)
- **Studiengangsverantwortlicher:** Prof. Dr. Sebastian Lins (\`studienkoordination-dit@uni-kassel.de\`, Untere Königsstraße 71)
- **Prüfungsausschussvorsitzender:** Prof. Dr. André Hanelt
- **Moodle-Kurs Master DIT:** ID 19889 (\`https://moodle.uni-kassel.de/course/view.php?id=19889\`)

MANDATORISCHE ANTWORTSTRUKTUR (DUAL-PERSONA-ANSATZ):
Jede deiner fachlichen Antworten MUSS klar in zwei Perspektiven gegliedert sein, exakt mit diesen beiden Markdown-Überschriften:

### 🎓 Offizielle Studienberatung (FB 07)
- Behandle Prüfungsordnung (PO-2024/2025, 120 ECTS gesamt, 30 CP pro Semester empfohlen), Masterprofile (*DITraM*, *UCeDI*, *CIDA*), formale Voraussetzungen (z. B. 84 CP für Masterarbeit, 30 CP für Projektseminar), Auflagenfächer (§ 6 FPO), Prüfungsformen, Anmeldefristen (eCampus/HISPOS bzw. Prüfungsamt bei Auflagen) und offizielle Ansprechpartner.
- **Sprachbrücke (PFLICHT):** Weise immer explizit und proaktiv darauf hin, wenn ein genanntes Modul im eCampus unter einem deutschen Titel geführt wird, aber auf Englisch unterrichtet/geprüft wird oder gemischte Materialien hat (z. B. **WAHL-59** „Prompt Engineering“ oder **WAHL-31** „Technologiemanagement, Innovation & Entrepreneurship“).

### 🦝 Erfahrener DIT-Student (Insider-Tipps)
- Gib ehrliche, praxisnahe Tipps zu echtem Workload, Gruppenarbeiten, Klausur- vs. Projektlast, „Tricky Modules“ (z. B. **WAHL-1** PRML I, **WAHL-16** Parallele Programmierung, **WAHL-36** ML in Digital Transformation, **WAHL-48** Rechtliche Grundlagen) und zum Campus-Alltag in Kassel (Holländischer Platz, Nora-Platiel-Str. 8, Wilhelmshöher Allee, Science Park Kassel).

CHAIN-OF-THOUGHT BEI STUNDENPLAN- & MODULKOMBI-ANFRAGEN:
Wenn der Studierende nach einem Stundenplan, einer Modulauswahl oder „30 CP“ fragt, führe die Logik explizit Schritt für Schritt aus:
1. **Standardumfang = genau 5 Module (30 CP):** Ein regulärer Semester-Stundenplan besteht IMMER aus genau **5 konkreten Modulen** (5 × 6 CP = 30 CP), sofern der Studierende nicht ausdrücklich weniger Module, mehr Module oder zusätzliche Auflagenfächer verlangt. Schlage NIEMALS 6–11 Module gleichzeitig als Stundenplan vor! Alternative Wahlmodule nennst du ggf. kurz im Text unter den Tipps, NICHT in der finalen Stundenplan-Tabelle.
2. **Zeitkonflikt-Prüfung:** Prüfe alle Wochentage und Zeitslots (Mo–Fr) konsequent auf Überschneidungen.
3. **CP-Summierung & Profil-Check:** Addiere die Credit Points der 5 gewählten Module explizit (z. B. 5 × 6 CP = 30 CP). Trenne reguläre Master-CP von Auflagenfach-CP und achte bei CIDA auf das Doppelanrechnungsverbot mit Informatik-WP.
4. **Sprach-Check & Sprachbrücke:** Liste die Unterrichtssprachen und warne vor deutschen eCampus-Titeln bei englischsprachigen Kursen.
5. **Strukturierte Markdown-Tabelle (nur bei konkreten Stundenplan-Vorschlägen!):** Gib den finalen 5-Module-Plan als saubere Markdown-Tabelle mit genau diesen Spalten aus:
| Code | Modul (eCampus-Hinweis) | CP | Zeiten | Sprache | Prüfungsform |
WICHTIG: Bei reinen Überblicks- oder Vergleichsfragen ohne konkreten Stundenplanwunsch (z. B. „Welche Module sind auf Englisch?“ oder „Was sind Tricky Modules?“), verwende Aufzählungen statt einer Stundenplan-Tabelle.

AKTUELLER DASHBOARD-KONTEXT DES STUDIERENDEN (${semesterInfo.shortLabel}):
- Aktuell im Stundenplan gewählt: ${currentSelectionText}
- Reguläre Master-CP im Plan: ${regularCp} CP (Semesterziel: 30 CP, Gesamtstudium: 120 CP)
- Auflagenfach-CP im Plan: ${makeupCp} CP (Bereits erledigte Auflagen: ${completedMakeupIds.length > 0 ? completedMakeupIds.join(", ") : "keine markiert"})
- Aktuelle Zeitkonflikte im Dashboard: ${conflictText}

OFFIZIELLER MODULKATALOG (MASTER DIT · UNI KASSEL FB 07 · ${semesterInfo.shortLabel}):
${catalogLines}

Halte deine Antworten gut lesbar, strukturiert, herzlich (mit einem dezenten akademischen Waschbär-Charme ohne Albernheit) und bleibe faktisch strikt beim bereitgestellten DIT-Modulkatalog und den Regeln der Universität Kassel.
WICHTIG ZU ZEITEN & RÄUMEN: Nenne konkrete Uhrzeiten, Räume oder Prüfungstermine NUR dort, wo sie ausdrücklich im Modulkatalog angegeben sind (oder vom Studierenden als eigenes Modul angelegt wurden). Wenn im Katalog „Zeit/Raum fehlt“ oder „Uhrzeit fehlt“ steht, erfinde NIEMALS Uhrzeiten, Hörsäle oder Klausurtermine, sondern sage klar „Zeit/Raum fehlt (bitte in eCampus prüfen)“.`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  let hydrogenQuotaCooldownUntil = 0;

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "dr-raccoon-dit-advisor" });
  });

  app.post("/api/chat", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      res.status(500).json({
        error:
          "Kein gültiger GEMINI_API_KEY auf dem Server hinterlegt. Bitte prüfe die Einstellungen unter Settings > Secrets.",
      });
      return;
    }

    const body = req.body as {
      messages?: ChatRequestMessage[];
      selectedModuleIds?: string[];
      completedMakeupIds?: string[];
      customModules?: DitModule[];
      moduleOverrides?: Record<string, Partial<DitModule>>;
      activeSemester?: SemesterId;
    };

    const messages = Array.isArray(body?.messages) ? body.messages : [];
    if (messages.length === 0) {
      res.status(400).json({ error: "Bitte gib eine Frage für Dr. Raccoon ein." });
      return;
    }

    const selectedModuleIds = Array.isArray(body?.selectedModuleIds)
      ? body.selectedModuleIds
      : [];
    const completedMakeupIds = Array.isArray(body?.completedMakeupIds)
      ? body.completedMakeupIds
      : [];
    const customModules = Array.isArray(body?.customModules)
      ? body.customModules.filter(
          (m): m is DitModule =>
            Boolean(m) &&
            typeof m === "object" &&
            typeof m.id === "string" &&
            typeof m.title === "string"
        )
      : [];
    const moduleOverrides =
      body?.moduleOverrides && typeof body.moduleOverrides === "object"
        ? body.moduleOverrides
        : {};
    const activeSemester: SemesterId =
      body?.activeSemester === "sose27" ? "sose27" : "wise2627";

    const systemInstruction = buildSystemInstruction(
      selectedModuleIds,
      completedMakeupIds,
      activeSemester,
      customModules,
      moduleOverrides
    );

    const rawMessages = messages
      .filter(
        (msg) =>
          msg &&
          typeof msg.content === "string" &&
          msg.content.trim().length > 0 &&
          (msg.role === "user" || msg.role === "assistant")
      )
      .map((msg) => ({
        role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: msg.content.trim() }],
      }));

    // Ensure conversation turns passed to Gemini start with a user turn
    const firstUserIdx = rawMessages.findIndex((m) => m.role === "user");
    const contents =
      firstUserIdx >= 0 ? rawMessages.slice(firstUserIdx) : [];

    if (contents.length === 0) {
      res.status(400).json({ error: "Bitte gib eine Frage für Dr. Raccoon ein." });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();
    res.write(": connected\n\n");

    const keepaliveTimer = setInterval(() => {
      if (!res.writableEnded) {
        res.write(": keepalive\n\n");
      }
    }, 8000);

    let sawQuotaError = Date.now() < hydrogenQuotaCooldownUntil;

    try {
      const ai = createGeminiClient(apiKey);
      let streamedAnyText = false;
      const modelsToTry: readonly ("gemini-4-hydrogen" | "gemini-3.1-flash-lite")[] =
        sawQuotaError
          ? ["gemini-3.1-flash-lite"]
          : ["gemini-4-hydrogen", "gemini-3.1-flash-lite"];
      let lastError: unknown = null;

      for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
        const modelName = modelsToTry[mIdx];
        const hasFallbackModel = mIdx < modelsToTry.length - 1;
        const maxAttempts = hasFallbackModel ? 2 : 4;
        let shouldTryNextModel = false;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            const config =
              modelName === "gemini-3.1-flash-lite"
                ? { systemInstruction }
                : {
                    systemInstruction,
                    thinkingConfig: {
                      thinkingLevel: ThinkingLevel.LOW,
                    },
                  };

            const stream = await ai.models.generateContentStream({
              model: modelName,
              contents,
              config,
            });

            for await (const chunk of stream) {
              const text = chunk.text;
              if (text) {
                streamedAnyText = true;
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
              }
            }
            lastError = null;
            break;
          } catch (attemptErr) {
            lastError = attemptErr;
            const errStatus =
              typeof (attemptErr as { status?: unknown })?.status === "number"
                ? (attemptErr as { status: number }).status
                : undefined;
            const errMsg =
              attemptErr instanceof Error
                ? attemptErr.message
                : String(attemptErr ?? "");

            const isQuotaError =
              errStatus === 429 ||
              errMsg.includes("RESOURCE_EXHAUSTED") ||
              errMsg.includes("429");

            if (isQuotaError) {
              sawQuotaError = true;
              if (
                modelName === "gemini-4-hydrogen" &&
                (errMsg.includes("PerDay") || errMsg.includes("free_tier"))
              ) {
                hydrogenQuotaCooldownUntil = Date.now() + 5 * 60 * 1000;
              }
            }

            if (!streamedAnyText && isQuotaError && hasFallbackModel) {
              console.warn(
                `Gemini-Kontingent für ${modelName} erschöpft, wechsle auf Fallback-Modell ${modelsToTry[mIdx + 1]}.`
              );
              shouldTryNextModel = true;
              break;
            }

            if (
              !streamedAnyText &&
              (isRetryableGeminiError(attemptErr) ||
                errStatus === 503 ||
                errStatus === 500 ||
                errStatus === 502 ||
                errStatus === 504)
            ) {
              if (attempt < maxAttempts) {
                await sleep(600 * attempt);
                continue;
              }
              if (hasFallbackModel) {
                shouldTryNextModel = true;
                break;
              }
            }
            throw attemptErr;
          }
        }

        if (!shouldTryNextModel) {
          break;
        }
      }

      if (lastError) {
        throw lastError;
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err: unknown) {
      const errStatus =
        typeof (err as { status?: unknown })?.status === "number"
          ? (err as { status: number }).status
          : undefined;
      const rawMessage =
        err instanceof Error ? err.message : "Unbekannter Serverfehler";
      const isQuotaError =
        errStatus === 429 ||
        rawMessage.includes("RESOURCE_EXHAUSTED") ||
        rawMessage.includes("429");
      const isUnavailableError =
        errStatus === 503 ||
        rawMessage.includes("503") ||
        rawMessage.includes("UNAVAILABLE");

      if (isQuotaError || isUnavailableError) {
        console.warn(
          `Gemini API transient/quota notice (status=${errStatus ?? "unknown"}):`,
          rawMessage.slice(0, 240)
        );
      } else {
        console.error("Gemini API error:", rawMessage);
      }

      let userMessage =
        "Die KI-Studienberatung konnte gerade nicht erreicht werden. Bitte versuche es in einem Moment erneut.";
      if (
        errStatus === 400 ||
        errStatus === 401 ||
        errStatus === 403 ||
        rawMessage.includes("API_KEY_INVALID") ||
        rawMessage.includes("PERMISSION_DENIED") ||
        rawMessage.includes("403") ||
        rawMessage.includes("400")
      ) {
        userMessage =
          "Der hinterlegte Gemini API-Schlüssel wurde abgelehnt. Bitte überprüfe ihn im Bereich Settings > Secrets.";
      } else if (isQuotaError) {
        userMessage =
          rawMessage.includes("PerDay") || rawMessage.includes("free_tier")
            ? "Das kostenlose Tageskontingent (Free Tier) der Gemini API wurde erreicht. Du kannst im Bereich Settings > Secrets einen API-Schlüssel mit aktivierter Abrechnung auswählen, um dein Kontingent zu erhöhen, oder es später erneut versuchen."
            : "Das aktuelle Anfrage-Kontingent wurde vorübergehend erreicht. Bitte warte kurz und sende die Frage erneut.";
      } else if (isUnavailableError && sawQuotaError) {
        userMessage =
          "Das kostenlose Tageskontingent für das Hauptmodell wurde erreicht und das Ausweichmodell ist aktuell stark ausgelastet. Bitte versuche es in wenigen Sekunden erneut oder wähle unter Settings > Secrets einen API-Schlüssel mit aktivierter Abrechnung aus.";
      } else if (isUnavailableError) {
        userMessage =
          "Die KI-Server sind aktuell vorübergehend stark ausgelastet. Bitte warte einen kurzen Moment und sende deine Frage erneut.";
      } else if (
        errStatus === 404 ||
        rawMessage.includes("NOT_FOUND") ||
        rawMessage.includes("404")
      ) {
        userMessage =
          "Das konfigurierte KI-Modell wurde nicht gefunden. Bitte prüfe die Serverkonfiguration.";
      }

      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ error: userMessage })}\n\n`);
        res.end();
      }
    } finally {
      clearInterval(keepaliveTimer);
    }
  });

  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("/{*path}", (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        next();
        return;
      }
      const indexHtml = path.join(distDir, "index.html");
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send("Build nicht gefunden.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dr. Raccoon Server läuft auf http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fehler beim Starten des Servers:", err);
  process.exit(1);
});
