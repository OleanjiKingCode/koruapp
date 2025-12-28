import { CrownIcon } from "@/components/icons";

interface RankBadgeProps {
  rank: number;
}

export function RankBadge({ rank }: RankBadgeProps) {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center w-8 h-8">
        <CrownIcon className="w-6 h-6 crown-gold" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-8 h-8">
        <CrownIcon className="w-6 h-6 crown-silver" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-8 h-8">
        <CrownIcon className="w-6 h-6 crown-bronze" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800">
      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
        {rank}
      </span>
    </div>
  );
}

