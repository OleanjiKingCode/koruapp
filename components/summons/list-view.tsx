"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { cn, formatCurrency } from "@/lib/utils";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import { Badge } from "@/components/ui/badge";
import {
  CrownIcon,
  TrendUpIcon,
  TrendDownIcon,
  ShareIcon,
} from "@/components/icons";
import { getTagColor } from "@/lib/constants";
import { useRefreshableImage } from "@/lib/hooks/use-refreshable-image";
import type { Summon } from "@/lib/types";

// Component to handle image with fallback
function ProfileImage({
  src,
  alt,
  seed,
  size = 48,
  className,
}: {
  src?: string;
  alt: string;
  seed: string;
  size?: number;
  className?: string;
}) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return <AvatarGenerator seed={seed} size={size} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}

// Backer image with automatic refresh from Twitter on error
function BackerImage({
  src,
  alt,
  seed,
}: {
  src?: string;
  alt: string;
  seed: string;
}) {
  const { imageSrc, hasError, isRefreshing, handleError } = useRefreshableImage({
    initialSrc: src,
    username: seed, // seed is the username
  });

  if (!imageSrc || hasError) {
    return <AvatarGenerator seed={seed} size={20} />;
  }

  return (
    <>
      <img
        src={imageSrc}
        alt={alt}
        className={cn(
          "w-full h-full object-cover",
          isRefreshing && "opacity-50"
        )}
        onError={handleError}
      />
      {isRefreshing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 border border-white/50 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </>
  );
}

interface ListViewProps {
  summons: Summon[];
  onShare: (summon: Summon) => void;
  onBack: (summon: Summon) => void;
  onViewDetails: (summon: Summon) => void;
  currentUserId?: string;
}

export function ListView({
  summons,
  onShare,
  onBack,
  onViewDetails,
  currentUserId,
}: ListViewProps) {
  // Check if user has already backed a summon
  const hasUserBacked = (summon: Summon) => {
    if (!currentUserId || !summon.backersData) return false;
    return summon.backersData.some((backer) => backer.id === currentUserId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-3"
    >
      {summons.map((summon, index) => (
        <SummonCard
          key={summon.id}
          summon={summon}
          index={index}
          onViewDetails={onViewDetails}
          onShare={onShare}
          onBack={onBack}
          hasUserBacked={hasUserBacked(summon)}
        />
      ))}
    </motion.div>
  );
}

// Individual summon card component with decorative background
function SummonCard({
  summon,
  index,
  onViewDetails,
  onShare,
  onBack,
  hasUserBacked,
}: {
  summon: Summon;
  index: number;
  onViewDetails: (summon: Summon) => void;
  onShare: (summon: Summon) => void;
  onBack: (summon: Summon) => void;
  hasUserBacked: boolean;
}) {
  const [bgImageError, setBgImageError] = useState(false);
  const hasValidBgImage = summon.targetProfileImage && !bgImageError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onViewDetails(summon)}
      className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-koru-purple/30 dark:hover:border-koru-purple/30 transition-all cursor-pointer group overflow-hidden"
    >
      {hasValidBgImage && (
        <div className="absolute flex md:hidden -top-8 -right-10 w-72 h-72 pointer-events-none">
          <img
            src={summon.targetProfileImage || undefined}
            alt=""
            className="w-full h-full object-cover rounded-full opacity-[0.07] dark:opacity-[0.05] blur-[2px]"
            aria-hidden="true"
            onError={() => setBgImageError(true)}
          />
        </div>
      )}

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="hidden sm:flex items-center justify-center w-8 shrink-0">
          {index < 3 ? (
            <CrownIcon
              className={cn(
                "w-6 h-6",
                index === 0
                  ? "text-yellow-500"
                  : index === 1
                  ? "text-gray-400"
                  : "text-amber-600"
              )}
            />
          ) : (
            <span className="text-sm  text-neutral-400">#{index + 1}</span>
          )}
        </div>

        {/* Avatar */}
        <ProfileImage
          src={summon.targetProfileImage || undefined}
          alt={summon.targetName}
          seed={summon.targetHandle}
          size={48}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-neutral-800"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className=" font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {summon.targetName}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              @{summon.targetHandle}
            </span>
            {summon.tags && Object.keys(summon.tags).length > 0 ? (
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-300 dark:text-neutral-600">
                  ·
                </span>
                {Object.entries(summon.tags)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([tag]) => (
                    <span
                      key={tag}
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        getTagColor(tag)
                      )}
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            ) : (
              <Badge variant="outline" className="shrink-0 text-xs">
                {summon.category}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <p className="text-lg text-koru-golden">
              {formatCurrency(summon.totalPledged, { compact: true })}
            </p>
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-sm",
                summon.trend === "up"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-rose-500/10 text-rose-500"
              )}
            >
              {summon.trend === "up" ? (
                <TrendUpIcon className="w-4 h-4" />
              ) : (
                <TrendDownIcon className="w-4 h-4" />
              )}
              {summon.trendValue.toFixed(2)}%
            </div>{" "}
   
            {!hasUserBacked && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBack(summon);
                }}
                className="px-3 py-1.5 rounded-xl bg-koru-purple/10 hover:bg-koru-purple/20 text-koru-purple text-xs font-medium transition-all"
                title="Back this summon"
              >
                Back
              </button>
            )}
            {/* Share Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare(summon);
              }}
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-koru-golden/10 hover:text-koru-golden text-neutral-500 transition-all"
              title="Share summon"
            >
              <ShareIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Second row: Backer avatars - aligned right */}
          <div className="flex items-center justify-end">
            <div className="flex -space-x-1">
              {summon.backersData && summon.backersData.length > 0 ? (
                <>
                  {summon.backersData.slice(0, 20).map((backer, idx) => (
                    <div
                      key={backer.id || idx}
                      className="relative w-5 h-5 rounded-full ring-1 ring-white dark:ring-neutral-900 overflow-hidden"
                      title={backer.name}
                    >
                      <BackerImage
                        src={backer.profileImageUrl || undefined}
                        alt={backer.name}
                        seed={backer.username}
                      />
                    </div>
                  ))}
                  {summon.backers > 20 && (
                    <div className="w-5 h-5 rounded-full ring-1 ring-white dark:ring-neutral-900 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-neutral-600 dark:text-neutral-300">
                        +{summon.backers - 20}
                      </span>
                    </div>
                  )}
                </>
              ) : summon.backers > 0 ? (
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                  {summon.backers} backer{summon.backers !== 1 ? "s" : ""}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
