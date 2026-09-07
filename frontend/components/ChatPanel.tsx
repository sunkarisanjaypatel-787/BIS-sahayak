"use client";

import { useEffect, useRef } from "react";
import { ShieldCheck, BadgeCheck } from "lucide-react";
import type { Message, PersonaMode } from "@/lib/types";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import QuickPrompts from "./QuickPrompts";

interface ChatPanelProps {
  messages: Message[];
  inputValue: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onQuickPrompt: (prompt: string) => void;
  isStreaming: boolean;
  mode: PersonaMode;
  onCitationClick: (index: number) => void;
}

export default function ChatPanel({
  messages,
  inputValue,
  onInputChange,
  onSend,
  onQuickPrompt,
  isStreaming,
  mode,
  onCitationClick,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const modeLabel = mode === "consumer" ? "Consumer guidance" : "Industry / MSME technical mode";

  return (
    <section
      className="flex h-full min-h-0 flex-col rounded-xl border border-slate-200 bg-white shadow-card"
      aria-label="AI Assistant conversation"
    >
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-bis-darkblue">AI Assistant</h2>
          <p className="text-xs text-slate-500">
            Ask about Indian Standards, compliance requirements and BIS services.
          </p>
        </div>
        <span className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-full bg-teal/10 px-2.5 py-1 text-[11px] font-semibold text-teal">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Verified BIS Knowledge
        </span>
      </header>

      <div className="border-b border-slate-100 px-4 py-1.5 text-[11px] font-medium text-slate-400">
        Mode: <span className="text-bis-blue">{modeLabel}</span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-4"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bis-blue/10 text-bis-blue">
              <ShieldCheck className="h-7 w-7" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-bis-darkblue">
                How can I help you today?
              </h3>
              <p className="max-w-sm text-sm text-slate-500">
                Ask about standards, testing, certification or compliance.
              </p>
            </div>
            <QuickPrompts onSelect={onQuickPrompt} />
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} onCitationClick={onCitationClick} />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 p-3 space-y-2.5">
        {messages.length > 0 && <QuickPrompts onSelect={onQuickPrompt} />}
        <ChatInput
          value={inputValue}
          onChange={onInputChange}
          onSubmit={onSend}
          disabled={isStreaming}
        />
      </div>
    </section>
  );
}
