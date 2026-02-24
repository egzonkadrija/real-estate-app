export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="aspect-[4/3] animate-pulse bg-gray-200" />
      <div className="p-4">
        <div className="mb-2 h-5 w-24 animate-pulse rounded bg-gray-200" />
        <div className="mb-2 h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="mb-3 h-3 w-32 animate-pulse rounded bg-gray-200" />
        <div className="flex gap-4 border-t border-gray-100 pt-3">
          <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
