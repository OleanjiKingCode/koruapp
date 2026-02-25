import { NotificationCardSkeleton } from "@/components/shared/skeletons";

export default function NotificationsLoading() {
  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      <div className="space-y-3 mt-12">
        <div className="h-8 w-40 bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-3 mt-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <NotificationCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
