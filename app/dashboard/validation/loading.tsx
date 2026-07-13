export default function ValidationLoading() {
  return (
    <div className="max-w-5xl mx-auto p-4 pb-24 space-y-4">
      <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
      <div className="h-40 bg-muted/40 animate-pulse rounded-2xl" />
      <div className="h-72 bg-muted/30 animate-pulse rounded-2xl" />
    </div>
  );
}
