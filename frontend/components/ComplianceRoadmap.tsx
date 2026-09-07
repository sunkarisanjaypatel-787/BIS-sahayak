import { CheckCircle2, Circle } from "lucide-react";

const STEPS = [
  { label: "Understand Requirement", done: true },
  { label: "Identify Applicable Standard", done: true },
  { label: "Prepare Documents", done: false },
  { label: "Testing & Verification", done: false },
  { label: "Certification", done: false },
];

export default function ComplianceRoadmap() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <h3 className="text-sm font-semibold text-bis-darkblue">Compliance Roadmap</h3>
      <ol className="mt-3 space-y-2.5">
        {STEPS.map((step, i) => (
          <li key={step.label} className="flex items-center gap-2.5">
            {step.done ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-slate-300" aria-hidden="true" />
            )}
            <span className="text-[11px] font-semibold text-slate-400">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className={`text-sm ${step.done ? "text-slate-700" : "text-slate-400"}`}>
              {step.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
