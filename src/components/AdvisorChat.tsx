import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CalendarCheck2,
  Check,
  ExternalLink,
  GraduationCap,
  Info,
  RefreshCw,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getRandomPromptStarters,
  type DitModule,
  type SemesterId,
} from "../data/ditCatalog";
import {
  getProfileDisplayParts,
  getTargetEctsForProfile,
  type UserProfile,
} from "../types/userProfile";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

interface AdvisorChatProps {
  activeSemester: SemesterId;
  allModules: DitModule[];
  selectedModuleIds: string[];
  completedMakeupIds: string[];
  customModules?: DitModule[];
  moduleOverrides?: Record<string, Partial<DitModule>>;
  userProfile?: UserProfile | null;
  onOpenProfileModal?: () => void;
  onApplySuggestedModules: (moduleIds: string[]) => void;
}

const MASCOT_IMAGE_URL = "/assets/aistudio/raccoon_4_d26df235.jpeg";

const STUDY_DOCUMENTS = [
  {
    id: "po-mhb",
    title: "Prüfungsordnung und Modulhandbuch",
    meta: "Universität Kassel · Master DIT (FB 07)",
    href: "https://www.uni-kassel.de/uni/studium/digitale-innovation-und-transformation-master/pruefungsordnung-und-modulhandbuch.html",
  },
];

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findFirstModuleInLine(
  line: string,
  pool: DitModule[]
): DitModule | null {
  let bestMatch: { index: number; mod: DitModule } | null = null;
  for (const mod of pool) {
    if (!mod.code) continue;
    const pattern = new RegExp(
      `(^|[^A-Za-z0-9])${escapeRegex(mod.code)}([^A-Za-z0-9]|$)`,
      "i"
    );
    const match = pattern.exec(line);
    if (match && (bestMatch === null || match.index < bestMatch.index)) {
      bestMatch = { index: match.index, mod };
    }
  }
  return bestMatch ? bestMatch.mod : null;
}

function findMentionedModules(text: string, pool: DitModule[]): DitModule[] {
  const found: DitModule[] = [];
  const seen = new Set<string>();
  for (const mod of pool) {
    if (!mod.code || seen.has(mod.id)) continue;
    const pattern = new RegExp(
      `(^|[^A-Za-z0-9])${escapeRegex(mod.code)}([^A-Za-z0-9]|$)`,
      "i"
    );
    if (pattern.test(text)) {
      seen.add(mod.id);
      found.push(mod);
    }
  }
  return found;
}

function extractSuggestedModules(
  content: string,
  semesterModules: DitModule[]
): DitModule[] {
  if (!content.trim()) return [];

  const lower = content.toLowerCase();
  const hasPlanningIntent =
    lower.includes("stundenplan") ||
    lower.includes("semesterplan") ||
    lower.includes("modulplan") ||
    lower.includes("30-cp") ||
    lower.includes("30 cp") ||
    lower.includes("24-cp") ||
    lower.includes("vorschlag") ||
    lower.includes("empfehle") ||
    lower.includes("zusammenstellung");

  if (!hasPlanningIntent) return [];

  const tableLines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && !/^\|[\s:|-]+\|?$/.test(line));

  if (tableLines.length > 0) {
    const fromTable: DitModule[] = [];
    const seen = new Set<string>();
    for (const row of tableLines) {
      const mod = findFirstModuleInLine(row, semesterModules);
      if (mod && !seen.has(mod.id)) {
        seen.add(mod.id);
        fromTable.push(mod);
      }
    }
    if (fromTable.length > 0 && fromTable.length <= 6) {
      return fromTable;
    }
    if (fromTable.length > 6) {
      return [];
    }
  }

  const fromBody = findMentionedModules(content, semesterModules);
  return fromBody.length >= 2 && fromBody.length <= 5 ? fromBody : [];
}

export const AdvisorChat: React.FC<AdvisorChatProps> = ({
  activeSemester,
  allModules,
  selectedModuleIds,
  completedMakeupIds,
  customModules = [],
  moduleOverrides = {},
  userProfile = null,
  onOpenProfileModal,
  onApplySuggestedModules,
}) => {
  const targetEcts = getTargetEctsForProfile(userProfile);
  const profileDisplay = userProfile ? getProfileDisplayParts(userProfile) : null;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [mascotImgFailed, setMascotImgFailed] = useState(false);
  const [promptStarters, setPromptStarters] = useState<string[]>(() =>
    getRandomPromptStarters(3)
  );
  const [proposalDecisions, setProposalDecisions] = useState<
    Record<string, "accepted" | "dismissed">
  >({});
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const semesterModules = useMemo(
    () =>
      allModules.filter(
        (m) =>
          m.semester === activeSemester ||
          m.semester === "alle" ||
          m.area === "Auflagen"
      ),
    [allModules, activeSemester]
  );

  useEffect(() => {
    if (messages.length === 0) return;
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: isStreaming ? "auto" : "smooth",
    });
  }, [messages, isStreaming]);

  const handleRefreshStarters = () => {
    if (isStreaming) return;
    setPromptStarters((prev) => {
      for (let attempt = 0; attempt < 5; attempt++) {
        const next = getRandomPromptStarters(3);
        const hasDifference = next.some((q) => !prev.includes(q));
        if (hasDifference) return next;
      }
      return getRandomPromptStarters(3);
    });
  };

  const handleNewChat = () => {
    if (isStreaming) return;
    setMessages([]);
    setInputValue("");
    setProposalDecisions({});
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  const sendMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const assistantId = `assistant-${Date.now() + 1}`;
    const placeholderAssistant: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
    };

    const conversationHistory = [
      ...messages.filter((m) => !m.isError && m.content.trim().length > 0),
      userMessage,
    ];
    setMessages([...messages, userMessage, placeholderAssistant]);
    setInputValue("");
    setIsStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          selectedModuleIds,
          completedMakeupIds,
          customModules,
          moduleOverrides,
          activeSemester,
          userProfile,
        }),
      });

      if (!response.ok) {
        let errorMsg =
          "Die Studienberatung konnte deine Anfrage leider nicht verarbeiten.";
        try {
          const errorJson = (await response.json()) as { error?: string };
          if (errorJson?.error) errorMsg = errorJson.error;
        } catch {
          // ignore JSON parse failure on non-JSON error
        }
        throw new Error(errorMsg);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Stream-Verbindung konnte nicht aufgebaut werden.");
      }

      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let accumulatedText = "";

      const processEventChunk = (eventChunk: string) => {
        const dataLines = eventChunk
          .split(/\r?\n/)
          .filter((l) => l.startsWith("data:"))
          .map((l) => l.slice(5).trim());
        if (dataLines.length === 0) return;

        const jsonStr = dataLines.join("\n").trim();
        if (!jsonStr) return;

        const parsed = JSON.parse(jsonStr) as {
          text?: string;
          done?: boolean;
          error?: string;
        };

        if (parsed.error) {
          throw new Error(parsed.error);
        }

        if (parsed.text) {
          accumulatedText += parsed.text;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: accumulatedText } : m
            )
          );
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          buffer += decoder.decode();
          if (buffer.trim()) {
            for (const chunk of buffer.split(/\r?\n\r?\n/)) {
              if (chunk.trim()) processEventChunk(chunk);
            }
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() ?? "";

        for (const eventChunk of events) {
          if (eventChunk.trim()) {
            processEventChunk(eventChunk);
          }
        }
      }

      if (!accumulatedText.trim()) {
        throw new Error("Keine Antwort vom KI-Studienberater erhalten.");
      }
    } catch (err: unknown) {
      const errorText =
        err instanceof Error
          ? err.message
          : "Verbindungsfehler zur KI-Studienberatung.";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: errorText, isError: true }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(inputValue);
    }
  };

  const renderComposer = (extraRows = 3) => (
    <form onSubmit={handleSubmit}>
      <div
        className={`flex flex-col rounded-2xl border border-white shadow-lg shadow-teal-950/25 transition-all focus-within:ring-2 focus-within:ring-white/40 ${
          isStreaming ? "bg-slate-50" : "bg-white"
        }`}
      >
        <label htmlFor="advisor-chat-input" className="sr-only">
          Frage an Dr. Raccoon stellen
        </label>
        <textarea
          ref={textareaRef}
          id="advisor-chat-input"
          rows={extraRows}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder={`Frag mich zu Modulen, Auflagen (§ 6 FPO) oder einem konfliktfreien ${targetEcts}-ECTS-Stundenplan.`}
          className="w-full min-h-[88px] resize-none rounded-t-2xl bg-transparent px-4 pt-3 pb-1.5 text-xs leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        <div className="flex items-center justify-end px-3 pb-2.5 pt-1">
          <button
            type="submit"
            disabled={isStreaming || !inputValue.trim()}
            className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Senden</span>
          </button>
        </div>
      </div>
    </form>
  );

  const hasConversation = messages.length > 0;

  return (
    <section
      aria-label="Interaktiver KI-Studienberater Dr. Raccoon"
      className={
        hasConversation
          ? "flex flex-col bg-teal-800/35 rounded-2xl overflow-hidden h-[720px] lg:h-[min(700px,calc(100vh-96px))] min-h-[560px]"
          : "flex flex-col bg-teal-700 min-h-[540px] lg:min-h-[min(620px,calc(100vh-148px))]"
      }
    >
      {!userProfile ? (
        <div
          className={
            hasConversation
              ? "flex items-center justify-between gap-2.5 px-4 sm:px-6 py-2.5 bg-teal-800/75 text-xs text-teal-50 shrink-0"
              : "px-3.5 sm:px-7 pt-2 shrink-0"
          }
        >
          <div
            className={
              hasConversation
                ? "flex items-center justify-between gap-2.5 max-w-4xl mx-auto w-full"
                : "flex items-center justify-between gap-2.5 max-w-xl lg:max-w-2xl mx-auto w-full rounded-xl bg-teal-800/55 px-4 py-2.5 text-xs text-teal-50"
            }
          >
            <div className="flex items-center gap-2 min-w-0">
              <Info className="w-4 h-4 text-[#F8DAC5] shrink-0" />
              <span className="leading-snug">
                Hinweis: Fülle dein Studienprofil aus, damit Dr. Raccoon dich
                passgenau berät.
              </span>
            </div>
            {onOpenProfileModal && (
              <button
                type="button"
                onClick={onOpenProfileModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white text-teal-900 hover:bg-teal-50 font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span>Profil ausfüllen</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        profileDisplay && (
          <div
            className={`flex lg:hidden items-center justify-end shrink-0 ${
              hasConversation
                ? "px-4 py-2 bg-teal-800/55"
                : "px-3.5 sm:px-7 pt-2 pb-0"
            }`}
          >
            <div
              className={
                hasConversation
                  ? "w-full flex justify-end"
                  : "w-full max-w-xl lg:max-w-2xl mx-auto flex justify-end"
              }
            >
              <button
                type="button"
                onClick={onOpenProfileModal}
                title="Gespeichertes Studienprofil bearbeiten"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/25 bg-teal-800/75 hover:bg-teal-800 text-white text-xs font-semibold transition-colors whitespace-nowrap max-w-full"
              >
                <span aria-hidden="true" className="shrink-0">
                  🎓
                </span>
                <span className="truncate tabular-nums">
                  {profileDisplay.buttonSummary}
                </span>
              </button>
            </div>
          </div>
        )
      )}

      {!hasConversation ? (
        /* Gemini-inspired Clean Start Canvas */
        <div className="flex-1 flex flex-col px-3.5 sm:px-7 py-4 sm:py-6 overflow-y-auto">
          <div className="w-full max-w-xl lg:max-w-2xl mx-auto my-auto space-y-4 sm:space-y-5">
            {/* Centered Transparent Mascot Logo + Hero Greeting */}
            <div className="@container text-center">
              <img
                src="/assets/aistudio/raccoon_logo_transparent.png"
                alt="Dr. Raccoon Logo"
                referrerPolicy="no-referrer"
                className="mx-auto h-24 sm:h-28 w-auto object-contain mb-3.5 drop-shadow-[0_3px_8px_rgba(0,0,0,0.2)]"
              />
              <div className="space-y-1">
                <p className="text-[clamp(9px,3.15cqw,12px)] font-medium text-teal-100 whitespace-nowrap">
                  KI-Studienberatung · Master DIT · Universität Kassel (FB 07)
                </p>
                <h2 className="mx-auto font-bold tracking-tight leading-[1.25] text-white text-[clamp(14px,5.3cqw,25px)]">
                  <span className="block whitespace-nowrap">
                    Hi, ich bin{" "}
                    <span className="font-logo font-normal tracking-normal text-[#F8DAC5]">
                      Dr. Raccoon
                    </span>
                    .
                  </span>
                  <span className="block whitespace-nowrap text-teal-100 font-semibold mt-0.5">
                    Wie planen wir dieses Semester?
                  </span>
                </h2>
              </div>
            </div>

            {/* Unified Composer */}
            {renderComposer(3)}

            {/* Prompt Starters Below Composer (with Refresh on Right) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="pl-[15px] text-xs font-medium text-teal-50/90">
                  Schnellstart-Fragen
                </p>
                <button
                  type="button"
                  onClick={handleRefreshStarters}
                  disabled={isStreaming}
                  title="Neue Schnellstart-Fragen anzeigen"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-teal-50 hover:text-white hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Aktualisieren</span>
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                {promptStarters.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    disabled={isStreaming}
                    onClick={() => void sendMessage(starter)}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-white bg-teal-800/55 hover:bg-teal-800/90 border border-white/20 hover:border-white/40 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>

            {/* Official Study Documents Below Prompt Starters */}
            <div className="pt-3 border-t border-white/15">
              <div className="space-y-1.5">
                {STUDY_DOCUMENTS.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-white/20 bg-teal-800/45 hover:bg-teal-800/85 hover:border-white/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">
                        {doc.title}
                      </div>
                      <div className="text-xs text-teal-100/90 truncate">
                        {doc.meta}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-teal-100 group-hover:text-white shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Active Conversation Stream + Bottom Composer */
        <>
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 bg-teal-700"
          >
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              const isFinishedAssistant =
                !isUser &&
                !msg.isError &&
                msg.content.trim().length > 0 &&
                !(isStreaming && index === messages.length - 1);

              const suggestedModules = isFinishedAssistant
                ? extractSuggestedModules(msg.content, semesterModules)
                : [];
              const decision = proposalDecisions[msg.id];
              const suggestedTotalCp = suggestedModules.reduce(
                (sum, m) => sum + m.cp,
                0
              );

              return (
                <div key={msg.id} className="space-y-2">
                  <div
                    className={`flex gap-2.5 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/30 bg-white p-0.5 shrink-0 mt-0.5 flex items-center justify-center">
                        {!mascotImgFailed ? (
                          <img
                            src={MASCOT_IMAGE_URL}
                            alt="Dr. Raccoon"
                            referrerPolicy="no-referrer"
                            onError={() => setMascotImgFailed(true)}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <GraduationCap className="w-4 h-4 text-teal-700" />
                        )}
                      </div>
                    )}

                    <div
                      className={`max-w-[90%] rounded-2xl px-4 py-2.5 ${
                        isUser
                          ? "bg-teal-800/90 border border-white/20 text-white text-sm leading-relaxed"
                          : msg.isError
                          ? "bg-red-50 border border-red-200 text-red-900 text-sm"
                          : "bg-white border border-white/25 text-slate-800 shadow-xs"
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : msg.isError ? (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <p>{msg.content}</p>
                        </div>
                      ) : msg.content ? (
                        <div className="raccoon-markdown">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
                          <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                          <span>
                            Dr. Raccoon prüft Prüfungsordnung &amp; Zeiten…
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {suggestedModules.length > 0 && decision !== "dismissed" && (
                    <div className="pl-9.5 max-w-[92%]">
                      {decision === "accepted" ? (
                        <div className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-medium text-teal-900">
                          <Check className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                          <span>
                            Dein Stundenplan wurde mit diesem Vorschlag
                            aktualisiert (
                            {suggestedModules.map((m) => m.code).join(", ")}).
                          </span>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-white/30 bg-white px-3.5 py-2.5 space-y-2 shadow-xs">
                          <div className="flex items-start gap-2 text-xs text-slate-800">
                            <CalendarCheck2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-teal-950">
                                Soll dein aktueller Stundenplan durch diesen
                                Vorschlag ersetzt werden?
                              </p>
                              <p className="text-[11px] text-slate-600 mt-0.5">
                                Module:{" "}
                                {suggestedModules.map((m) => m.code).join(", ")}{" "}
                                ({suggestedTotalCp} ECTS)
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                onApplySuggestedModules(
                                  suggestedModules.map((m) => m.id)
                                );
                                setProposalDecisions((prev) => ({
                                  ...prev,
                                  [msg.id]: "accepted",
                                }));
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Ja, Stundenplan aktualisieren</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setProposalDecisions((prev) => ({
                                  ...prev,
                                  [msg.id]: "dismissed",
                                }))
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600 transition-colors"
                            >
                              Nicht übernehmen
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          </div>

          <div className="border-t border-white/15 bg-teal-700 px-4 sm:px-6 py-3 shrink-0">
            <div className="max-w-4xl mx-auto space-y-2">
              {renderComposer(2)}
            <div className="flex items-center justify-between gap-2 text-xs text-teal-100 px-1">
              <div className="flex items-center gap-x-2 min-w-0">
                {STUDY_DOCUMENTS.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 min-w-0 hover:text-white hover:underline underline-offset-2 transition-colors"
                  >
                    <span className="truncate">{doc.title}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ))}
              </div>

              <button
                type="button"
                onClick={handleNewChat}
                disabled={isStreaming}
                title="Zurück zur Startansicht mit Schnellstart-Fragen"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-teal-50 hover:text-white hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Neuer Chat</span>
              </button>
            </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};
