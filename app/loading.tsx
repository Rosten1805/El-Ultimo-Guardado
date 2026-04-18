export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Hero skeleton */}
      <div className="w-full h-[380px] lg:h-[500px] skeleton" aria-hidden="true" />

      {/* Category cards skeleton */}
      <div className="px-6 lg:px-10 xl:px-16 mt-6">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl skeleton" />
          ))}
        </div>
      </div>

      {/* Section skeletons */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="px-6 lg:px-10 xl:px-16 mt-8" aria-hidden="true">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 rounded-full skeleton" />
            <div className="w-24 h-4 rounded skeleton" />
          </div>
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 8 }).map((_, j) => (
              <div key={j} className="shrink-0 w-[160px]">
                <div className="aspect-[3/4] skeleton rounded" />
                <div className="mt-2 space-y-1.5 p-2">
                  <div className="h-3 skeleton rounded w-3/4" />
                  <div className="h-2 skeleton rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
