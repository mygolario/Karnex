export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 pb-24">
      <div className="h-20 rounded-2xl bg-muted/40 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-3">
          <div className="h-24 rounded-2xl bg-muted/40 animate-pulse" />
          <div className="h-24 rounded-2xl bg-muted/40 animate-pulse" />
          <div className="h-24 rounded-2xl bg-muted/40 animate-pulse" />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-square rounded-2xl bg-muted/40 animate-pulse" />
          <div className="h-40 rounded-2xl bg-muted/40 animate-pulse" />
        </div>
      </div>
      <div className="h-64 rounded-2xl bg-muted/40 animate-pulse" />
    </div>
  );
}
