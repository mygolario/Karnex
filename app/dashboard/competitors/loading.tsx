export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto space-y-5 p-4 pb-28">
      <div className="h-16 rounded-xl bg-muted/40 animate-pulse" />
      <div className="flex gap-2">
        <div className="h-8 w-20 rounded-lg bg-muted/40 animate-pulse" />
        <div className="h-8 w-20 rounded-lg bg-muted/40 animate-pulse" />
        <div className="h-8 w-20 rounded-lg bg-muted/40 animate-pulse" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-56 rounded-xl bg-muted/40 animate-pulse" />
        <div className="space-y-4">
          <div className="h-28 rounded-xl bg-muted/40 animate-pulse" />
          <div className="h-28 rounded-xl bg-muted/40 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
