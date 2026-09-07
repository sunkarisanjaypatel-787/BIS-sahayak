"use client";

import { useRef } from "react";
import { Mic, Paperclip, SendHorizontal } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export default function ChatInput({ value, onChange, onSubmit, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) onSubmit();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  }

  return (
    <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-bis-blue focus-within:ring-1 focus-within:ring-bis-blue/30 transition-colors">
      <button
        type="button"
        className="shrink-0 rounded-lg p-2 text-bis-blue hover:bg-slate-100 hover:text-bis-blueDark transition-colors"
        aria-label="Attach a file"
      >
        <Paperclip className="h-5 w-5" aria-hidden="true" />
      </button>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="Ask about BIS standards, clauses, testing requirements…"
        aria-label="Message BIS Sahayak"
        className="max-h-40 flex-1 resize-none bg-transparent py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
      />

      <button
        type="button"
        className="shrink-0 rounded-lg p-2 text-bis-blue hover:bg-slate-100 hover:text-bis-blueDark transition-colors"
        aria-label="Use microphone"
      >
        <Mic className="h-5 w-5" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!value.trim() || disabled}
        aria-label="Send message"
        className="shrink-0 rounded-lg bg-bis-blue p-2.5 text-white transition-colors hover:bg-bis-blueDark disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
      >
        <SendHorizontal className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
