"use client";

import { forwardRef } from "react";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import { CheckIcon } from "@/components/icons";
import type { UserData } from "@/lib/types";

// Koru Logo component for share cards (using img for screenshot compatibility)
function KoruLogo({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <img
      src="/logo.png"
      alt="K"
      width={size}
      height={size}
      className={`rounded-md ${className}`}
    />
  );
}

interface ProfileShareCardProps {
  userData: UserData;
  variant?: "default" | "minimal" | "gradient" | "neon" | "ticket";
  className?: string;
}

// The main Profile Share Card component - designed to be screenshot-ready
export const ProfileShareCard = forwardRef<
  HTMLDivElement,
  ProfileShareCardProps
>(({ userData, variant = "default", className }, ref) => {
  if (variant === "minimal") {
    return (
      <div
        ref={ref}
        className={`w-[480px] h-[280px] relative overflow-hidden ${className}`}
        style={{
          background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10 h-full p-8 flex flex-col">
          {/* Top section */}
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-white/10">
              <AvatarGenerator seed={userData.username} size={80} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-white tracking-tight truncate">
                  {userData.displayName}
                </h2>
                {userData.badges.includes("Verified") && (
                  <div className="w-5 h-5 rounded-full bg-[#c385ee] flex items-center justify-center shrink-0">
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <p className="text-sm text-white/40">@{userData.twitterHandle}</p>
              {userData.bio && (
                <p className="text-xs text-white/50 mt-2 line-clamp-2">
                  {userData.bio}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 flex items-end">
            <div className="flex gap-8">
              <div>
                <p className="text-3xl font-bold text-[#c385ee]">
                  {userData.stats.activeChats}
                </p>
                <p className="text-xs text-white/40 uppercase tracking-wider">
                  Chats
                </p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#dab079]">
                  {userData.stats.appealsCreated}
                </p>
                <p className="text-xs text-white/40 uppercase tracking-wider">
                  Appeals
                </p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#9deb61]">
                  {userData.stats.totalSpent}
                </p>
                <p className="text-xs text-white/40 uppercase tracking-wider">
                  Earned
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <KoruLogo size={24} className="rounded-lg" />
              <span className="text-white/60 text-sm font-medium">
                koruapp.xyz/{userData.username}
              </span>
            </div>
            <p className="text-white/30 text-xs">Since {userData.joinDate}</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "gradient") {
    return (
      <div
        ref={ref}
        className={`w-[480px] h-[320px] relative overflow-hidden rounded-3xl ${className}`}
        style={{
          background:
            "linear-gradient(135deg, #c385ee 0%, #dab079 50%, #9deb61 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Glass card overlay */}
        <div className="absolute inset-4 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30" />

        <div className="relative z-10 h-full p-10 flex flex-col">
          {/* Avatar centered */}
          <div className="flex flex-col items-center mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white/50 shadow-2xl mb-3">
              <AvatarGenerator seed={userData.username} size={80} />
            </div>

            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white drop-shadow-lg">
                {userData.displayName}
              </h2>
              {userData.badges.includes("Verified") && (
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg">
                  <CheckIcon className="w-4 h-4 text-[#c385ee]" />
                </div>
              )}
            </div>
            <p className="text-sm text-white/70 mt-1">
              @{userData.twitterHandle}
            </p>

            {userData.bio && (
              <p className="text-xs text-white/80 mt-2 text-center max-w-[320px] line-clamp-2">
                {userData.bio}
              </p>
            )}
          </div>

          {/* Stats row */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex gap-10 bg-black/20 backdrop-blur-sm rounded-2xl px-8 py-4">
              <div className="text-center">
                <p className="text-3xl font-black text-white">
                  {userData.stats.activeChats}
                </p>
                <p className="text-xs text-white/70 font-medium uppercase tracking-wider">
                  Chats
                </p>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <p className="text-3xl font-black text-white">
                  {userData.stats.appealsCreated}
                </p>
                <p className="text-xs text-white/70 font-medium uppercase tracking-wider">
                  Appeals
                </p>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <p className="text-3xl font-black text-white">
                  {userData.stats.totalSpent}
                </p>
                <p className="text-xs text-white/70 font-medium uppercase tracking-wider">
                  Earned
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-white/80 text-sm font-bold">
              koruapp.xyz/{userData.username}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "neon") {
    return (
      <div
        ref={ref}
        className={`w-[500px] h-[340px] relative overflow-hidden rounded-3xl ${className}`}
        style={{
          background: "#0a0a0a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Animated gradient border effect */}
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            background:
              "linear-gradient(45deg, #c385ee, #dab079, #9deb61, #c385ee)",
            backgroundSize: "300% 300%",
            animation: "gradient-shift 4s ease infinite",
            padding: "2px",
          }}
        >
          <div className="absolute inset-[2px] bg-[#0a0a0a] rounded-[22px]" />
        </div>

        {/* Glow effects */}
        <div className="absolute top-0 left-1/4 w-40 h-40 bg-[#c385ee] rounded-full blur-[100px] opacity-30" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-[#9deb61] rounded-full blur-[100px] opacity-20" />

        <div className="relative z-10 h-full p-8 flex flex-col">
          {/* Header with avatar */}
          <div className="flex items-start gap-5">
            <div className="relative">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden">
                <AvatarGenerator seed={userData.username} size={80} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-white truncate">
                  {userData.displayName}
                </h2>
                {userData.badges.includes("Verified") && (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#c385ee] to-[#9deb61] flex items-center justify-center shrink-0">
                    <CheckIcon className="w-3 h-3 text-black" />
                  </div>
                )}
              </div>
              <p className="text-sm text-white/40 tracking-wide">
                @{userData.twitterHandle}
              </p>
            </div>
          </div>

          {/* Bio */}
          {userData.bio && (
            <p className="text-sm text-white/50 mt-4 line-clamp-2 max-w-[380px]">
              {userData.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex-1 flex items-end">
            <div className="w-full grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-2xl font-bold text-[#c385ee]">
                  {userData.stats.activeChats}
                </p>
                <p className="text-xs text-white/40">Active Chats</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-2xl font-bold text-[#dab079]">
                  {userData.stats.appealsCreated}
                </p>
                <p className="text-xs text-white/40">Appeals</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-2xl font-bold text-[#9deb61]">
                  {userData.stats.totalSpent}
                </p>
                <p className="text-xs text-white/40">Earned</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <KoruLogo size={24} className="rounded-lg" />
              <span className="text-white/60 text-sm font-medium">
                koruapp.xyz/{userData.username}
              </span>
            </div>
            <p className="text-white/30 text-xs">Since {userData.joinDate}</p>
          </div>
        </div>

        <style jsx>{`
          @keyframes gradient-shift {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
        `}</style>
      </div>
    );
  }

  if (variant === "ticket") {
    return (
      <div
        ref={ref}
        className={`w-[520px] h-[220px] relative ${className}`}
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <div className="flex h-full">
          {/* Main Ticket Section */}
          <div
            className="flex-1 relative overflow-hidden rounded-l-2xl"
            style={{
              background: "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)",
            }}
          >
            {/* Subtle pattern */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)`,
                backgroundSize: "10px 10px",
              }}
            />

            <div className="relative z-10 h-full p-6 flex flex-col">
              {/* Route Header */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-neutral-800 tracking-tight">
                    @
                    {userData.twitterHandle.length > 8
                      ? userData.twitterHandle.slice(0, 8)
                      : userData.twitterHandle}
                  </p>
                  <p className="text-xs text-neutral-500 font-medium">Member</p>
                </div>

                <div className="flex items-center gap-2 px-4">
                  <div className="w-8 h-px bg-gradient-to-r from-neutral-300 to-transparent" />
                  <svg
                    className="w-5 h-5 text-[#c385ee]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                  </svg>
                  <div className="w-8 h-px bg-gradient-to-l from-neutral-300 to-transparent" />
                </div>

                <div className="text-center">
                  <p className="text-2xl font-black text-[#c385ee] tracking-tight">
                    KORU
                  </p>
                  <p className="text-xs text-neutral-500 font-medium">
                    Platform
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="flex-1 flex items-center">
                <div className="w-full grid grid-cols-3 gap-3 bg-white/60 rounded-xl p-4 border border-neutral-200/50">
                  <div>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">
                      Chats
                    </p>
                    <p className="text-lg font-bold text-[#c385ee]">
                      {userData.stats.activeChats}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">
                      Appeals
                    </p>
                    <p className="text-lg font-bold text-neutral-800">
                      {userData.stats.appealsCreated}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">
                      Earned
                    </p>
                    <p className="text-lg font-bold text-[#9deb61]">
                      {userData.stats.totalSpent}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-200/50">
                <div className="flex items-center gap-2">
                  <KoruLogo size={20} className="rounded-md" />
                  <span className="text-neutral-600 text-xs font-semibold">
                    koruapp.xyz
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400 text-xs">
                    @{userData.twitterHandle}
                  </span>
                  {userData.badges.includes("Verified") && (
                    <div className="w-4 h-4 rounded-full bg-[#c385ee] flex items-center justify-center">
                      <CheckIcon className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Perforated Edge */}
          <div className="relative w-4 flex flex-col justify-between py-2">
            {Array.from({ length: 11 }).map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full bg-white"
                style={{
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
                }}
              />
            ))}
          </div>

          {/* Stub Section */}
          <div
            className="w-[140px] relative overflow-hidden rounded-r-2xl"
            style={{
              background: "linear-gradient(180deg, #1a1446 0%, #0f0d24 100%)",
            }}
          >
            <div className="relative z-10 h-full p-4 flex flex-col items-center justify-between">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-white/20">
                <AvatarGenerator seed={userData.username} size={56} />
              </div>

              {/* Vertical Text */}
              <div className="flex-1 flex items-center justify-center">
                <div className="transform -rotate-90 whitespace-nowrap">
                  <p className="text-lg font-bold text-white tracking-wider">
                    {userData.displayName.length > 10
                      ? userData.displayName.slice(0, 10)
                      : userData.displayName}
                  </p>
                </div>
              </div>

              {/* Join date */}
              <p className="text-[8px] text-white/50 font-mono tracking-widest">
                {userData.joinDate}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant - Premium card design
  return (
    <div
      ref={ref}
      className={`w-[480px] h-[350px] relative overflow-hidden rounded-3xl ${className}`}
      style={{
        background: "linear-gradient(145deg, #1a1446 0%, #0f0d24 100%)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#c385ee] rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#dab079] rounded-full blur-[100px] opacity-15 translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-[#9deb61] rounded-full blur-[80px] opacity-10" />

      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 h-full p-8 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Avatar with glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#c385ee] to-[#dab079] rounded-2xl blur-md opacity-60" />
              <div className="relative w-16 h-16 rounded-xl overflow-hidden ring-2 ring-white/20">
                <AvatarGenerator seed={userData.username} size={64} />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white truncate">
                  {userData.displayName}
                </h2>
                {userData.badges.includes("Verified") && (
                  <div className="w-5 h-5 rounded-full bg-[#c385ee] flex items-center justify-center shrink-0">
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <p className="text-sm text-white/40">@{userData.twitterHandle}</p>
            </div>
          </div>

          {/* Badge */}
          <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#dab079] to-[#dab079]/50 text-black font-bold text-sm shrink-0">
            Early Adopter
          </div>
        </div>

        {/* Bio */}
        {userData.bio && (
          <p className="text-sm text-white/50 mb-4 line-clamp-2 max-w-[380px]">
            {userData.bio}
          </p>
        )}

        {/* Stats */}
        <div className="flex-1 flex items-center">
          <div className="w-full grid grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/5">
              <p className="text-3xl font-bold text-[#c385ee] mb-1">
                {userData.stats.activeChats}
              </p>
              <p className="text-xs text-white/50 font-medium">Active Chats</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/5">
              <p className="text-3xl font-bold text-[#dab079] mb-1">
                {userData.stats.appealsCreated}
              </p>
              <p className="text-xs text-white/50 font-medium">Appeals</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/5">
              <p className="text-3xl font-bold text-[#9deb61] mb-1">
                {userData.stats.totalSpent}
              </p>
              <p className="text-xs text-white/50 font-medium">Earned</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t mt-4 border-white/10">
          <div className="flex items-center gap-3">
            <KoruLogo size={32} className="rounded-xl shadow-lg" />
            <span className="text-white/70 text-sm font-semibold">
              koruapp.xyz/{userData.username}
            </span>
          </div>
          <p className="text-white/30 text-xs">Since {userData.joinDate}</p>
        </div>
      </div>
    </div>
  );
});

ProfileShareCard.displayName = "ProfileShareCard";

export default ProfileShareCard;
