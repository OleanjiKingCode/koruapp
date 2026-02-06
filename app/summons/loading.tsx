import { SummonCardSkeleton } from "@/components/shared/skeletons";

export default function SummonsLoading() {
  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
      <div className="space-y-3 mt-12">
        <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse" />
        <div className="h-5 w-72 bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse" />
      </div>
      <div className="grid gap-4 mt-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <SummonCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
