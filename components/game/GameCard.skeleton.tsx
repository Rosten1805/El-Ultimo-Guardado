export function GameCardSkeleton() {
  return (
    <div
      className="block relative rounded overflow-hidden bg-[#1a1a1a] pointer-events-none"
      aria-hidden="true"
    >
      {/* Cover placeholder — same aspect ratio as GameCard */}
      <div className="aspect-[3/4] w-full skeleton rounded-none" />

      {/* Info */}
      <div className="p-2 space-y-2">
        <div className="skeleton h-3 rounded w-3/4" />
        <div className="skeleton h-2 rounded w-1/3" />
        <div className="flex gap-1 mt-1">
          <div className="skeleton h-4 rounded-full w-10" />
          <div className="skeleton h-4 rounded-full w-12" />
        </div>
      </div>
    </div>
  );
}
