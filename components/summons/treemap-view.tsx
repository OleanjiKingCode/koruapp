"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { cn, calculateTreemapLayout, formatCurrency } from "@/lib/utils";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import { CrownIcon, ShareIcon } from "@/components/icons";
import type { Summon } from "@/lib/types";

interface TreemapViewProps {
  summons: Summon[];
  totalPledged: number;
  onShare: (summon: Summon) => void;
  onViewDetails?: (summon: Summon) => void;
}

export function TreemapView({
  summons,
  totalPledged,
  onShare,
  onViewDetails,
}: TreemapViewProps) {
  // Calculate treemap layout using imported utility
  const treemapRects = useMemo(() => {
    return calculateTreemapLayout(summons, totalPledged);
  }, [summons, totalPledged]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full overflow-hidden border border-neutral-200 dark:border-neutral-800"
      style={{ aspectRatio: "1 / 1", maxHeight: "700px" }}
    >
      {treemapRects.map((rect, index) => {
        const summon = rect.data;
        const isUp = summon.trend === "up";
        const isLarge = rect.percentage > 15;
        const isMedium = rect.percentage > 8;
        const isSmall = rect.percentage > 3;

        return (
          <motion.div
            key={summon.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03, duration: 0.3 }}
            whileHover={{ zIndex: 50 }}
            onClick={() => onViewDetails?.(summon)}
            className={cn(
              "absolute cursor-pointer group overflow-hidden",
              "border border-white/20",
              isUp ? "bg-emerald-600" : "bg-rose-600"
            )}
            style={{
              left: `${rect.x}%`,
              top: `${rect.y}%`,
              width: `${rect.width}%`,
              height: `${rect.height}%`,
            }}
          >
            {/* Diagonal gradient overlay */}
            <div
              className={cn(
                "absolute inset-0 opacity-30",
                isUp
                  ? "bg-gradient-to-br from-emerald-400 to-transparent"
                  : "bg-gradient-to-br from-rose-400 to-transparent"
              )}
            />

            {/* Sparkline effect for larger cells */}
            {(isLarge || isMedium) && (
              <div className="absolute bottom-0 left-0 right-0 h-1/3 opacity-40">
                <svg
                  className="w-full h-full"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 30"
                >
                  <path
                    d={`M0,20 L10,${15 + (index % 10)} L25,${
                      18 - (index % 8)
                    } L40,${22 - (index % 6)} L55,${14 + (index % 7)} L70,${
                      19 - (index % 5)
                    } L85,${16 + (index % 4)} L100,${18 - (index % 6)}`}
                    fill="none"
                    stroke={isUp ? "#10b981" : "#f43f5e"}
                    strokeWidth="2"
                  />
                </svg>
              </div>
            )}

            {/* Content */}
            <div className="relative p-2 sm:p-3 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                  {(isLarge || isMedium) && (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md overflow-hidden bg-white/20 shrink-0">
                      {summon.targetProfileImage ? (
                        <img
                          src={summon.targetProfileImage}
                          alt={summon.targetName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <AvatarGenerator seed={summon.targetHandle} size={24} />
                      )}
                    </div>
                  )}
                  <span
                    className={cn(
                      " font-bold text-white uppercase tracking-wide truncate",
                      isLarge
                        ? "text-sm sm:text-base"
                        : isMedium
                        ? "text-xs sm:text-sm"
                        : "text-[10px] sm:text-xs"
                    )}
                  >
                    {isSmall
                      ? summon.targetHandle.toUpperCase()
                      : summon.targetHandle.slice(0, 4).toUpperCase()}
                  </span>
                </div>
                {isLarge && index < 3 && (
                  <CrownIcon
                    className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5 shrink-0",
                      index === 0
                        ? "text-yellow-400"
                        : index === 1
                        ? "text-gray-300"
                        : "text-amber-600"
                    )}
                  />
                )}
              </div>

              <div className="mt-auto">
                <p
                  className={cn(
                    " font-bold text-white leading-tight",
                    isLarge
                      ? "text-base sm:text-xl"
                      : isMedium
                      ? "text-sm sm:text-lg"
                      : isSmall
                      ? "text-xs sm:text-sm"
                      : "text-[10px]"
                  )}
                >
                  {rect.percentage.toFixed(2)}%
                </p>
                {(isLarge || isMedium) && (
                  <p className="text-[10px] sm:text-xs text-white/70 ">
                    {formatCurrency(summon.totalPledged, { compact: true })}
                  </p>
                )}
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
              <div className="text-center text-white">
                <p className="text-sm sm:text-base mb-0.5 truncate">
                  {summon.targetName}
                </p>
                <p className="text-xs text-white/80 line-clamp-2">
                  {summon.request}
                </p>
                {/* Backers avatars */}
                <div className="flex items-center justify-center gap-1 mt-2">
                  <div className="flex -space-x-1.5">
                    {summon.backersData && summon.backersData.length > 0
                      ? summon.backersData.slice(0, 3).map((backer, idx) => (
                          <div
                            key={backer.id || idx}
                            className="w-5 h-5 rounded-full ring-1 ring-white/50 overflow-hidden"
                            title={backer.name}
                          >
                            {backer.profileImageUrl ? (
                              <img
                                src={backer.profileImageUrl}
                                alt={backer.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <AvatarGenerator
                                seed={backer.username}
                                size={20}
                              />
                            )}
                          </div>
                        ))
                      : null}
                    {summon.backers > 3 && (
                      <div className="w-5 h-5 rounded-full ring-1 ring-white/50 bg-white/20 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-white">
                          +{summon.backers - 3}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-white/60">
                    {summon.backers} backer{summon.backers !== 1 ? "s" : ""} ·{" "}
                    {rect.percentage.toFixed(2)}%
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(summon);
                  }}
                  className="mt-2 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-colors flex items-center gap-1 mx-auto"
                >
                  <ShareIcon className="w-3 h-3" />
                  Share
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
