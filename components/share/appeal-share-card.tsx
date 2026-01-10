"use client";

import { forwardRef } from "react";
import { TrendUpIcon, TrendDownIcon } from "@/components/icons";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import type { Summon } from "@/lib/types";

// Simple inline tag colors for the share card (don't need dark mode since cards are static images)
const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Web3: { bg: "#f3e8ff", text: "#7c3aed" },
  DeFi: { bg: "#f3e8ff", text: "#7c3aed" },
  NFTs: { bg: "#ede9fe", text: "#6d28d9" },
  DAOs: { bg: "#f3e8ff", text: "#7c3aed" },
  Crypto: { bg: "#fef3c7", text: "#b45309" },
  AI: { bg: "#dbeafe", text: "#1d4ed8" },
  Tech: { bg: "#cffafe", text: "#0891b2" },
  Startup: { bg: "#e0f2fe", text: "#0284c7" },
  Investing: { bg: "#d1fae5", text: "#059669" },
  Podcast: { bg: "#fce7f3", text: "#be185d" },
  Interview: { bg: "#ffe4e6", text: "#be123c" },
  AMA: { bg: "#fae8ff", text: "#a21caf" },
  Content: { bg: "#fce7f3", text: "#be185d" },
  Memes: { bg: "#ffedd5", text: "#c2410c" },
  Education: { bg: "#e0e7ff", text: "#4338ca" },
  Gaming: { bg: "#fee2e2", text: "#b91c1c" },
  Music: { bg: "#ede9fe", text: "#6d28d9" },
  Sports: { bg: "#dcfce7", text: "#15803d" },
  Fashion: { bg: "#fce7f3", text: "#be185d" },
  Food: { bg: "#ffedd5", text: "#c2410c" },
  Health: { bg: "#ccfbf1", text: "#0d9488" },
  Finance: { bg: "#d1fae5", text: "#059669" },
  Personal: { bg: "#f1f5f9", text: "#475569" },
  Business: { bg: "#f3f4f6", text: "#4b5563" },
  Advice: { bg: "#fef9c3", text: "#a16207" },
  Collaboration: { bg: "#ecfccb", text: "#65a30d" },
  Networking: { bg: "#cffafe", text: "#0891b2" },
  Mentorship: { bg: "#e0e7ff", text: "#4338ca" },
  Community: { bg: "#dbeafe", text: "#1d4ed8" },
  Charity: { bg: "#ffe4e6", text: "#be123c" },
  Politics: { bg: "#fee2e2", text: "#b91c1c" },
  Culture: { bg: "#fef3c7", text: "#b45309" },
};

const DEFAULT_TAG_COLOR = { bg: "#f3f4f6", text: "#4b5563" };

function getTagStyle(tag: string) {
  return TAG_COLORS[tag] || DEFAULT_TAG_COLOR;
}

interface AppealShareCardProps {
  appeal: Summon;
  variant?: "default" | "compact" | "vibrant" | "dark";
  className?: string;
}

// Format number with K/M suffix
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

// The main Summon Share Card component
export const AppealShareCard = forwardRef<HTMLDivElement, AppealShareCardProps>(
  ({ appeal, variant = "default", className }, ref) => {
    const TrendIcon = appeal.trend === "up" ? TrendUpIcon : TrendDownIcon;
    const trendColor = appeal.trend === "up" ? "#9deb61" : "#ef4444";

    // Get top tags sorted by count
    const topTags = appeal.tags
      ? Object.entries(appeal.tags)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([tag]) => tag)
      : [];

    if (variant === "compact") {
      return (
        <div
          ref={ref}
          className={`w-[400px] h-[220px] relative overflow-hidden ${className}`}
          style={{
            background: "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {/* Accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c385ee] via-[#dab079] to-[#9deb61]" />

          <div className="relative z-10 h-full p-6 flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {/* Target Profile Image */}
                {appeal.targetProfileImage ? (
                  <img
                    src={appeal.targetProfileImage}
                    alt={appeal.targetName}
                    className="w-12 h-12 rounded-xl object-cover"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl overflow-hidden">
                    <AvatarGenerator seed={appeal.targetHandle} size={48} />
                  </div>
                )}
                <div>
                  <p className="text-xs text-neutral-400 uppercase tracking-wider mb-0.5">
                    Summon for
                  </p>
                  <h2 className="text-lg font-bold text-neutral-900">
                    @{appeal.targetHandle}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {appeal.targetName}
                  </p>
                </div>
              </div>

              <div
                className="flex items-center gap-1.5 justify-end"
                style={{ color: trendColor }}
              >
                <TrendIcon className="w-4 h-4" />
                <span className="text-sm font-bold">+{appeal.trendValue}%</span>
              </div>
            </div>

            {/* Tags */}
            {topTags.length > 0 && (
              <div className="flex items-center gap-1.5 mb-3 flex-1">
                {topTags.map((tag) => {
                  const style = getTagStyle(tag);
                  return (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: style.bg, color: style.text }}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Stats bar */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-2xl font-bold text-neutral-900">
                    ${formatNumber(appeal.totalPledged)}
                  </p>
                  <p className="text-xs text-neutral-400">pledged</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#c385ee]">
                    {appeal.backers}
                  </p>
                  <p className="text-xs text-neutral-400">backers</p>
                </div>
              </div>

              {/* Backer avatars */}
              <div className="flex items-center gap-2">
                {appeal.backersData && appeal.backersData.length > 0 && (
                  <div className="flex -space-x-1.5">
                    {appeal.backersData.slice(0, 5).map((backer, idx) => (
                      <div
                        key={backer.id || idx}
                        className="w-6 h-6 rounded-full overflow-hidden"
                        style={{ border: "2px solid #f0f0f0" }}
                      >
                        {backer.profileImageUrl ? (
                          <img
                            src={backer.profileImageUrl}
                            alt={backer.name}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <AvatarGenerator seed={backer.username} size={20} />
                        )}
                      </div>
                    ))}
                    {appeal.backers > 5 && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{
                          background: "#e5e5e5",
                          border: "2px solid #f0f0f0",
                        }}
                      >
                        <span className="text-[8px] font-bold text-neutral-600">
                          +{appeal.backers - 5}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <img
                  src="/logo.png"
                  alt="Koru"
                  className="w-6 h-6 rounded-lg object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (variant === "vibrant") {
      return (
        <div
          ref={ref}
          className={`w-[480px] h-[280px] relative overflow-hidden rounded-3xl ${className}`}
          style={{
            background:
              "linear-gradient(135deg, #c385ee 0%, #8b5cf6 50%, #6366f1 100%)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full" />
          <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-black/10 rounded-full" />
          <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-[#9deb61]/30 rounded-full blur-2xl" />

          {/* Noise texture */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative z-10 h-full p-8 flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {/* Target Profile Image */}
                {appeal.targetProfileImage ? (
                  <img
                    src={appeal.targetProfileImage}
                    alt={appeal.targetName}
                    className="w-14 h-14 rounded-2xl object-cover"
                    style={{ border: "2px solid rgba(255,255,255,0.3)" }}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div
                    className="w-14 h-14 rounded-2xl overflow-hidden"
                    style={{ border: "2px solid rgba(255,255,255,0.3)" }}
                  >
                    <AvatarGenerator seed={appeal.targetHandle} size={56} />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-black text-white">
                    @{appeal.targetHandle}
                  </h2>
                  <p className="text-sm text-white/60">{appeal.targetName}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 max-w-[140px] justify-end">
                {topTags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      color: "white",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 flex items-end justify-between">
              <div className="flex gap-8">
                <div>
                  <p className="text-4xl font-black text-white">
                    ${formatNumber(appeal.totalPledged)}
                  </p>
                  <p className="text-sm text-white/50 font-medium">
                    Total Pledged
                  </p>
                </div>
                <div>
                  <p className="text-4xl font-black text-[#9deb61]">
                    {appeal.backers}
                  </p>
                  <p className="text-sm text-white/50 font-medium">Backer(s)</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Backer avatars */}
                {appeal.backersData && appeal.backersData.length > 0 && (
                  <div className="flex -space-x-2">
                    {appeal.backersData.slice(0, 4).map((backer, idx) => (
                      <div
                        key={backer.id || idx}
                        className="w-8 h-8 rounded-full overflow-hidden"
                        style={{ border: "2px solid rgba(255,255,255,0.3)" }}
                      >
                        {backer.profileImageUrl ? (
                          <img
                            src={backer.profileImageUrl}
                            alt={backer.name}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <AvatarGenerator seed={backer.username} size={28} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20">
                  <span
                    style={{
                      color: appeal.trend === "up" ? "#9deb61" : "#fca5a5",
                    }}
                  >
                    <TrendIcon className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-bold text-white">
                    +{appeal.trendValue}%
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 pt-4 mt-4 border-t border-white/10">
              <img
                src="/logo.png"
                alt="Koru"
                className="w-6 h-6 rounded-lg object-cover"
              />
              <span className="text-white/60 text-sm font-medium">
                koruapp.xyz
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (variant === "dark") {
      return (
        <div
          ref={ref}
          className={`w-[480px] h-[280px] relative overflow-hidden rounded-3xl ${className}`}
          style={{
            background: "#0a0a0a",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {/* Border glow */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: "linear-gradient(135deg, #dab079, #c385ee, #9deb61)",
              padding: "1px",
            }}
          >
            <div className="absolute inset-[1px] bg-[#0a0a0a] rounded-[23px]" />
          </div>

          {/* Glow spots */}
          <div className="absolute top-0 left-1/3 w-48 h-48 bg-[#dab079] rounded-full blur-[120px] opacity-15" />
          <div className="absolute bottom-0 right-1/3 w-40 h-40 bg-[#c385ee] rounded-full blur-[100px] opacity-10" />

          <div className="relative z-10 h-full p-8 flex flex-col">
            {/* Top label */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#dab079] animate-pulse" />
                <span className="text-xs text-white/40 uppercase tracking-widest font-medium">
                  Live Summon
                </span>
              </div>
              {/* Tags */}
              <div className="flex items-center gap-1.5">
                {topTags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold"
                    style={{
                      background: "rgba(218,176,121,0.15)",
                      color: "#dab079",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Main content */}
            <div className="flex items-start gap-5 mb-6">
              {/* Target Profile Image */}
              {appeal.targetProfileImage ? (
                <img
                  src={appeal.targetProfileImage}
                  alt={appeal.targetName}
                  className="w-16 h-16 rounded-2xl object-cover"
                  style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                  crossOrigin="anonymous"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-2xl overflow-hidden"
                  style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <AvatarGenerator seed={appeal.targetHandle} size={64} />
                </div>
              )}

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  @{appeal.targetHandle}
                </h2>
                <p className="text-sm text-white/40">{appeal.targetName}</p>
              </div>

              {/* Trend indicator */}
              <div
                className="flex items-center gap-1.5"
                style={{ color: trendColor }}
              >
                <TrendIcon className="w-5 h-5" />
                <span className="text-lg font-bold">+{appeal.trendValue}%</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 flex items-end">
              <div className="w-full flex justify-between items-end">
                <div className="flex gap-8">
                  <div>
                    <p className="text-3xl font-black text-[#dab079]">
                      ${formatNumber(appeal.totalPledged)}
                    </p>
                    <p className="text-xs text-white/30 mt-1">Pledged</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white">
                      {appeal.backers}
                    </p>
                    <p className="text-xs text-white/30 mt-1">Backers</p>
                  </div>
                </div>

                {/* Backer avatars and Koru branding */}
                <div className="flex items-center gap-3">
                  {appeal.backersData && appeal.backersData.length > 0 && (
                    <div className="flex -space-x-2">
                      {appeal.backersData.slice(0, 4).map((backer, idx) => (
                        <div
                          key={backer.id || idx}
                          className="w-7 h-7 rounded-full overflow-hidden"
                          style={{ border: "2px solid #0a0a0a" }}
                        >
                          {backer.profileImageUrl ? (
                            <img
                              src={backer.profileImageUrl}
                              alt={backer.name}
                              className="w-full h-full object-cover"
                              crossOrigin="anonymous"
                            />
                          ) : (
                            <AvatarGenerator seed={backer.username} size={24} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <img
                    src="/logo.png"
                    alt="Koru"
                    className="w-8 h-8 rounded-xl object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default variant - Clean professional design
    return (
      <div
        ref={ref}
        className={`w-[480px] h-[240px] relative overflow-hidden rounded-3xl ${className}`}
        style={{
          background: "linear-gradient(145deg, #fefefe 0%, #f8f8f8 100%)",
          fontFamily: "system-ui, sans-serif",
          boxShadow: "0 4px 60px rgba(0,0,0,0.08)",
        }}
      >
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#dab079] via-[#c385ee] to-[#9deb61]" />

        {/* Decorative background shape */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-br from-[#dab079]/10 to-[#c385ee]/10 rounded-full" />

        <div className="relative z-10 h-full p-8 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              {/* Target Profile Image */}
              {appeal.targetProfileImage ? (
                <img
                  src={appeal.targetProfileImage}
                  alt={appeal.targetName}
                  className="w-14 h-14 rounded-2xl object-cover shadow-lg"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg">
                  <AvatarGenerator seed={appeal.targetHandle} size={56} />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-neutral-900">
                    @{appeal.targetHandle}
                  </h2>
                </div>
                <p className="text-sm text-neutral-500">{appeal.targetName}</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              {/* Tags */}
              {topTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {topTags.slice(0, 2).map((tag) => {
                    const style = getTagStyle(tag);
                    return (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: style.bg, color: style.text }}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <span
                  className="px-3 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: "#c385ee15", color: "#c385ee" }}
                >
                  {appeal.category}
                </span>
              )}
              <div
                className="flex items-center gap-1"
                style={{ color: trendColor }}
              >
                <TrendIcon className="w-4 h-4" />
                <span className="text-sm font-bold">+{appeal.trendValue}%</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 flex items-end">
            <div className="w-full flex justify-between items-end">
              <div className="flex gap-8">
                <div>
                  <p className="text-4xl font-black text-neutral-900">
                    ${formatNumber(appeal.totalPledged)}
                  </p>
                  <p className="text-sm text-neutral-400">Total Pledged</p>
                </div>
                <div className="pl-8 border-l border-neutral-200">
                  <p className="text-4xl font-black text-[#c385ee]">
                    {appeal.backers}
                  </p>
                  <p className="text-sm text-neutral-400">Backers</p>
                </div>
              </div>

              {/* Backer avatars and Branding */}
              <div className="flex items-center gap-3">
                {appeal.backersData && appeal.backersData.length > 0 && (
                  <div className="flex -space-x-2">
                    {appeal.backersData.slice(0, 4).map((backer, idx) => (
                      <div
                        key={backer.id || idx}
                        className="w-8 h-8 rounded-full overflow-hidden"
                        style={{ border: "2px solid #f8f8f8" }}
                      >
                        {backer.profileImageUrl ? (
                          <img
                            src={backer.profileImageUrl}
                            alt={backer.name}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <AvatarGenerator seed={backer.username} size={28} />
                        )}
                      </div>
                    ))}
                    {appeal.backers > 4 && (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          background: "#e5e5e5",
                          border: "2px solid #f8f8f8",
                        }}
                      >
                        <span className="text-[10px] font-bold text-neutral-600">
                          +{appeal.backers - 4}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <img
                  src="/logo.png"
                  alt="Koru"
                  className="w-8 h-8 rounded-xl object-cover shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

AppealShareCard.displayName = "AppealShareCard";

export default AppealShareCard;
