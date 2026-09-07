"use client";

import { User, Factory } from "lucide-react";
import type { PersonaMode } from "@/lib/types";

interface PersonaToggleProps {
  mode: PersonaMode;
  onChange: (mode: PersonaMode) => void;
}

export default function PersonaToggle({ mode, onChange }: PersonaToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Persona mode"
      className="relative flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-sm"
    >
      <button
        type="button"
        role="radio"
        aria-checked={mode === "consumer"}
        onClick={() => onChange("consumer")}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors ${
          mode === "consumer"
            ? "bg-bis-blue text-white shadow-sm"
            : "text-slate-600 hover:text-bis-blue"
        }`}
      >
        <User className="h-3.5 w-3.5" aria-hidden="true" />
        Consumer
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={mode === "industry"}
        onClick={() => onChange("industry")}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors ${
          mode === "industry"
            ? "bg-bis-blue text-white shadow-sm"
            : "text-slate-600 hover:text-bis-blue"
        }`}
      >
        <Factory className="h-3.5 w-3.5" aria-hidden="true" />
        Industry / MSME
      </button>
    </div>
  );
}
