export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      <div className="h-28 rounded-2xl bg-muted/40 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-40 rounded-2xl bg-muted/40 animate-pulse" />
        <div className="h-40 rounded-2xl bg-muted/40 animate-pulse" />
        <div className="h-40 rounded-2xl bg-muted/40 animate-pulse" />
      </div>
      <div className="h-96 rounded-2xl bg-muted/40 animate-pulse" />
    </div>
  );
}
