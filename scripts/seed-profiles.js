#!/usr/bin/env node

/**
 * Seed Featured Profiles Script
 *
 * Run with: node scripts/seed-profiles.js
 *
 * Uses the same API as the discover search route (twitter241.p.rapidapi.com)
 * Fetches profiles one by one with delays to avoid rate limiting.
 */

const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: ".env" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// Same API host as discover search route
const RAPIDAPI_HOST = "twitter241.p.rapidapi.com";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing Supabase credentials in .env");
  console.error(
    "   Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
  process.exit(1);
}

if (!RAPIDAPI_KEY) {
  console.error("❌ Missing RAPIDAPI_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Curated list of ~100 REAL Twitter usernames
const FEATURED_USERNAMES = [
  // ============================================
  // WEB3 / CRYPTO GLOBAL LEADERS
  // ============================================
  {
    username: "VitalikButerin",
    category: "Web3",
    tags: ["Ethereum", "Crypto", "Founder"],
  },
  {
    username: "cz_binance",
    category: "Web3",
    tags: ["Binance", "Exchange", "Crypto"],
  },
  {
    username: "brian_armstrong",
    category: "Web3",
    tags: ["Coinbase", "Crypto", "Founder"],
  },
  { username: "balajis", category: "Web3", tags: ["Tech", "Crypto", "Author"] },
  { username: "punk6529", category: "Web3", tags: ["NFT", "Art", "Collector"] },
  { username: "cdixon", category: "Web3", tags: ["a16z", "VC", "Web3"] },
  {
    username: "sassal0x",
    category: "Web3",
    tags: ["Ethereum", "DeFi", "Research"],
  },
  {
    username: "coaboroie",
    category: "Web3",
    tags: ["DeFi", "Curve", "Founder"],
  },
  {
    username: "rleshner",
    category: "Web3",
    tags: ["Compound", "DeFi", "Founder"],
  },
  {
    username: "haaboroydeaborons",
    category: "Web3",
    tags: ["Optimism", "L2", "Founder"],
  },
  {
    username: "jessepollak",
    category: "Web3",
    tags: ["Base", "Coinbase", "L2"],
  },

  // ============================================
  // NIGERIAN CRYPTO / WEB3
  // ============================================
  {
    username: "Web3Bridge",
    category: "Web3",
    tags: ["Nigeria", "Education", "Blockchain"],
  },
  {
    username: "web3lagos",
    category: "Web3",
    tags: ["Nigeria", "Community", "Web3"],
  },
  {
    username: "BundleAfrica",
    category: "Web3",
    tags: ["Nigeria", "Crypto", "Exchange"],
  },
  {
    username: "qaborounaboroesociabor",
    category: "Web3",
    tags: ["Nigeria", "Crypto", "Exchange"],
  },
  {
    username: "paxaboroful",
    category: "Web3",
    tags: ["Africa", "Crypto", "Exchange"],
  },

  // ============================================
  // TECH FOUNDERS & LEADERS
  // ============================================
  { username: "elonmusk", category: "Tech", tags: ["Tesla", "SpaceX", "X"] },
  { username: "sama", category: "Tech", tags: ["OpenAI", "AI", "Founder"] },
  {
    username: "naval",
    category: "Business",
    tags: ["AngelList", "Investor", "Philosophy"],
  },
  { username: "paulg", category: "Tech", tags: ["YC", "Startups", "Essays"] },
  {
    username: "levelsio",
    category: "Tech",
    tags: ["Indie Hacker", "Nomad", "Builder"],
  },
  { username: "dhh", category: "Tech", tags: ["Rails", "Basecamp", "Founder"] },
  {
    username: "t3dotgg",
    category: "Tech",
    tags: ["TypeScript", "YouTube", "Dev"],
  },
  { username: "dan_abramov", category: "Tech", tags: ["React", "Meta", "Dev"] },
  {
    username: "raaboromit",
    category: "Tech",
    tags: ["Design", "Product", "Twitter"],
  },
  {
    username: "GergelyOrosz",
    category: "Tech",
    tags: ["Engineering", "Newsletter", "Author"],
  },
  { username: "swyx", category: "Tech", tags: ["Dev", "AI", "Writer"] },

  // ============================================
  // NIGERIAN / AFRICAN TECH FOUNDERS
  // ============================================
  {
    username: "JasonNjoku",
    category: "Business",
    tags: ["iROKOtv", "Nigeria", "Founder"],
  },
  {
    username: "theaboroshola",
    category: "Business",
    tags: ["Paystack", "Nigeria", "Founder"],
  },
  {
    username: "iaboroyolaaborode",
    category: "Business",
    tags: ["Andela", "Nigeria", "Tech"],
  },
  {
    username: "OlusogunAganga",
    category: "Business",
    tags: ["Nigeria", "Finance", "Minister"],
  },
  {
    username: "Aborodonaboroele",
    category: "Business",
    tags: ["Nigeria", "Finance", "Investor"],
  },
  {
    username: "markessien",
    category: "Tech",
    tags: ["HotelsNG", "Nigeria", "Founder"],
  },
  {
    username: "TechpointAfrica",
    category: "Tech",
    tags: ["Nigeria", "Tech", "Media"],
  },

  // ============================================
  // GLOBAL SPORTS STARS
  // ============================================
  {
    username: "Cristiano",
    category: "Sports",
    tags: ["Football", "Portugal", "Icon"],
  },
  {
    username: "KingJames",
    category: "Sports",
    tags: ["Basketball", "NBA", "Lakers"],
  },
  {
    username: "KMbappe",
    category: "Sports",
    tags: ["Football", "France", "PSG"],
  },
  {
    username: "StephenCurry30",
    category: "Sports",
    tags: ["Basketball", "NBA", "Warriors"],
  },
  {
    username: "SerenaWilliams",
    category: "Sports",
    tags: ["Tennis", "Champion", "Icon"],
  },
  {
    username: "usainbolt",
    category: "Sports",
    tags: ["Athletics", "Jamaica", "Legend"],
  },

  // ============================================
  // NIGERIAN SPORTS
  // ============================================
  {
    username: "victorosimhen9",
    category: "Sports",
    tags: ["Football", "Nigeria", "Napoli"],
  },
  {
    username: "NGSuperEagles",
    category: "Sports",
    tags: ["Football", "Nigeria", "National"],
  },
  {
    username: "AsisatOshoala",
    category: "Sports",
    tags: ["Football", "Nigeria", "Women"],
  },
  {
    username: "alexiwobi",
    category: "Sports",
    tags: ["Football", "Nigeria", "Fulham"],
  },
  {
    username: "ndaboroidiaborowilfred",
    category: "Sports",
    tags: ["Football", "Nigeria", "Leicester"],
  },
  {
    username: "67Kelechi",
    category: "Sports",
    tags: ["Football", "Nigeria", "Sevilla"],
  },
  {
    username: "chabraboroisochukwu",
    category: "Sports",
    tags: ["Football", "Nigeria", "Chelsea"],
  },
  {
    username: "AdemLookman",
    category: "Sports",
    tags: ["Football", "Nigeria", "Atalanta"],
  },

  // ============================================
  // AFRICAN SPORTS
  // ============================================
  {
    username: "MoSalah",
    category: "Sports",
    tags: ["Football", "Egypt", "Liverpool"],
  },
  {
    username: "Aborouba",
    category: "Sports",
    tags: ["Football", "Gabon", "Striker"],
  },
  {
    username: "daboroidrogba",
    category: "Sports",
    tags: ["Football", "Ivory Coast", "Legend"],
  },
  {
    username: "setoo9",
    category: "Sports",
    tags: ["Football", "Cameroon", "Legend"],
  },
  {
    username: "AnthonyJoshua",
    category: "Sports",
    tags: ["Boxing", "Nigeria", "Champion"],
  },
  {
    username: "Aboroujo",
    category: "Sports",
    tags: ["Football", "Morocco", "Bayern"],
  },

  // ============================================
  // NIGERIAN COMEDIANS & ENTERTAINERS
  // ============================================
  {
    username: "mrmacaronii",
    category: "Entertainment",
    tags: ["Comedy", "Nigeria", "Creator"],
  },
  {
    username: "Brodashaggi",
    category: "Entertainment",
    tags: ["Comedy", "Nigeria", "Actor"],
  },
  {
    username: "OfficialBovi",
    category: "Entertainment",
    tags: ["Comedy", "Nigeria", "Standup"],
  },
  {
    username: "Maryam_Apaokagi",
    category: "Entertainment",
    tags: ["Comedy", "Nigeria", "Skit"],
  },
  {
    username: "mrfunny1_",
    category: "Entertainment",
    tags: ["Comedy", "Nigeria", "Sabinus"],
  },
  {
    username: "Aboroasketmouth",
    category: "Entertainment",
    tags: ["Comedy", "Nigeria", "Standup"],
  },
  {
    username: "Lasisi_elenu",
    category: "Entertainment",
    tags: ["Comedy", "Nigeria", "Reporter"],
  },

  // ============================================
  // NIGERIAN MUSIC (AFROBEATS)
  // ============================================
  {
    username: "wizkidayo",
    category: "Entertainment",
    tags: ["Music", "Nigeria", "Afrobeats"],
  },
  {
    username: "davido",
    category: "Entertainment",
    tags: ["Music", "Nigeria", "Afrobeats"],
  },
  {
    username: "burnaboy",
    category: "Entertainment",
    tags: ["Music", "Nigeria", "Afrobeats"],
  },
  {
    username: "heisrema",
    category: "Entertainment",
    tags: ["Music", "Nigeria", "Afrobeats"],
  },
  {
    username: "asaborokemusic",
    category: "Entertainment",
    tags: ["Music", "Nigeria", "Afrobeats"],
  },
  {
    username: "ayaborora_starboy",
    category: "Entertainment",
    tags: ["Music", "Nigeria", "Afrobeats"],
  },
  {
    username: "TiwaSavage",
    category: "Entertainment",
    tags: ["Music", "Nigeria", "Afrobeats"],
  },
  {
    username: "Olamide",
    category: "Entertainment",
    tags: ["Music", "Nigeria", "Hip Hop"],
  },
  {
    username: "firaboroeboydml",
    category: "Entertainment",
    tags: ["Music", "Nigeria", "Amapiano"],
  },
  {
    username: "caboroKAYyesi",
    category: "Entertainment",
    tags: ["Music", "Nigeria", "Afrobeats"],
  },

  // ============================================
  // GLOBAL ENTERTAINMENT & CREATORS
  // ============================================
  {
    username: "MrBeast",
    category: "Entertainment",
    tags: ["YouTube", "Creator", "Philanthropy"],
  },
  {
    username: "MKBHD",
    category: "Tech",
    tags: ["Tech Reviews", "YouTube", "Creator"],
  },
  {
    username: "Ninja",
    category: "Entertainment",
    tags: ["Gaming", "Streamer", "Creator"],
  },
  {
    username: "KSI",
    category: "Entertainment",
    tags: ["Boxing", "YouTube", "Music"],
  },
  {
    username: "LoganPaul",
    category: "Entertainment",
    tags: ["Boxing", "WWE", "Creator"],
  },

  // ============================================
  // ORGANIZATIONS & COMPANIES
  // ============================================
  { username: "OpenAI", category: "AI", tags: ["AI", "ChatGPT", "Research"] },
  { username: "AnthropicAI", category: "AI", tags: ["AI", "Claude", "Safety"] },
  {
    username: "ethereum",
    category: "Web3",
    tags: ["Blockchain", "Crypto", "Protocol"],
  },
  {
    username: "solana",
    category: "Web3",
    tags: ["Blockchain", "Crypto", "Fast"],
  },
  { username: "Uniswap", category: "Web3", tags: ["DeFi", "DEX", "Protocol"] },
  {
    username: "vercel",
    category: "Tech",
    tags: ["Hosting", "Next.js", "Platform"],
  },
  {
    username: "figma",
    category: "Design",
    tags: ["Design", "Tool", "Platform"],
  },
  {
    username: "NASA",
    category: "Science",
    tags: ["Space", "Exploration", "Research"],
  },
  {
    username: "stripe",
    category: "Tech",
    tags: ["Payments", "Fintech", "Platform"],
  },
  { username: "linear", category: "Tech", tags: ["Product", "SaaS", "Design"] },
  {
    username: "theaboroflaboroutterwave",
    category: "Tech",
    tags: ["Nigeria", "Fintech", "Payments"],
  },
  {
    username: "payaborostackHQ",
    category: "Tech",
    tags: ["Nigeria", "Fintech", "Payments"],
  },

  // ============================================
  // BUSINESS & FINANCE
  // ============================================
  {
    username: "mcuban",
    category: "Business",
    tags: ["Investor", "Mavs", "Shark Tank"],
  },
  {
    username: "garyvee",
    category: "Business",
    tags: ["Marketing", "Creator", "Investor"],
  },
  {
    username: "CathieDWood",
    category: "Finance",
    tags: ["ARK", "Investing", "Tech"],
  },
  {
    username: "RayDalio",
    category: "Finance",
    tags: ["Bridgewater", "Investing", "Author"],
  },
  {
    username: "chamath",
    category: "Finance",
    tags: ["All-In", "Investor", "Tech"],
  },
  {
    username: "TonyElumelu",
    category: "Business",
    tags: ["Nigeria", "Investor", "Banking"],
  },

  // ============================================
  // NEWS & MEDIA
  // ============================================
  { username: "CNN", category: "News", tags: ["News", "Media", "Journalism"] },
  {
    username: "BBCWorld",
    category: "News",
    tags: ["News", "Media", "Journalism"],
  },
  {
    username: "Reuters",
    category: "News",
    tags: ["News", "Media", "Journalism"],
  },
  {
    username: "TechCabal",
    category: "News",
    tags: ["Africa", "Tech", "Media"],
  },
  {
    username: "AFRICAaboronews",
    category: "News",
    tags: ["Africa", "News", "Media"],
  },
  {
    username: "Aboroenjaminabor",
    category: "News",
    tags: ["Africa", "Tech", "Influencer"],
  },

  // ============================================
  // POLITICS & LEADERS
  // ============================================
  {
    username: "POTUS",
    category: "Politics",
    tags: ["USA", "Government", "President"],
  },
  {
    username: "BarackObama",
    category: "Politics",
    tags: ["USA", "Former President", "Author"],
  },
  {
    username: "PeterObi",
    category: "Politics",
    tags: ["Nigeria", "Politics", "Leader"],
  },
  {
    username: "officialABAT",
    category: "Politics",
    tags: ["Nigeria", "President", "Government"],
  },
  {
    username: "NGRPresident",
    category: "Politics",
    tags: ["Nigeria", "Government", "Official"],
  },
];

// Delay helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Parse user from API response (same logic as lib/types/twitter.ts)
function parseUserFromResponse(data, targetUsername) {
  const timeline = data?.result?.timeline;
  if (!timeline?.instructions) return null;

  for (const instruction of timeline.instructions) {
    const entries = instruction.entries || [];

    for (const entry of entries) {
      // Handle TimelineUser entries (People search)
      if (entry.content?.itemContent?.itemType === "TimelineUser") {
        const userResult = entry.content.itemContent.user_results?.result;
        if (userResult) {
          const screenName =
            userResult.core?.screen_name ||
            userResult.legacy?.screen_name ||
            "";
          if (screenName.toLowerCase() === targetUsername.toLowerCase()) {
            return userResult;
          }
        }
      }

      // Handle module items
      if (entry.content?.items) {
        for (const item of entry.content.items) {
          const userResult = item.item?.itemContent?.user_results?.result;
          if (userResult) {
            const screenName =
              userResult.core?.screen_name ||
              userResult.legacy?.screen_name ||
              "";
            if (screenName.toLowerCase() === targetUsername.toLowerCase()) {
              return userResult;
            }
          }
        }
      }
    }
  }

  return null;
}

// Fetch a single profile from Twitter API (using same API as discover route)
async function fetchTwitterProfile(username) {
  const url =
    `https://${RAPIDAPI_HOST}/search?` +
    new URLSearchParams({
      type: "People",
      count: "20",
      query: username,
    });

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
    },
  });

  if (!response.ok) {
    const status = response.status;
    if (status === 429) throw new Error("Rate limited (429)");
    if (status === 403) throw new Error("Forbidden (403) - check API key");
    throw new Error(`API error ${status}`);
  }

  const data = await response.json();
  const userResult = parseUserFromResponse(data, username);

  if (!userResult) {
    throw new Error("User not found in results");
  }

  return userResult;
}

// Transform API user result to profile data
function transformToProfileData(userResult, category, tags, order) {
  const legacy = userResult.legacy || {};
  const core = userResult.core || {};
  const avatar = userResult.avatar || {};

  // Get profile image - prioritize avatar.image_url, then legacy
  let profileImageUrl =
    avatar.image_url || legacy.profile_image_url_https || "";
  if (profileImageUrl) {
    profileImageUrl = profileImageUrl.replace("_normal", "_400x400");
  }

  return {
    twitter_id: userResult.rest_id || userResult.id || "",
    username: core.screen_name || legacy.screen_name || "",
    name: core.name || legacy.name || "",
    bio: legacy.description || null,
    profile_image_url: profileImageUrl,
    banner_url: legacy.profile_banner_url || null,
    followers_count: legacy.followers_count || 0,
    following_count: legacy.friends_count || 0,
    verified: legacy.verified || userResult.is_blue_verified || false,
    location: legacy.location || null,
    category: category,
    tags: tags,
    display_order: order,
    is_active: true,
    updated_at: new Date().toISOString(),
  };
}

// Save profile to Supabase featured_profiles table
async function saveToSupabase(profileData) {
  const { error } = await supabase
    .from("featured_profiles")
    .upsert(profileData, { onConflict: "twitter_id" });

  if (error) {
    throw new Error(`DB error: ${error.message}`);
  }
}

// Main function
async function main() {
  console.log("🚀 Starting Featured Profile Seeder");
  console.log(`📊 Total profiles to fetch: ${FEATURED_USERNAMES.length}`);
  console.log(`🔗 Using API: ${RAPIDAPI_HOST}`);
  console.log("⏱️  Delay between requests: 5 seconds\n");

  const results = {
    success: [],
    failed: [],
  };

  for (let i = 0; i < FEATURED_USERNAMES.length; i++) {
    const { username, category, tags } = FEATURED_USERNAMES[i];
    const progress = `[${i + 1}/${FEATURED_USERNAMES.length}]`;

    console.log(`${progress} Fetching @${username}...`);

    try {
      const userResult = await fetchTwitterProfile(username);
      const profileData = transformToProfileData(userResult, category, tags, i);

      await saveToSupabase(profileData);

      console.log(
        `   ✅ ${profileData.name} (@${
          profileData.username
        }) - ${profileData.followers_count.toLocaleString()} followers`
      );
      results.success.push(username);
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      results.failed.push({ username, error: error.message });

      // If rate limited, wait longer
      if (error.message.includes("429")) {
        console.log("   ⏳ Rate limited! Waiting 60 seconds...");
        await delay(60000);
      }
    }

    // Wait 5 seconds between requests
    if (i < FEATURED_USERNAMES.length - 1) {
      process.stdout.write("   ⏳ Waiting 5s...");
      await delay(5000);
      process.stdout.write(" Done!\n");
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📈 SEEDING COMPLETE");
  console.log("=".repeat(50));
  console.log(`✅ Success: ${results.success.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log("\nFailed profiles:");
    results.failed.forEach(({ username, error }) => {
      console.log(`   - @${username}: ${error}`);
    });
  }

  console.log("\n🎉 Done! Check your Supabase featured_profiles table.");
}

// Run the script
main().catch(console.error);
