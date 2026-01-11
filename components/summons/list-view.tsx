"use client";

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
import type { Summon } from "@/lib/types";

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
        <motion.div
          key={summon.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onViewDetails(summon)}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-koru-purple/30 dark:hover:border-koru-purple/30 transition-all cursor-pointer group"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Rank */}
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
            {summon.targetProfileImage ? (
              <img
                src={summon.targetProfileImage}
                alt={summon.targetName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-neutral-800"
              />
            ) : (
              <AvatarGenerator seed={summon.targetHandle} size={48} />
            )}

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

            {/* Stats - Two rows */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {/* First row: Amount, Trend, Back, Share */}
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
                </div>

                {/* Back Button - show if user hasn't backed yet */}
                {!hasUserBacked(summon) && (
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
                          className="w-5 h-5 rounded-full ring-1 ring-white dark:ring-neutral-900 overflow-hidden"
                          title={backer.name}
                        >
                          {backer.profileImageUrl ? (
                            <img
                              src={backer.profileImageUrl}
                              alt={backer.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <AvatarGenerator seed={backer.username} size={20} />
                          )}
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
      ))}
    </motion.div>
  );
}
