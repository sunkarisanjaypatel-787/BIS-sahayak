"use client";

import { RefreshCw } from "lucide-react";
import type { ConnectionState } from "@/lib/types";

interface ConnectionStatusProps {
  state: ConnectionState;
  onRetry?: () => void;
}

const CONFIG: Record<ConnectionState, { label: string; dot: string; text: string }> = {
  connected: {
    label: "Orchestrator Connected",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
  },
  connecting: {
    label: "Connecting…",
    dot: "bg-bis-saffron",
    text: "text-amber-700",
  },
  offline: {
    label: "Orchestrator Offline",
    dot: "bg-bis-red",
    text: "text-bis-red",
  },
};

export default function ConnectionStatus({ state, onRetry }: ConnectionStatusProps) {
  const cfg = CONFIG[state];

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium ${cfg.text}`}
        role="status"
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${cfg.dot} ${
            state === "connecting" ? "animate-pulse-dot" : ""
          }`}
          aria-hidden="true"
        />
        {cfg.label}
      </div>
      {state === "offline" && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:border-bis-blue hover:text-bis-blue transition-colors"
        >
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}
