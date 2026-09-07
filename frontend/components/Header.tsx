"use client";

import { Menu, ShieldCheck, UserCircle } from "lucide-react";
import PersonaToggle from "./PersonaToggle";
import ConnectionStatus from "./ConnectionStatus";
import AccessibilityControls from "./AccessibilityControls";
import type { ConnectionState, PersonaMode } from "@/lib/types";

interface HeaderProps {
  mode: PersonaMode;
  onModeChange: (mode: PersonaMode) => void;
  connectionState: ConnectionState;
  onRetryConnection: () => void;
  language: "en" | "hi";
  onLanguageChange: (lang: "en" | "hi") => void;
  fontScale: number;
  onFontScaleChange: (scale: number) => void;
  onOpenSidebar: () => void;
}

export default function Header({
  mode,
  onModeChange,
  connectionState,
  onRetryConnection,
  language,
  onLanguageChange,
  fontScale,
  onFontScaleChange,
  onOpenSidebar,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-bis-blue text-white shadow-header">
      {/* Utility strip */}
      <div className="hidden md:flex items-center justify-end gap-4 border-b border-white/10 bg-bis-darkblue/50 px-4 py-1 text-xs text-blue-100">
        <div className="flex items-center gap-1" role="group" aria-label="Language">
          <button
            type="button"
            onClick={() => onLanguageChange("en")}
            aria-pressed={language === "en"}
            className={`px-1 hover:text-white transition-colors ${
              language === "en" ? "font-semibold text-bis-saffron underline underline-offset-2" : "text-blue-100"
            }`}
          >
            English
          </button>
          <span aria-hidden="true" className="text-white/40">|</span>
          <button
            type="button"
            onClick={() => onLanguageChange("hi")}
            aria-pressed={language === "hi"}
            className={`px-1 font-devanagari hover:text-white transition-colors ${
              language === "hi" ? "font-semibold text-bis-saffron underline underline-offset-2" : "text-blue-100"
            }`}
          >
            हिन्दी
          </button>
        </div>
        <AccessibilityControls fontScale={fontScale} onFontScaleChange={onFontScaleChange} />
      </div>

      {/* Main header */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden rounded-md p-1.5 text-white/90 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-bis-blue shadow-sm"
            aria-hidden="true"
          >
            <ShieldCheck className="h-5 w-5 text-bis-blue" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <h1 className="text-[15px] font-bold leading-tight text-white truncate">
                BIS Sahayak
              </h1>
              <span className="hidden sm:inline text-xs font-medium text-blue-100 truncate">
                AI Compliance Assistant
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-blue-200/90 truncate">
              Indian Standards • Compliance • Verified Knowledge
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:block">
            <PersonaToggle mode={mode} onChange={onModeChange} />
          </div>
          <div className="hidden sm:block">
            <ConnectionStatus state={connectionState} onRetry={onRetryConnection} />
          </div>
          <button
            type="button"
            className="hidden md:flex items-center justify-center rounded-full p-1.5 text-blue-100 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="User profile"
          >
            <UserCircle className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile persona toggle + connection row */}
      <div className="flex md:hidden items-center justify-between gap-2 border-t border-white/10 px-4 py-2 bg-bis-darkblue/40">
        <PersonaToggle mode={mode} onChange={onModeChange} />
        <ConnectionStatus state={connectionState} onRetry={onRetryConnection} />
      </div>
    </header>
  );
}
