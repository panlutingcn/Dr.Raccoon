import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CalendarCheck2,
  Check,
  GraduationCap,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getRandomPromptStarters,
  type DitModule,
  type SemesterId,
} from "../data/ditCatalog";

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
  onApplySuggestedModules: (moduleIds: string[]) => void;
}

const MASCOT_IMAGE_URL = "/assets/aistudio/raccoon_4_d26df235.jpeg";

const INITIAL_ASSISTANT_MESSAGE: ChatMessage = {
  id: "welcome-msg",
  role: "assistant",
  content: `Hallo! Ich bin **Dr. Raccoon**, dein KI-Studienberater für den **Master DIT** an der Universität Kassel.

Alle Module, Zeiten und Prüfungen beziehen sich auf das **aktuelle Semester (WiSe 2026/27)**. Frag mich gern zu Studienaufbau (PO-2024/2025), Modulen, Auflagen oder deiner Semesterplanung!`,
};

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
  onApplySuggestedModules,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    INITIAL_ASSISTANT_MESSAGE,
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [mascotImgFailed, setMascotImgFailed] = useState(false);
  const [proposalDecisions, setProposalDecisions] = useState<
    Record<string, "accepted" | "dismissed">
  >({});
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const promptStarters = useMemo(() => getRandomPromptStarters(3), []);

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
    if (messages.length <= 1) return;
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: isStreaming ? "auto" : "smooth",
    });
  }, [messages, isStreaming]);

  const handleResetChat = () => {
    if (isStreaming) return;
    setMessages([INITIAL_ASSISTANT_MESSAGE]);
    setProposalDecisions({});
    setInputValue("");
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
      ...messages.filter(
        (m) => !m.isError && m.id !== "welcome-msg" && m.content.trim().length > 0
      ),
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

  return (
    <section
      aria-label="Interaktiver KI-Studienberater Dr. Raccoon"
      className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden h-[760px] lg:h-[calc(100vh-104px)] min-h-[620px]"
    >
      {/* Advisor Identity Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-teal-800 bg-teal-700 text-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white p-0.5 border border-white/25 shrink-0 flex items-center justify-center">
            {!mascotImgFailed ? (
              <img
                src={MASCOT_IMAGE_URL}
                alt="Dr. Raccoon Logo"
                referrerPolicy="no-referrer"
                onError={() => setMascotImgFailed(true)}
                className="w-full h-full object-contain"
              />
            ) : (
              <GraduationCap className="w-5 h-5 text-teal-700" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
              Dr. Raccoon · KI-Studienberatung
            </h2>
            <p className="text-xs text-white/85 truncate">
              Master DIT · Universität Kassel (FB 07)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetChat}
          disabled={isStreaming}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-white/15 hover:bg-white/25 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          title="Gespräch zurücksetzen"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Neuer Chat</span>
        </button>
      </div>

      {/* Scrollable Chat Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/60"
      >
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          const isFinishedAssistant =
            !isUser &&
            !msg.isError &&
            msg.id !== "welcome-msg" &&
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
                className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg overflow-hidden border border-teal-700/25 bg-white p-0.5 shrink-0 mt-0.5 flex items-center justify-center">
                    {!mascotImgFailed ? (
                      <img
                        src={MASCOT_IMAGE_URL}
                        alt="Dr. Raccoon Logo"
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
                  className={`max-w-[88%] rounded-xl px-3.5 py-2.5 ${
                    isUser
                      ? "bg-teal-700 text-white text-sm leading-relaxed"
                      : msg.isError
                      ? "bg-red-50 border border-red-200 text-red-900 text-sm"
                      : "bg-white border border-slate-200 text-slate-800"
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
                      <span>Dr. Raccoon prüft Prüfungsordnung &amp; Zeiten…</span>
                    </div>
                  )}
                </div>
              </div>

              {suggestedModules.length > 0 && decision !== "dismissed" && (
                <div className="pl-9.5 max-w-[92%]">
                  {decision === "accepted" ? (
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-medium text-teal-900">
                      <Check className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span>
                        Dein Stundenplan wurde mit diesem Vorschlag aktualisiert (
                        {suggestedModules.map((m) => m.code).join(", ")}).
                      </span>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-teal-700/25 bg-teal-50/70 px-3.5 py-2.5 space-y-2">
                      <div className="flex items-start gap-2 text-xs text-slate-800">
                        <CalendarCheck2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-teal-950">
                            Soll dein aktueller Stundenplan durch diesen Vorschlag ersetzt werden?
                          </p>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            Module: {suggestedModules.map((m) => m.code).join(", ")} ({suggestedTotalCp} ECTS)
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

      {/* Prompt Starters + Input Composer */}
      <div className="border-t border-slate-200 bg-white px-4 py-3 shrink-0 space-y-2.5">
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-slate-500">
            Schnellstart-Fragen
          </p>
          <div className="flex flex-col gap-1">
            {promptStarters.map((starter) => (
              <button
                key={starter}
                type="button"
                disabled={isStreaming}
                onClick={() => void sendMessage(starter)}
                className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 hover:border-teal-600/50 rounded-lg transition-colors disabled:opacity-50"
              >
                {starter}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className={`flex flex-col rounded-lg border border-slate-300 transition-colors focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-700/15 ${
              isStreaming ? "bg-slate-50" : "bg-white"
            }`}
          >
            <label htmlFor="advisor-chat-input" className="sr-only">
              Frage an Dr. Raccoon stellen
            </label>
            <textarea
              ref={textareaRef}
              id="advisor-chat-input"
              rows={3}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder="Frag Dr. Raccoon zu Modulen, Auflagen oder Terminen…"
              className="w-full min-h-[84px] resize-none rounded-t-lg bg-transparent px-3 pt-2.5 pb-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <div className="flex items-center justify-end px-2.5 pb-2 pt-1">
              <button
                type="submit"
                disabled={isStreaming || !inputValue.trim()}
                className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0 disabled:opacity-45 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Senden</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};
