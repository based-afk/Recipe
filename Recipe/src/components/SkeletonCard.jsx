export default function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="relative rounded-xl border border-border overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.06)]">
        {/* Image placeholder */}
        <div className="relative aspect-[4/3] bg-surface-hover">
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

          {/* Badge placeholder */}
          <div className="absolute left-3 top-3 h-4 w-16 rounded-full bg-white/10" />

          {/* Text placeholder */}
          <div className="absolute inset-0 flex flex-col justify-end px-4 pb-4 pt-10 space-y-2">
            <div className="h-3 bg-white/10 rounded w-4/5" />
            <div className="h-3 bg-white/10 rounded w-3/5" />
            <div className="flex gap-3 mt-1">
              <div className="h-2 bg-white/10 rounded w-12" />
              <div className="h-2 bg-white/10 rounded w-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
