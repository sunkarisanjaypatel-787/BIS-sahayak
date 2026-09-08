"use client";

import {
  FileCheck,
  Clock,
  Bell,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FileSearch,
  ScanLine,
  CheckCircle2,
  BookOpen,
  FileSpreadsheet,
  Building2,
  ExternalLink,
} from "lucide-react";

interface DashboardViewProps {
  onNavigateToAssistant: () => void;
}

const STAT_CARDS = [
  {
    title: "Active Licences",
    value: "4 Active",
    description: "IS 1417, IS 10500, IS 1786, IS 456",
    icon: FileCheck,
    badge: "In Good Standing",
    theme: {
      cardBg: "bg-emerald-500/5",
      border: "border-emerald-500/20",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  },
  {
    title: "Pending Renewals",
    value: "1 Due Soon",
    description: "IS 14543 renewal window in 45 days",
    icon: Clock,
    badge: "Action Required",
    theme: {
      cardBg: "bg-amber-500/5",
      border: "border-amber-500/20",
      iconBg: "bg-[#F5B74C]/20",
      iconColor: "text-amber-700",
      badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    },
  },
  {
    title: "New BIS Notifications",
    value: "3 Gazette Updates",
    description: "Mandatory QCO compliance updates",
    icon: Bell,
    badge: "New Gazettes",
    theme: {
      cardBg: "bg-[#287581]/5",
      border: "border-[#287581]/20",
      iconBg: "bg-[#287581]/15",
      iconColor: "text-[#287581]",
      badgeBg: "bg-[#287581]/10 text-[#287581] border-[#287581]/20",
    },
  },
  {
    title: "System Status",
    value: "Air-Gapped: Secure",
    description: "Local vector store & Edge inference active",
    icon: ShieldCheck,
    badge: "100% On-Premise",
    theme: {
      cardBg: "bg-[#0a3161]/5",
      border: "border-[#0a3161]/20",
      iconBg: "bg-[#0a3161]/10",
      iconColor: "text-[#0a3161]",
      badgeBg: "bg-[#0a3161]/10 text-[#0a3161] border-[#0a3161]/20",
    },
  },
];

const RECENT_ACTIVITIES = [
  {
    id: "act-1",
    title: "Checked IS 1417 Hallmarking limits",
    detail: "Queried gold purity 22K/18K tolerances and hallmarking assay center rules.",
    time: "12 mins ago",
    type: "query",
    icon: FileSearch,
    tag: "IS 1417:1999",
    status: "Verified",
  },
  {
    id: "act-2",
    title: "Uploaded label for IS 14543",
    detail: "Local OCR extracted nutritional parameters and mandatory Standard Mark placement.",
    time: "1 hour ago",
    type: "ocr",
    icon: ScanLine,
    tag: "IS 14543:2016",
    status: "Processed",
  },
  {
    id: "act-3",
    title: "Drinking water parameter threshold review",
    detail: "Verified permissible limits for Total Dissolved Solids (TDS) and heavy metals.",
    time: "3 hours ago",
    type: "standard",
    icon: CheckCircle2,
    tag: "IS 10500:2012",
    status: "Compliant",
  },
  {
    id: "act-4",
    title: "Compliance roadmap check for TMT Steel Bars",
    detail: "Reviewed Scheme-I testing protocol and chemical composition criteria.",
    time: "Yesterday",
    type: "roadmap",
    icon: BookOpen,
    tag: "IS 1786:2008",
    status: "In Progress",
  },
  {
    id: "act-5",
    title: "Generated Technical Dossier Report",
    detail: "Exported audit-ready clause references for regulatory submission.",
    time: "2 days ago",
    type: "report",
    icon: FileSpreadsheet,
    tag: "Scheme-I",
    status: "Archived",
  },
];

export default function DashboardView({ onNavigateToAssistant }: DashboardViewProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4 pr-0.5">
      {/* 1. Header Section */}
      <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0a3161]/10 px-2.5 py-0.5 text-xs font-semibold text-[#0a3161]">
                <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                Enterprise Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">MSME-DL-2024-9104</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0a3161]">
              Welcome back, MSME Partner
            </h1>
            <p className="text-sm text-slate-600">
              Manage your Indian Standards compliance, regulatory renewals, and AI-assisted certification workflows in real-time.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 pt-1 sm:pt-0">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              BIS Manakonline Sync: Online
            </span>
          </div>
        </div>
      </header>

      {/* 2. Quick Stats Row */}
      <section aria-label="Key compliance metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className={`flex flex-col justify-between rounded-xl border bg-white p-4 shadow-card transition-all hover:shadow-md ${stat.theme.border}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.theme.iconBg} ${stat.theme.iconColor}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${stat.theme.badgeBg}`}>
                  {stat.badge}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-xs font-medium text-slate-500">{stat.title}</p>
                <p className="text-lg font-bold text-[#0a3161]">{stat.value}</p>
                <p className="mt-0.5 text-[11.5px] text-slate-500 line-clamp-1">{stat.description}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. Main Content Split: Bento Layout */}
      <section aria-label="Main dashboard content" className="grid grid-cols-1 gap-4 lg:grid-cols-12 flex-1 min-h-0">
        {/* Left Column: Recent Activity (7 cols) */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-card lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-[#0a3161]">Recent Compliance Activity</h2>
              <p className="text-xs text-slate-500">Audit log of standard verifications and label scans</p>
            </div>
            <span className="text-xs font-semibold text-[#0a3161] hover:underline cursor-pointer">
              View All
            </span>
          </div>

          <div className="mt-3 divide-y divide-slate-100 overflow-y-auto">
            {RECENT_ACTIVITIES.map((item) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 py-3 transition-colors hover:bg-slate-50/75 rounded-lg px-2"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0a3161]/5 text-[#0a3161]">
                    <ItemIcon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
                      <span className="shrink-0 text-[11px] text-slate-400 font-medium">{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.detail}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10.5px] font-mono font-medium text-slate-700">
                        {item.tag}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" aria-hidden="true" />
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI Assistant CTA Card (5 cols) */}
        <div className="flex flex-col justify-between rounded-xl border border-[#0a3161]/30 bg-gradient-to-br from-[#0a3161] via-[#072449] to-[#04162e] p-6 text-white shadow-xl lg:col-span-5 relative overflow-hidden">
          {/* Subtle decorative glow background */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#F5B74C]/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-[#287581]/20 blur-3xl" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5B74C]/20 border border-[#F5B74C]/40 px-3 py-1 text-xs font-bold text-[#F5B74C] tracking-wide uppercase">
                <Sparkles className="h-3.5 w-3.5 text-[#F5B74C]" aria-hidden="true" />
                Air-Gapped Copilot
              </span>
              <span className="text-[11px] font-mono text-blue-200/70">v1.0 Ready</span>
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                BIS Sahayak AI Assistant
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-blue-100/80 leading-relaxed">
                Empower your engineering and compliance teams with instant, grounded answers across thousands of Indian Standard specifications.
              </p>
            </div>

            {/* Feature Highlights */}
            <ul className="space-y-2.5 pt-1 text-xs text-blue-100/90">
              <li className="flex items-start gap-2">
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#F5B74C]/30 text-[#F5B74C]">
                  ✓
                </div>
                <span>
                  <strong className="text-white">Clause-Level Citations:</strong> Exact IS document & clause evidence for every assertion.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#F5B74C]/30 text-[#F5B74C]">
                  ✓
                </div>
                <span>
                  <strong className="text-white">Packaging & Label OCR:</strong> Edge image processing to identify standard mark defects.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#F5B74C]/30 text-[#F5B74C]">
                  ✓
                </div>
                <span>
                  <strong className="text-white">Zero Data Leaks:</strong> Fully on-premise local embeddings & inference model.
                </span>
              </li>
            </ul>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onNavigateToAssistant}
              className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#F5B74C] px-5 py-3.5 text-sm font-bold text-[#0a3161] shadow-lg transition-all hover:bg-[#f3ad37] hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>Launch AI Assistant</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </button>
            <p className="mt-2 text-center text-[11px] text-blue-200/60">
              Pre-loaded with Gold Hallmarking, Drinking Water & Steel standards
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
