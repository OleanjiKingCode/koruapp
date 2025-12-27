// Twitter API Response Types (from RapidAPI twitter241)
export interface TwitterSearchResponse {
  result: {
    timeline: {
      instructions: TwitterInstruction[];
    };
  };
  cursor?: {
    bottom: string;
    top: string;
  };
}

export interface TwitterInstruction {
  type: string;
  entries?: TwitterEntry[];
}

export interface TwitterEntry {
  entryId: string;
  sortIndex: string;
  content: TwitterEntryContent;
}

export interface TwitterEntryContent {
  entryType: string;
  __typename?: string;
  // For TimelineTimelineModule (user results)
  items?: TwitterModuleItem[];
  displayType?: string;
  header?: {
    displayType: string;
    text: string;
  };
  // For TimelineTimelineItem (tweet results)
  itemContent?: {
    itemType: string;
    __typename?: string;
    user_results?: {
      result: TwitterUserResult;
    };
    tweet_results?: {
      result: TwitterTweetResult;
    };
  };
}

export interface TwitterModuleItem {
  entryId: string;
  item: {
    itemContent: {
      itemType: string;
      __typename?: string;
      user_results?: {
        result: TwitterUserResult;
      };
      userDisplayType?: string;
    };
  };
}

export interface TwitterUserResult {
  __typename: string;
  id: string;
  rest_id: string;
  is_blue_verified: boolean;
  profile_image_shape?: string;
  // New structure: avatar contains the image
  avatar?: {
    image_url: string;
  };
  // New structure: core contains name, screen_name, created_at
  core?: {
    created_at: string;
    name: string;
    screen_name: string;
  };
  legacy: TwitterUserLegacy;
  professional?: {
    rest_id: string;
    professional_type: string;
    category: Array<{
      id: number;
      name: string;
    }>;
  };
  affiliates_highlighted_label?: Record<string, unknown>;
  has_graduated_access?: boolean;
  super_follow_eligible?: boolean;
}

export interface TwitterUserLegacy {
  created_at: string;
  description: string;
  entities: {
    description?: {
      urls: Array<{
        display_url: string;
        expanded_url: string;
        url: string;
      }>;
    };
    url?: {
      urls: Array<{
        display_url: string;
        expanded_url: string;
        url: string;
      }>;
    };
  };
  followers_count: number;
  friends_count: number;
  location: string;
  name: string;
  profile_banner_url?: string;
  profile_image_url_https?: string;
  screen_name: string;
  statuses_count: number;
  verified: boolean;
  verified_type?: string;
  favourites_count?: number;
  listed_count?: number;
  media_count?: number;
  normal_followers_count?: number;
  fast_followers_count?: number;
  default_profile?: boolean;
  default_profile_image?: boolean;
  can_dm?: boolean;
  can_media_tag?: boolean;
  has_custom_timelines?: boolean;
  is_translator?: boolean;
  possibly_sensitive?: boolean;
  translator_type?: string;
  want_retweets?: boolean;
  withheld_in_countries?: string[];
  pinned_tweet_ids_str?: string[];
  url?: string;
}

export interface TwitterTweetResult {
  __typename: string;
  rest_id: string;
  core: {
    user_results: {
      result: TwitterUserResult;
    };
  };
  legacy: {
    full_text: string;
    created_at: string;
    favorite_count: number;
    retweet_count: number;
    bookmark_count?: number;
    quote_count?: number;
    reply_count?: number;
  };
  views?: {
    count: string;
    state: string;
  };
}

// Simplified/normalized profile for app use
export interface TwitterProfile {
  id: string;
  twitterId: string;
  username: string;
  name: string;
  bio: string;
  profileImageUrl: string;
  followersCount: number;
  followingCount: number;
  verified: boolean;
  location?: string;
  createdAt?: string;
  bannerUrl?: string;
  statusesCount?: number;
  listedCount?: number;
  professionalType?: string;
  category?: string;
}

// Transform RapidAPI response to normalized profiles
export function parseTwitterSearchResponse(
  response: TwitterSearchResponse
): TwitterProfile[] {
  const profiles: TwitterProfile[] = [];
  const seenIds = new Set<string>();

  if (!response?.result?.timeline?.instructions) {
    return profiles;
  }

  for (const instruction of response.result.timeline.instructions) {
    if (instruction.type !== "TimelineAddEntries" || !instruction.entries) {
      continue;
    }

    for (const entry of instruction.entries) {
      // Handle TimelineTimelineItem with TimelineUser (People search results)
      if (
        entry.content.entryType === "TimelineTimelineItem" &&
        entry.content.itemContent?.itemType === "TimelineUser"
      ) {
        const userResult = entry.content.itemContent?.user_results?.result;
        if (userResult && !seenIds.has(userResult.rest_id)) {
          const profile = transformUserToProfile(userResult);
          if (profile) {
            seenIds.add(userResult.rest_id);
            profiles.push(profile);
          }
        }
        continue;
      }

      // Handle TimelineTimelineModule (contains user results in items array - for "Top" search)
      if (
        entry.content.entryType === "TimelineTimelineModule" &&
        entry.content.items
      ) {
        for (const item of entry.content.items) {
          const userResult = item.item?.itemContent?.user_results?.result;
          if (userResult && !seenIds.has(userResult.rest_id)) {
            const profile = transformUserToProfile(userResult);
            if (profile) {
              seenIds.add(userResult.rest_id);
              profiles.push(profile);
            }
          }
        }
        continue;
      }

      // Handle TimelineTimelineItem with tweet_results (extract user from tweet - for "Top" search)
      if (entry.content.entryType === "TimelineTimelineItem") {
        const tweetResult = entry.content.itemContent?.tweet_results?.result;

        // Handle TweetWithVisibilityResults wrapper
        const actualTweet = (tweetResult as any)?.tweet || tweetResult;

        if (actualTweet?.core?.user_results?.result) {
          const tweetUserResult = actualTweet.core.user_results.result;
          if (!seenIds.has(tweetUserResult.rest_id)) {
            const profile = transformUserToProfile(tweetUserResult);
            if (profile) {
              seenIds.add(tweetUserResult.rest_id);
              profiles.push(profile);
            }
          }
        }
      }
    }
  }

  return profiles;
}

function transformUserToProfile(
  user: TwitterUserResult
): TwitterProfile | null {
  const legacy = user.legacy;
  const core = user.core;

  // Get name and screen_name from core (new structure) or legacy (fallback)
  const name = core?.name || legacy?.name;
  const screenName = core?.screen_name || legacy?.screen_name;
  const createdAt = core?.created_at || legacy?.created_at;

  // Validate required fields exist
  if (!screenName || !name) {
    return null;
  }

  // Get professional category if available
  let category: string | undefined;
  let professionalType: string | undefined;
  if (user.professional) {
    professionalType = user.professional.professional_type;
    if (user.professional.category && user.professional.category.length > 0) {
      category = user.professional.category[0].name;
    }
  }

  // Handle profile image - prefer avatar.image_url (new structure), fallback to legacy
  let profileImageUrl = "";
  if (user.avatar?.image_url) {
    // avatar.image_url already has _normal, replace with larger size
    profileImageUrl = user.avatar.image_url.replace("_normal", "_400x400");
  } else if (legacy?.profile_image_url_https) {
    profileImageUrl = legacy.profile_image_url_https.replace(
      "_normal",
      "_400x400"
    );
  }

  return {
    id: user.rest_id,
    twitterId: user.rest_id,
    username: screenName,
    name: name,
    bio: legacy?.description || "",
    profileImageUrl,
    followersCount: legacy?.followers_count || 0,
    followingCount: legacy?.friends_count || 0,
    verified: user.is_blue_verified || legacy?.verified || false,
    location: legacy?.location || undefined,
    createdAt,
    bannerUrl: legacy?.profile_banner_url,
    statusesCount: legacy?.statuses_count,
    listedCount: legacy?.listed_count,
    professionalType,
    category,
  };
}

// Format follower count for display
export function formatFollowerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

// Convert TwitterProfile to Supabase cache format
export function profileToSupabaseFormat(profile: TwitterProfile) {
  return {
    twitter_id: profile.twitterId,
    username: profile.username.toLowerCase(),
    name: profile.name,
    bio: profile.bio,
    profile_image_url: profile.profileImageUrl,
    followers_count: profile.followersCount,
    following_count: profile.followingCount,
    verified: profile.verified,
  };
}
