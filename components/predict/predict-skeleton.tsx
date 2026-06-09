export function PredictSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div
          className="min-h-[268px] animate-pulse border border-white/10 bg-[#15161a] p-4"
          key={index}
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="h-6 w-36 bg-white/10" />
            <div className="h-4 w-4 bg-white/10" />
          </div>
          <div className="h-5 w-3/4 bg-white/10" />
          <div className="mt-3 h-px bg-white/10" />
          <div className="mt-5 space-y-3">
            <div className="h-4 w-full bg-white/10" />
            <div className="h-4 w-5/6 bg-white/10" />
            <div className="h-4 w-2/3 bg-white/10" />
          </div>
          <div className="mt-8 flex gap-2">
            <div className="h-6 w-20 bg-white/10" />
            <div className="h-6 w-16 bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
