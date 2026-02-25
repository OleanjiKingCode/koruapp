import {
  StatCardSkeleton,
  ChatCardSkeleton,
} from "@/components/shared/skeletons";

export default function ChatsLoading() {
  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      <div className="space-y-3 mt-12">
        <div className="h-8 w-32 bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-3 gap-3 mt-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="space-y-3 mt-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <ChatCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
