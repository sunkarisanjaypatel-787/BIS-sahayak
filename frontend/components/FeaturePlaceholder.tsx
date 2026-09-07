"use client";

import {
  LayoutDashboard,
  BookOpenText,
  Map,
  BookmarkCheck,
  FileBarChart,
  Construction,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface FeaturePlaceholderProps {
  tabName: string;
  onNavigateToAssistant?: () => void;
}

const TAB_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Dashboard: LayoutDashboard,
  "Standards Explorer": BookOpenText,
  "Compliance Roadmap": Map,
  "Saved Queries": BookmarkCheck,
  Reports: FileBarChart,
};

export default function FeaturePlaceholder({
  tabName,
  onNavigateToAssistant,
}: FeaturePlaceholderProps) {
  const Icon = TAB_ICONS[tabName] || Construction;

  return (
    <div
      role="region"
      aria-label={`${tabName} feature placeholder`}
      className="flex h-full min-h-[460px] flex-1 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-card"
    >
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#0a3161]/10 text-[#0a3161] ring-8 ring-[#0a3161]/5 animate-fade-in">
        <Icon className="h-10 w-10 text-[#0a3161]" />
        <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-bis-saffron text-[#0a3161] shadow-xs">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
      </div>

      <div className="max-w-md space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
          {tabName}
        </span>
        <h2 className="text-xl font-bold tracking-tight text-[#0a3161]">
          Feature in Development
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          The <span className="font-semibold text-slate-700">{tabName}</span> module is currently being integrated with BIS regulatory databases and testing workflows.
        </p>
      </div>

      {onNavigateToAssistant && (
        <button
          type="button"
          onClick={onNavigateToAssistant}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0a3161] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#072449] shadow-sm hover:shadow"
        >
          <span>Return to AI Assistant</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
