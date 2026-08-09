'use client';

export function CardSkeleton() {
  return (
    <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800/80 animate-pulse space-y-4">
      <div className="h-4 bg-zinc-800 rounded w-1/3" />
      <div className="h-8 bg-zinc-800 rounded w-1/2" />
      <div className="h-3 bg-zinc-800 rounded w-4/5" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800/80 animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-5 bg-zinc-800 rounded w-1/4" />
        <div className="h-4 bg-zinc-800 rounded w-16" />
      </div>
      <div className="h-64 bg-zinc-800/40 rounded-lg flex items-end justify-between p-4 gap-2">
        <div className="w-full bg-zinc-800 h-1/3 rounded" />
        <div className="w-full bg-zinc-800 h-1/2 rounded" />
        <div className="w-full bg-zinc-800 h-2/3 rounded" />
        <div className="w-full bg-zinc-800 h-3/4 rounded" />
        <div className="w-full bg-zinc-800 h-full rounded" />
      </div>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800/80 animate-pulse space-y-3">
      <div className="h-5 bg-zinc-800 rounded w-1/3 mb-4" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-12 bg-zinc-800/50 rounded-lg w-full flex items-center px-4 justify-between">
          <div className="h-4 bg-zinc-800 rounded w-1/3" />
          <div className="h-4 bg-zinc-800 rounded w-1/6" />
        </div>
      ))}
    </div>
  );
}
