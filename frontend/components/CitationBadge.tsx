"use client";

import type { Citation } from "@/lib/types";

interface CitationBadgeProps {
  citation: Citation;
  onClick: (index: number) => void;
}

export default function CitationBadge({ citation, onClick }: CitationBadgeProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(citation.index)}
      className="inline-flex items-center gap-1 rounded-md border border-bis-blue/20 bg-bis-blue/5 px-2 py-1 text-xs font-medium text-bis-blue hover:bg-bis-blue/10 transition-colors"
    >
      <span className="flex h-4 w-4 items-center justify-center rounded bg-bis-blue text-[10px] font-semibold text-white">
        {citation.index}
      </span>
      {citation.standard}
      {citation.clause ? ` — Clause ${citation.clause}` : ""}
    </button>
  );
}
