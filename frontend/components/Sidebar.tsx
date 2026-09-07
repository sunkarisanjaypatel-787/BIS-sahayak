"use client";

import {
  LayoutDashboard,
  MessageSquareText,
  BookOpenText,
  Map,
  BookmarkCheck,
  FileBarChart,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "AI Assistant", icon: MessageSquareText },
  { label: "Standards Explorer", icon: BookOpenText },
  { label: "Compliance Roadmap", icon: Map },
  { label: "Saved Queries", icon: BookmarkCheck },
  { label: "Reports", icon: FileBarChart },
];

function NavList({
  activeTab,
  onSelectTab,
}: {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}) {
  return (
    <nav aria-label="Primary" className="flex flex-col gap-1 px-2">
      {NAV_ITEMS.map(({ label, icon: Icon }) => {
        const isActive = activeTab === label;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelectTab(label)}
            aria-current={isActive ? "page" : undefined}
            className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              isActive
                ? "bg-[#0a3161] font-semibold text-white shadow-sm ring-1 ring-white/10"
                : "text-blue-100/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default function Sidebar({
  isOpen,
  onClose,
  activeTab = "AI Assistant",
  onSelectTab,
}: SidebarProps) {
  const handleTabClick = (tab: string) => {
    onSelectTab?.(tab);
    onClose();
  };

  return (
    <>
      {/* Desktop rail */}
      <aside
        className="hidden lg:flex sticky top-[97px] h-[calc(100vh-97px)] w-56 shrink-0 flex-col rounded-xl bg-[#0a3161] text-white py-4 shadow-card border border-[#0a3161]"
        aria-label="Sidebar navigation"
      >
        <NavList activeTab={activeTab} onSelectTab={handleTabClick} />
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="absolute left-0 top-0 h-full w-64 bg-[#0a3161] text-white shadow-xl animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="text-sm font-semibold text-white">Menu</span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-blue-100/80 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="py-3">
              <NavList activeTab={activeTab} onSelectTab={handleTabClick} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
