"use client";

import { useEffect, useRef } from "react";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import type { Evidence, EvidenceState } from "@/lib/types";
import EmptyEvidence from "./EmptyEvidence";
import LoadingEvidence from "./LoadingEvidence";
import EvidenceCard from "./EvidenceCard";
import ComplianceRoadmap from "./ComplianceRoadmap";

interface EvidencePanelProps {
  state?: EvidenceState;
  sources?: Evidence[];
  evidence?: Evidence[];
  activeIndex?: number | null;
  onRetry?: () => void;
}

export default function EvidencePanel({
  state = "empty",
  sources,
  evidence,
  activeIndex = null,
  onRetry,
}: EvidencePanelProps) {
  const items = sources ?? evidence ?? [];
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (activeIndex === null) return;
    const el = cardRefs.current[activeIndex - 1];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeIndex]);

  const hasSources = items.length > 0;

  return (
    <section
      className="flex h-full min-h-0 flex-col rounded-xl border border-slate-200 bg-white shadow-card"
      aria-label="Verified evidence panel"
    >
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-bis-darkblue">Verified Evidence</h2>
          <p className="text-xs text-slate-500">Source-backed information from BIS documents</p>
        </div>
        {hasSources && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-bis-blue/10 px-2.5 py-1 text-[11px] font-semibold text-bis-blue">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {items.length} {items.length === 1 ? "Source" : "Sources"} Verified
          </span>
        )}
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {state === "loading" && items.length === 0 && <LoadingEvidence />}

        {state === "error" && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bis-red/10 text-bis-red">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-slate-600">
              Evidence could not be retrieved.
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-lg bg-bis-blue px-4 py-1.5 text-xs font-semibold text-white hover:bg-bis-blueDark transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {!hasSources && state !== "loading" && state !== "error" && <EmptyEvidence />}

        {hasSources && (
          <div className="space-y-3 p-4">
            {items.map((item, i) => (
              <EvidenceCard
                key={`${item.standard}-${item.clause || i}-${i}`}
                evidence={item}
                isActive={activeIndex === i + 1}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
              />
            ))}
            <ComplianceRoadmap />
          </div>
        )}
      </div>
    </section>
  );
}
