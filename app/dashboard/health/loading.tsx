export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      <div className="h-40 rounded-2xl bg-muted/40 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-48 rounded-2xl bg-muted/40 animate-pulse" />
        <div className="h-48 rounded-2xl bg-muted/40 animate-pulse" />
      </div>
    </div>
  );
}
