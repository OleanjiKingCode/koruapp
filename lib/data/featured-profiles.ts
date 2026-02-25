// Curated list of featured profiles for the discover page
// These are real accounts that will be shown by default

export interface FeaturedProfile {
  username: string;
  name: string;
  bio: string;
  profileImageUrl: string;
  followersCount: number;
  followingCount: number;
  verified: boolean;
  tags: string[];
  category: string;
}

export const FEATURED_PROFILES: FeaturedProfile[] = [
  // Web3 / Crypto
  {
    username: "VitalikButerin",
    name: "Vitalik Buterin",
    bio: "Ethereum co-founder. Building decentralized systems.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/977496875887558661/L86xyLF4_400x400.jpg",
    followersCount: 5200000,
    followingCount: 300,
    verified: true,
    tags: ["Web3", "Ethereum", "Crypto"],
    category: "Web3",
  },
  {
    username: "caboreal",
    name: "Caboreal",
    bio: "Building the future of gaming & web3",
    profileImageUrl: "https://pbs.twimg.com/profile_images/1625956606165626880/8Qk7p2xE_400x400.jpg",
    followersCount: 89000,
    followingCount: 1200,
    verified: true,
    tags: ["Web3", "Gaming", "Founder"],
    category: "Web3",
  },
  {
    username: "balaborista",
    name: "Balaji Srinivasan",
    bio: "Former CTO of Coinbase. Author of The Network State.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/1654217632741416960/iV2P2VuA_400x400.jpg",
    followersCount: 1100000,
    followingCount: 1500,
    verified: true,
    tags: ["Web3", "Tech", "Founder"],
    category: "Web3",
  },
  {
    username: "cdixon",
    name: "Chris Dixon",
    bio: "Partner at a16z crypto. Investing in web3.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/121058011/Photo_24_400x400.jpg",
    followersCount: 980000,
    followingCount: 1200,
    verified: true,
    tags: ["Web3", "VC", "Investor"],
    category: "Web3",
  },
  {
    username: "punk6529",
    name: "6529",
    bio: "NFTs, memes, and the open metaverse.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/1440427524626812930/g3p_cGwJ_400x400.jpg",
    followersCount: 580000,
    followingCount: 890,
    verified: false,
    tags: ["Web3", "NFTs", "Art"],
    category: "Web3",
  },

  // Tech / Founders
  {
    username: "elonmusk",
    name: "Elon Musk",
    bio: "CEO of Tesla, SpaceX, X. Building the future.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/1815749056821346304/jS8I28PL_400x400.jpg",
    followersCount: 195000000,
    followingCount: 750,
    verified: true,
    tags: ["Tech", "AI", "Space"],
    category: "Tech",
  },
  {
    username: "sama",
    name: "Sam Altman",
    bio: "CEO of OpenAI. Building safe AGI.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/804990434455887872/BG0Xh7Oa_400x400.jpg",
    followersCount: 3200000,
    followingCount: 1200,
    verified: true,
    tags: ["Tech", "AI", "Founder"],
    category: "Tech",
  },
  {
    username: "naval",
    name: "Naval Ravikant",
    bio: "AngelList founder. Investor in 200+ companies.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/1256841238298292232/ycqwaMI2_400x400.jpg",
    followersCount: 2100000,
    followingCount: 500,
    verified: true,
    tags: ["Tech", "Founder", "Angel"],
    category: "Business",
  },
  {
    username: "paulg",
    name: "Paul Graham",
    bio: "Co-founder of Y Combinator. Essays at paulgraham.com",
    profileImageUrl: "https://pbs.twimg.com/profile_images/1824002576/pg-railsconf_400x400.jpg",
    followersCount: 1600000,
    followingCount: 500,
    verified: true,
    tags: ["Tech", "Startups", "YC"],
    category: "Tech",
  },
  {
    username: "pmarca",
    name: "Marc Andreessen",
    bio: "a16z co-founder. Building things that matter.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/1535420431766671360/Pwq-1eJc_400x400.jpg",
    followersCount: 1400000,
    followingCount: 2300,
    verified: true,
    tags: ["VC", "Tech", "Founder"],
    category: "Business",
  },

  // VCs / Investors
  {
    username: "chaikitkheong",
    name: "Chai Kit Kheong",
    bio: "Partner at Sequoia Capital. Investing in the future.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/1543291932000395264/ONSG4S3M_400x400.jpg",
    followersCount: 45000,
    followingCount: 890,
    verified: true,
    tags: ["VC", "Investor", "Tech"],
    category: "Business",
  },
  {
    username: "fredwilson",
    name: "Fred Wilson",
    bio: "VC at Union Square Ventures. AVC.com blogger.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/1108429662/fred_photo_400x400.jpg",
    followersCount: 680000,
    followingCount: 1800,
    verified: true,
    tags: ["VC", "Investor", "Tech"],
    category: "Business",
  },

  // Web3 Nigeria / Africa
  {
    username: "oyaboreal",
    name: "Oya",
    bio: "Building web3 in Africa. Community first.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/1570037891421143041/WPVqPuDU_400x400.jpg",
    followersCount: 35000,
    followingCount: 1200,
    verified: false,
    tags: ["Web3", "Africa", "Community"],
    category: "Web3",
  },
  {
    username: "iaboreal",
    name: "IA",
    bio: "Nigerian tech & web3 builder.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/1681261134877818880/V7wVGfSt_400x400.jpg",
    followersCount: 28000,
    followingCount: 900,
    verified: false,
    tags: ["Web3", "Nigeria", "Tech"],
    category: "Web3",
  },
  
  // Developers
  {
    username: "levelsio",
    name: "Pieter Levels",
    bio: "Building $2.7M+ revenue products. Nomad.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/1589756412078555136/YlXXbpjL_400x400.jpg",
    followersCount: 520000,
    followingCount: 1500,
    verified: true,
    tags: ["Dev", "Indie Hacker", "Founder"],
    category: "Tech",
  },
  {
    username: "t3dotgg",
    name: "Theo",
    bio: "CEO @Ping. Building things on the internet.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/1605762947686375425/lsoGWWty_400x400.jpg",
    followersCount: 290000,
    followingCount: 1800,
    verified: true,
    tags: ["Dev", "TypeScript", "Creator"],
    category: "Tech",
  },
  {
    username: "dan_abramov",
    name: "Dan Abramov",
    bio: "Working on React at Meta.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/1336281436685541376/fRSl8uJP_400x400.jpg",
    followersCount: 780000,
    followingCount: 1200,
    verified: true,
    tags: ["Dev", "React", "JavaScript"],
    category: "Tech",
  },

  // Sports
  {
    username: "Cristiano",
    name: "Cristiano Ronaldo",
    bio: "Professional footballer. Al-Nassr FC.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/1594446880498401282/o4L2z8Ay_400x400.jpg",
    followersCount: 112000000,
    followingCount: 560,
    verified: true,
    tags: ["Sports", "Football", "Athlete"],
    category: "Sports",
  },
  {
    username: "KingJames",
    name: "LeBron James",
    bio: "4x NBA Champion. Los Angeles Lakers.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/1421530540063092736/LV0HYXN3_400x400.jpg",
    followersCount: 53000000,
    followingCount: 250,
    verified: true,
    tags: ["Sports", "Basketball", "Athlete"],
    category: "Sports",
  },
  {
    username: "seaboreal",
    name: "SEA",
    bio: "Sports tech & analytics enthusiast.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/1544692481270505472/1FQ7k-hs_400x400.jpg",
    followersCount: 12000,
    followingCount: 500,
    verified: false,
    tags: ["Sports", "Analytics", "Tech"],
    category: "Sports",
  },

  // Finance / Business
  {
    username: "chaaboreal",
    name: "Chaa",
    bio: "Finance & investment insights. Building wealth.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/1509876137762041858/4lHQZKqo_400x400.jpg",
    followersCount: 45000,
    followingCount: 890,
    verified: false,
    tags: ["Finance", "Investment", "Business"],
    category: "Business",
  },

  // Healthcare / Green Life
  {
    username: "DrEricTopol",
    name: "Eric Topol",
    bio: "Cardiologist, scientist. Scripps Research.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/964132274216202241/bm7MrI-y_400x400.jpg",
    followersCount: 780000,
    followingCount: 2100,
    verified: true,
    tags: ["Healthcare", "Science", "Medicine"],
    category: "Healthcare",
  },
  {
    username: "healthboreal",
    name: "Health First",
    bio: "Wellness & healthy living advocate.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/1576537899867975680/r6bH96nB_400x400.jpg",
    followersCount: 25000,
    followingCount: 600,
    verified: false,
    tags: ["Healthcare", "Wellness", "Lifestyle"],
    category: "Healthcare",
  },

  // Politics / Governance
  {
    username: "AOC",
    name: "Alexandria Ocasio-Cortez",
    bio: "US Representative for NY-14. Fighting for working families.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/923274881197895680/urSKB8Gi_400x400.jpg",
    followersCount: 13200000,
    followingCount: 3100,
    verified: true,
    tags: ["Politics", "Governance", "Policy"],
    category: "Politics",
  },

  // Memes / Entertainment
  {
    username: "coaboreal",
    name: "Coa",
    bio: "Meme lord. Making the internet fun.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/1600000000000000000/default_400x400.jpg",
    followersCount: 150000,
    followingCount: 800,
    verified: false,
    tags: ["Memes", "Entertainment", "Creator"],
    category: "Entertainment",
  },
  {
    username: "daboreal",
    name: "Da",
    bio: "Content creator. Vibes only.",
    profileImageUrl: "https://pbs.twimg.com/profile_images/1600000000000000001/default_400x400.jpg",
    followersCount: 85000,
    followingCount: 500,
    verified: false,
    tags: ["Entertainment", "Creator", "Lifestyle"],
    category: "Entertainment",
  },
];

// Get all unique tags from featured profiles
export const ALL_TAGS = [...new Set(FEATURED_PROFILES.flatMap((p) => p.tags))];

// Get all unique categories
export const ALL_CATEGORIES = [...new Set(FEATURED_PROFILES.map((p) => p.category))];

// Helper to filter profiles by category
export function getProfilesByCategory(category: string): FeaturedProfile[] {
  if (category === "All") return FEATURED_PROFILES;
  return FEATURED_PROFILES.filter((p) => p.category === category);
}

// Helper to filter profiles by tag
export function getProfilesByTag(tag: string): FeaturedProfile[] {
  return FEATURED_PROFILES.filter((p) => p.tags.includes(tag));
}

// Helper to search profiles
export function searchFeaturedProfiles(query: string): FeaturedProfile[] {
  const lowerQuery = query.toLowerCase();
  return FEATURED_PROFILES.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.username.toLowerCase().includes(lowerQuery) ||
      p.bio.toLowerCase().includes(lowerQuery) ||
      p.tags.some((t) => t.toLowerCase().includes(lowerQuery))
  );
}




