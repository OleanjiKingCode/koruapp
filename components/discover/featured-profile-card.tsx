"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { OptimizedAvatar } from "@/components/ui/optimized-image";
import {
  ArrowRightIcon,
  UsersIcon,
  SparkleIcon,
  DollarIcon,
  GlobeIcon,
  ChatIcon,
  CrownIcon,
  FireIcon,
  ShieldIcon,
} from "@/components/icons";
import { VerifiedBadge } from "./verified-badge";
import { ParsedBio } from "./parsed-bio";
import { getTagColor, deduplicateTags } from "@/lib/utils/tags";
import { formatFollowerCount } from "@/lib/utils/format";
import type { FeaturedProfile } from "@/lib/supabase";

// Icon map for tags - matches partial strings (case-insensitive)
const TAG_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  // Tech & AI
  "ai": SparkleIcon,
  "machine learning": SparkleIcon,
  "ml": SparkleIcon,
  "tech": ShieldIcon,
  "software": ShieldIcon,
  "dev": ShieldIcon,
  "engineer": ShieldIcon,
  "code": ShieldIcon,
  // Crypto & Finance
  "crypto": DollarIcon,
  "defi": DollarIcon,
  "bitcoin": DollarIcon,
  "ethereum": DollarIcon,
  "web3": GlobeIcon,
  "nft": SparkleIcon,
  "trading": DollarIcon,
  "finance": DollarIcon,
  "invest": DollarIcon,
  "vc": DollarIcon,
  // Creator & Influencer
  "creator": CrownIcon,
  "influencer": CrownIcon,
  "founder": CrownIcon,
  "ceo": CrownIcon,
  "entrepreneur": CrownIcon,
  // Entertainment
  "gaming": FireIcon,
  "gamer": FireIcon,
  "esport": FireIcon,
  "sports": FireIcon,
  "music": SparkleIcon,
  "artist": SparkleIcon,
  "entertainment": FireIcon,
  "content": CrownIcon,
  // Social & Community
  "community": UsersIcon,
  "social": ChatIcon,
  "education": ChatIcon,
  "podcast": ChatIcon,
  // Other
  "news": GlobeIcon,
  "politics": GlobeIcon,
  "science": SparkleIcon,
  "health": ShieldIcon,
  "design": SparkleIcon,
};

interface FeaturedProfileCardProps {
  profile: FeaturedProfile;
  onView: () => void;
}

export function FeaturedProfileCard({
  profile,
  onView,
}: FeaturedProfileCardProps) {
  const tags = deduplicateTags(profile.tags || []);

  return (
    <motion.div
      initial={{ y: 0 }}
      whileHover={{ y: -8 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      className="group relative cursor-pointer"
    >
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-soft group-hover:shadow-xl transition-shadow duration-200 overflow-hidden">


        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <motion.div
            className="absolute w-40 h-40 rounded-full bg-gradient-to-br from-koru-purple/25 to-violet-500/15 blur-3xl"
            animate={{
              x: [0, 40, 20, 0],
              y: [0, -30, -10, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ top: "-30%", right: "-15%" }}
          />
          <motion.div
            className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-pink-500/10 blur-3xl"
            animate={{
              x: [0, -30, -15, 0],
              y: [0, 25, 10, 0],
              scale: [1, 0.9, 1.05, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            style={{ bottom: "-20%", left: "-10%" }}
          />
          <motion.div
            className="absolute w-28 h-28 rounded-full bg-gradient-to-br from-koru-lime/15 to-emerald-500/10 blur-2xl"
            animate={{
              x: [0, 25, -10, 0],
              y: [0, -15, 20, 0],
              scale: [1, 1.15, 0.9, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
            style={{ top: "20%", left: "10%" }}
          />
        </div>

        <div className="relative flex flex-col gap-4">
          {/* Avatar & Basic Info */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-neutral-200 dark:border-neutral-700">
                <OptimizedAvatar
                  src={profile.profile_image_url}
                  alt={profile.name}
                  size={56}
                  fallbackSeed={profile.username}
                />
              </div>
            </div>

            {/* Name & Handle */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3
                  className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate"
                  title={profile.name}
                >
                  {profile.name}
                </h3>
                {profile.verified && <VerifiedBadge />}
              </div>
              <p
                className="text-sm text-neutral-500 dark:text-neutral-400 truncate"
                title={`@${profile.username}`}
              >
                @{profile.username}
              </p>
            </div>

            {/* Followers Badge */}
            <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full text-sm text-neutral-600 dark:text-neutral-400">
              <UsersIcon className="w-3 h-3" />
              {formatFollowerCount(profile.followers_count)}
            </div>
          </div>

          {/* Bio - with clickable URLs and @mentions */}
          {profile.bio && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
              <ParsedBio text={profile.bio} />
            </p>
          )}

          {/* Category & Tags - fixed height, no expansion */}
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 4).map((tag) => {
              const color = getTagColor(tag);
              const iconKey = Object.keys(TAG_ICON_MAP).find(
                (key) => tag.toLowerCase().includes(key.toLowerCase())
              );
              const TagIcon = iconKey ? TAG_ICON_MAP[iconKey] : null;

              return (
                <span
                  key={tag}
                  className={`px-2.5 py-1 ${color.bg} ${color.text} text-xs rounded-full border ${color.border} flex items-center gap-1`}
                  title={tag}
                >
                  {TagIcon && <TagIcon className="w-2.5 h-2.5 shrink-0" />}
                  <span className="truncate">{tag}</span>
                </span>
              );
            })}
            {tags.length > 4 && (
              <span
                className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-[10px] rounded-full"
                title={tags.slice(4).join(", ")}
              >
                +{tags.length - 4}
              </span>
            )}
          </div>

          {/* CTA Button */}
          <Button
            onClick={onView}
            variant="outline"
            size="sm"
            className="mt-2 group-hover:bg-koru-purple group-hover:text-white group-hover:border-koru-purple transition-all"
          >
            View
            <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}


