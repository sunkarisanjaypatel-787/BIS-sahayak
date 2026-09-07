"use client";

import { Accessibility } from "lucide-react";

interface AccessibilityControlsProps {
  fontScale: number;
  onFontScaleChange: (scale: number) => void;
}

const STEPS = [0.9, 1, 1.1, 1.2];

export default function AccessibilityControls({
  fontScale,
  onFontScaleChange,
}: AccessibilityControlsProps) {
  const currentIndex = STEPS.indexOf(fontScale);

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Text size controls">
      <button
        type="button"
        onClick={() => onFontScaleChange(STEPS[Math.max(0, currentIndex - 1)])}
        disabled={currentIndex <= 0}
        className="px-1.5 py-0.5 text-xs font-semibold text-slate-600 hover:text-bis-blue disabled:opacity-30 disabled:hover:text-slate-600"
        aria-label="Decrease text size"
      >
        A-
      </button>
      <button
        type="button"
        onClick={() => onFontScaleChange(1)}
        className="px-1.5 py-0.5 text-sm font-semibold text-slate-600 hover:text-bis-blue"
        aria-label="Reset text size"
      >
        A
      </button>
      <button
        type="button"
        onClick={() => onFontScaleChange(STEPS[Math.min(STEPS.length - 1, currentIndex + 1)])}
        disabled={currentIndex >= STEPS.length - 1}
        className="px-1.5 py-0.5 text-base font-semibold text-slate-600 hover:text-bis-blue disabled:opacity-30 disabled:hover:text-slate-600"
        aria-label="Increase text size"
      >
        A+
      </button>
      <span className="flex items-center gap-1 pl-2 border-l border-slate-200 text-xs text-slate-600">
        <Accessibility className="h-3.5 w-3.5" aria-hidden="true" />
        Accessibility
      </span>
    </div>
  );
}
