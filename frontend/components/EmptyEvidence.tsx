import { FileSearch } from "lucide-react";

export default function EmptyEvidence() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <FileSearch className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-slate-600">Verified evidence will appear here.</p>
      <p className="max-w-[220px] text-xs text-slate-400">
        Ask a question to retrieve the relevant BIS standard, clause and source extract.
      </p>
    </div>
  );
}
