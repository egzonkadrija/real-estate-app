export function SkeletonCard() {
  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
      <div className="h-[152px] animate-pulse bg-gray-200 sm:h-[220px] lg:h-[240px]" />
      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 grid grid-cols-3 gap-1.5 sm:mt-3 sm:gap-2">
          <div className="h-8 animate-pulse rounded-[var(--radius-md)] bg-gray-200" />
          <div className="h-8 animate-pulse rounded-[var(--radius-md)] bg-gray-200" />
          <div className="h-8 animate-pulse rounded-[var(--radius-md)] bg-gray-200" />
        </div>
        <div className="mt-2 h-10 animate-pulse rounded-[var(--radius-md)] bg-gray-200 sm:mt-3 sm:h-9" />
      </div>
    </div>
  );
}
