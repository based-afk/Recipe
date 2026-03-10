export default function SkeletonCard() {
  return (
    <div className="bg-surface rounded-lg overflow-hidden shadow-md shadow-black/40 animate-pulse">
      <div className="flex h-[210px]">
        {/* Left text skeleton */}
        <div className="flex flex-col justify-between p-5 w-[55%]">
          <div className="space-y-3">
            <div className="h-2 w-10 bg-surface-hover rounded" />
            <div className="space-y-1.5">
              <div className="h-4 bg-surface-hover rounded w-full" />
              <div className="h-4 bg-surface-hover rounded w-3/4" />
            </div>
            <div className="flex gap-4">
              <div className="space-y-1">
                <div className="h-2 w-6 bg-surface-hover rounded" />
                <div className="h-3 w-10 bg-surface-hover rounded" />
              </div>
              <div className="space-y-1">
                <div className="h-2 w-8 bg-surface-hover rounded" />
                <div className="h-3 w-6 bg-surface-hover rounded" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="h-2.5 bg-surface-hover rounded w-full" />
              <div className="h-2.5 bg-surface-hover rounded w-4/5" />
            </div>
          </div>
          <div className="h-7 w-28 bg-surface-hover rounded" />
        </div>

        {/* Right image skeleton */}
        <div className="flex-1 bg-surface-hover" />
      </div>
    </div>
  );
}
