"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ChatPanel from "@/components/ChatPanel";
import EvidencePanel from "@/components/EvidencePanel";
import DashboardView from "@/components/DashboardView";
import FeaturePlaceholder from "@/components/FeaturePlaceholder";
import { checkOrchestratorHealth, streamAssistantResponse } from "@/lib/api";
import type {
  Citation,
  ConnectionState,
  Evidence,
  EvidenceState,
  Message,
  PersonaMode,
} from "@/lib/types";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [mode, setMode] = useState<PersonaMode>("consumer");
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [fontScale, setFontScale] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const [evidenceState, setEvidenceState] = useState<EvidenceState>("empty");
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [activeCitationIndex, setActiveCitationIndex] = useState<number | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // Root font scaling drives every rem-based Tailwind size in the app.
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale * 100}%`;
  }, [fontScale]);

  const refreshConnection = useCallback(async () => {
    setConnectionState((prev) => (prev === "offline" ? "connecting" : prev));
    const healthy = await checkOrchestratorHealth();
    setConnectionState(healthy ? "connected" : "offline");
  }, []);

  useEffect(() => {
    refreshConnection();
    const interval = setInterval(refreshConnection, 20000);
    return () => clearInterval(interval);
  }, [refreshConnection]);

  const handleQuerySubmit = useCallback(
    (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed || isStreaming) return;

      // Abort previous in-flight request if any
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }

      // 1. Instant State Reset: Purge stale cards and prior streaming response immediately
      setEvidenceList([]);
      setEvidenceState("loading");
      setActiveCitationIndex(null);
      setInputValue("");

      const userMessage: Message = {
        id: createId(),
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
      };
      const assistantId = createId();
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages((prev) => [
        ...prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)),
        userMessage,
        assistantMessage,
      ]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      let latestCitations: Citation[] = [];

      streamAssistantResponse(
        trimmed,
        mode,
        {
          onToken: (delta) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + delta } : m
              )
            );
          },
          onCitations: (citations) => {
            latestCitations = citations;
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, citations } : m))
            );
          },
          onEvidence: (sources) => {
            // Update UI with fresh isolated evidence
            setEvidenceList(sources);
            setEvidenceState(sources.length > 0 ? "success" : "empty");
          },
          onError: () => {
            setConnectionState("offline");
            setEvidenceState((prev) => (prev === "loading" ? "error" : prev));
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      isStreaming: false,
                      content:
                        m.content ||
                        "I couldn't reach the BIS orchestrator. Please check that the backend is running and try again.",
                    }
                  : m
              )
            );
            setIsStreaming(false);
          },
          onDone: () => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, isStreaming: false, citations: latestCitations }
                  : m
              )
            );
            setEvidenceState((prev) => (prev === "loading" ? "empty" : prev));
            setIsStreaming(false);
          },
        },
        controller.signal
      );
    },
    [mode, isStreaming]
  );

  function handleSend(customPrompt?: string) {
    const text = typeof customPrompt === "string" ? customPrompt : inputValue;
    setInputValue("");
    handleQuerySubmit(text);
  }

  function handleQuickPrompt(prompt: string) {
    // Purge any dirty or partially-typed input field state and submit exact literal string directly
    setInputValue("");
    handleQuerySubmit(prompt);
  }

  function handleCitationClick(index: number) {
    setActiveCitationIndex(index);
  }

  function handleRetryEvidence() {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) handleQuerySubmit(lastUser.content);
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header
        mode={mode}
        onModeChange={setMode}
        connectionState={connectionState}
        onRetryConnection={refreshConnection}
        language={language}
        onLanguageChange={setLanguage}
        fontScale={fontScale}
        onFontScaleChange={setFontScale}
        onOpenSidebar={() => setSidebarOpen(true)}
      />

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 gap-4 px-3 py-4 sm:px-4 lg:gap-5 lg:px-6">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

        <main
          id="main-content"
          className="flex min-w-0 flex-1 flex-col gap-4 lg:h-[calc(100vh-97px)]"
        >
          {activeTab === "Dashboard" ? (
            <DashboardView onNavigateToAssistant={() => setActiveTab("AI Assistant")} />
          ) : activeTab === "AI Assistant" ? (
            <div className="flex h-full min-w-0 flex-1 flex-col gap-4 lg:flex-row">
              <div className="min-h-[420px] flex-1 lg:h-full lg:min-h-0 lg:basis-[60%]">
                <ChatPanel
                  messages={messages}
                  inputValue={inputValue}
                  onInputChange={setInputValue}
                  onSend={handleSend}
                  onQuickPrompt={handleQuickPrompt}
                  isStreaming={isStreaming}
                  mode={mode}
                  onCitationClick={handleCitationClick}
                />
              </div>

              <div className="min-h-[360px] flex-1 lg:h-full lg:min-h-0 lg:basis-[40%]">
                <EvidencePanel
                  state={evidenceState}
                  sources={evidenceList}
                  evidence={evidenceList}
                  activeIndex={activeCitationIndex}
                  onRetry={handleRetryEvidence}
                />
              </div>
            </div>
          ) : (
            <FeaturePlaceholder
              tabName={activeTab}
              onNavigateToAssistant={() => setActiveTab("AI Assistant")}
            />
          )}
        </main>
      </div>
    </div>
  );
}
