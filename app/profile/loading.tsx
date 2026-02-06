import {
  ProfileHeaderSkeleton,
  StatCardSkeleton,
} from "@/components/shared/skeletons";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      <ProfileHeaderSkeleton className="mt-12" />
      <div className="grid grid-cols-3 gap-3 mt-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
