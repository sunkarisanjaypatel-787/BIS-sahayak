"use client";

import { useState } from "react";
import { Copy, ExternalLink, Maximize2, Check } from "lucide-react";

interface SourceExtractProps {
  snippet: string;
  source: string;
}

export default function SourceExtract({ snippet, source }: SourceExtractProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard permission denied or unavailable — fail silently.
    }
  }

  return (
    <div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="font-mono text-[12.5px] leading-relaxed text-slate-700 whitespace-pre-wrap">
          "{snippet}"
        </p>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:border-bis-blue hover:text-bis-blue transition-colors"
        >
          {copied ? (
            <Check className="h-3 w-3" aria-hidden="true" />
          ) : (
            <Copy className="h-3 w-3" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:border-bis-blue hover:text-bis-blue transition-colors"
        >
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
          Open Source
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:border-bis-blue hover:text-bis-blue transition-colors"
        >
          <Maximize2 className="h-3 w-3" aria-hidden="true" />
          View Full Context
        </button>
      </div>
    </div>
  );
}
