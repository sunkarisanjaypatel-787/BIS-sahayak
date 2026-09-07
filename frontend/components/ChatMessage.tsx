"use client";

import { ShieldCheck, BadgeCheck } from "lucide-react";
import type { Message } from "@/lib/types";
import { renderMarkdown } from "@/lib/markdown";
import CitationBadge from "./CitationBadge";

interface ChatMessageProps {
  message: Message;
  onCitationClick: (index: number) => void;
}

export default function ChatMessage({ message, onCitationClick }: ChatMessageProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-bis-blue px-4 py-2.5 text-white shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 animate-fade-in">
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bis-darkblue text-white"
        aria-hidden="true"
      >
        <ShieldCheck className="h-4 w-4" />
      </div>

      <div className="max-w-[90%] sm:max-w-[80%] space-y-2">
        <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 shadow-card">
          {message.content ? (
            <div className="assistant-prose text-sm leading-relaxed text-slate-800">
              {renderMarkdown(message.content, onCitationClick)}
            </div>
          ) : (
            <p className="text-sm italic text-slate-400">Generating verified response…</p>
          )}
          {message.isStreaming && message.content && (
            <span
              className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-bis-blue animate-blink"
              aria-hidden="true"
            />
          )}
        </div>

        {!message.isStreaming && message.content && (
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1 rounded bg-teal/10 px-1.5 py-0.5 font-medium text-teal">
              <BadgeCheck className="h-3 w-3" aria-hidden="true" />
              Source-grounded response
            </span>
            {message.citations && message.citations.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-500">
                Citation available
              </span>
            )}
          </div>
        )}

        {!message.isStreaming && message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.citations.map((c) => (
              <CitationBadge key={c.index} citation={c} onClick={onCitationClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
