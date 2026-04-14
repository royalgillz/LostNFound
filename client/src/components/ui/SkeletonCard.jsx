export default function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse bg-white border border-neutral-100">
      <div className="h-48 bg-neutral-200" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-neutral-200 rounded-full w-3/4" />
        <div className="h-3 bg-neutral-200 rounded-full w-1/2" />
        <div className="h-3 bg-neutral-200 rounded-full w-full" />
        <div className="h-3 bg-neutral-200 rounded-full w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
