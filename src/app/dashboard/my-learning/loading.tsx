export default function MyLearningLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-44 rounded-lg bg-white/10 animate-pulse" />
        <div className="mt-1 h-4 w-64 rounded bg-white/5 animate-pulse" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="aspect-video w-full bg-white/5 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 rounded bg-white/10 animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-white/5 animate-pulse" />
              <div className="mt-3 h-2 w-full rounded-full bg-white/5 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
