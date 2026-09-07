export default function LoadingEvidence() {
  return (
    <div className="space-y-3 px-4 py-4" aria-label="Retrieving verified BIS evidence" role="status">
      <p className="text-xs font-medium text-slate-400">Retrieving verified BIS evidence…</p>
      {[0, 1].map((i) => (
        <div key={i} className="animate-pulse rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-2 h-3 w-24 rounded bg-slate-200" />
          <div className="mb-1.5 h-2.5 w-full rounded bg-slate-100" />
          <div className="mb-1.5 h-2.5 w-5/6 rounded bg-slate-100" />
          <div className="h-2.5 w-2/3 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
