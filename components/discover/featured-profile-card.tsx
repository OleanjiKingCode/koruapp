"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import { ArrowRightIcon, UsersIcon } from "@/components/icons";
import { VerifiedBadge } from "./verified-badge";
import { ParsedBio } from "./parsed-bio";
import { getTagColor, deduplicateTags } from "@/lib/utils/tags";
import { formatFollowerCount } from "@/lib/utils/format";
import type { FeaturedProfile } from "@/lib/supabase";

interface FeaturedProfileCardProps {
  profile: FeaturedProfile;
  onView: () => void;
}

export function FeaturedProfileCard({ profile, onView }: FeaturedProfileCardProps) {
  const tags = deduplicateTags(profile.tags || []);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-soft transition-all duration-300 hover:shadow-xl hover:border-koru-purple/30 dark:hover:border-koru-purple/30"
    >
      {/* Gold shimmer on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 border-2 border-transparent rounded-2xl shimmer-gold" />
      </div>

      <div className="relative flex flex-col gap-4">
        {/* Avatar & Basic Info */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            {profile.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt={profile.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-neutral-200 dark:border-neutral-700"
              />
            ) : (
              <AvatarGenerator seed={profile.username} size={56} />
            )}
          </div>

          {/* Name & Handle */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {profile.name}
              </h3>
              {profile.verified && <VerifiedBadge />}
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
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

        {/* Category & Tags - with colors */}
        <div className="flex flex-wrap gap-2">
          {profile.category &&
            (() => {
              const color = getTagColor(profile.category);
              return (
                <span
                  className={`px-2.5 py-1 ${color.bg} ${color.text} text-xs rounded-full font-medium border ${color.border}`}
                >
                  {profile.category}
                </span>
              );
            })()}
          {tags.slice(0, 2).map((tag) => {
            const color = getTagColor(tag);
            return (
              <span
                key={tag}
                className={`px-2.5 py-1 ${color.bg} ${color.text} text-xs rounded-full border ${color.border}`}
              >
                {tag}
              </span>
            );
          })}
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
    </motion.div>
  );
}

