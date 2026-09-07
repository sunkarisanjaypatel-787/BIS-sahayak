"use client";

const PROMPTS = ["IS 10500 TDS Limits", "Gold Hallmark Verification", "IS 456 Concrete Slump Test"];

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
}

export default function QuickPrompts({ onSelect }: QuickPromptsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested questions">
      {PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect(prompt)}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:border-bis-blue hover:text-bis-blue transition-colors"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
