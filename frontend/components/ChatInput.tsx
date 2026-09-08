"use client";

import { useRef, useState } from "react";
import { Mic, Paperclip, SendHorizontal, Loader2 } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (customPrompt?: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ value, onChange, onSubmit, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrPlaceholder, setOcrPlaceholder] = useState<string | null>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled && !isOcrProcessing) {
        const text = value.trim();
        if (textareaRef.current) textareaRef.current.style.height = "auto";
        onSubmit(text);
      }
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

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so subsequent uploads of same file trigger onChange
    e.target.value = "";

    // Step 2: Disable input & show simulated OCR placeholder
    setIsOcrProcessing(true);
    onChange("");
    setOcrPlaceholder("Extracting label data via local OCR...");

    // Step 3: Simulate 1500ms Edge processing delay and auto-trigger query
    setTimeout(() => {
      const simulatedPrompt =
        "I have uploaded a product label for Packaged Drinking Water. Based on the extracted text, what are the applicable BIS standards, purity grades, and marking requirements?";
      setIsOcrProcessing(false);
      setOcrPlaceholder(null);
      onChange(simulatedPrompt);
      onSubmit(simulatedPrompt);
    }, 1500);
  }

  const isInputDisabled = disabled || isOcrProcessing;

  return (
    <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-bis-blue focus-within:ring-1 focus-within:ring-bis-blue/30 transition-colors">
      <label
        htmlFor="file-upload"
        className={`shrink-0 cursor-pointer rounded-lg p-2 text-bis-blue hover:bg-slate-100 hover:text-bis-blueDark transition-colors ${
          isInputDisabled ? "pointer-events-none opacity-50" : ""
        }`}
        title="Upload product label"
        aria-label="Upload product label"
      >
        {isOcrProcessing ? (
          <Loader2 className="h-5 w-5 animate-spin text-bis-blue" aria-hidden="true" />
        ) : (
          <Paperclip className="h-5 w-5" aria-hidden="true" />
        )}
      </label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        id="file-upload"
        className="hidden"
        disabled={isInputDisabled}
        onChange={handleFileUpload}
      />

      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        disabled={isInputDisabled}
        rows={1}
        placeholder={
          ocrPlaceholder ||
          "Ask about BIS standards, clauses, testing requirements…"
        }
        aria-label="Message BIS Sahayak"
        className={`max-h-40 flex-1 resize-none bg-transparent py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed ${
          ocrPlaceholder ? "placeholder:text-bis-blue placeholder:font-medium" : ""
        }`}
      />

      <button
        type="button"
        disabled={isInputDisabled}
        className="shrink-0 rounded-lg p-2 text-bis-blue hover:bg-slate-100 hover:text-bis-blueDark transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Use microphone"
      >
        <Mic className="h-5 w-5" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={() => onSubmit()}
        disabled={!value.trim() || isInputDisabled}
        aria-label="Send message"
        className="shrink-0 rounded-lg bg-bis-blue p-2.5 text-white transition-colors hover:bg-bis-blueDark disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
      >
        <SendHorizontal className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
