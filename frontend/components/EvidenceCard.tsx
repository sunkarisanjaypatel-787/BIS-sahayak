"use client";

import { forwardRef } from "react";
import type { Evidence } from "@/lib/types";
import SourceExtract from "./SourceExtract";

interface EvidenceCardProps {
  evidence: Evidence;
  isActive?: boolean;
}

const EvidenceCard = forwardRef<HTMLDivElement, EvidenceCardProps>(function EvidenceCard(
  { evidence, isActive },
  ref
) {
  return (
    <div
      ref={ref}
      className={`rounded-xl border bg-white p-3.5 shadow-card transition-shadow ${
        isActive ? "border-bis-blue ring-2 ring-bis-blue/20" : "border-slate-200"
      }`}
    >
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Standard
          </dt>
          <dd className="font-semibold text-bis-blue">{evidence.standard}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Category
          </dt>
          <dd className="text-slate-700 font-medium">
            {evidence.category || "General"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Clause
          </dt>
          <dd className="text-slate-700 font-mono text-xs">
            {evidence.clause || evidence.clause_identifier || "General"}
          </dd>
        </div>
        {evidence.source && evidence.source !== evidence.standard && (
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Source
            </dt>
            <dd className="text-slate-700 truncate" title={evidence.source}>
              {evidence.source}
            </dd>
          </div>
        )}
        {evidence.table && (
          <div className="col-span-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Reference
            </dt>
            <dd className="text-slate-700">{evidence.table}</dd>
          </div>
        )}
      </dl>

      {evidence.snippet ? (
        <div className="mt-3">
          <SourceExtract snippet={evidence.snippet} source={evidence.source || evidence.standard} />
        </div>
      ) : null}

      {typeof evidence.relevance === "number" && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Relevance
          </span>
          <div className="h-1.5 flex-1 rounded-full bg-slate-100">
            <div
              className="h-1.5 rounded-full bg-bis-blue"
              style={{ width: `${Math.round(evidence.relevance * 100)}%` }}
            />
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            {Math.round(evidence.relevance * 100)}%
          </span>
        </div>
      )}
    </div>
  );
});

export default EvidenceCard;
