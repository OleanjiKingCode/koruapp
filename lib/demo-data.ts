// ============================================================================
// Demo data for the social-media preview branch.
// Used by API routes to make the app look populated for marketing screenshots.
// Not for production — only lives on feat/social-stats-dummy.
// ============================================================================

type DemoPerson = {
  id: string;
  username: string;
  name: string;
  profile_image_url: string;
  bio: string;
  followers_count: number;
  following_count: number;
  verified: boolean;
  location: string;
  category: string;
  tags: string[];
};

// Stable seeded avatars from a public service so screenshots look consistent.
function avatar(seed: string): string {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=c385ee,dab079,9deb61,b6e3f4,d1d4f9&radius=50`;
}

function banner(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/400`;
}

export const DEMO_PEOPLE: DemoPerson[] = [
  {
    id: "demo-user-001",
    username: "ayodeji.lens",
    name: "Ayodeji Okafor",
    profile_image_url: avatar("ayodeji"),
    bio: "Product designer building tools for creators · ex-Meta · open to mentorship calls",
    followers_count: 48230,
    following_count: 612,
    verified: true,
    location: "Lagos, Nigeria",
    category: "Design",
    tags: ["Design", "Creator", "Mentor"],
  },
  {
    id: "demo-user-002",
    username: "ngozi_codes",
    name: "Ngozi Adeyemi",
    profile_image_url: avatar("ngozi"),
    bio: "Smart contract engineer · Solidity / Rust · I host paid 1:1s for protocol audits",
    followers_count: 22140,
    following_count: 489,
    verified: true,
    location: "Berlin, Germany",
    category: "Engineering",
    tags: ["Web3", "Solidity", "Engineering"],
  },
  {
    id: "demo-user-003",
    username: "tunde.builds",
    name: "Tunde Bakare",
    profile_image_url: avatar("tunde"),
    bio: "Founder of three. Two failed, one exited. Talk to me about go-to-market.",
    followers_count: 91005,
    following_count: 1320,
    verified: true,
    location: "Austin, TX",
    category: "Founders",
    tags: ["Founders", "GTM", "SaaS"],
  },
  {
    id: "demo-user-004",
    username: "amaka.writes",
    name: "Amaka Chen",
    profile_image_url: avatar("amaka"),
    bio: "Newsletter at 32k. I help people land their first ghostwriting clients.",
    followers_count: 32480,
    following_count: 290,
    verified: false,
    location: "Toronto, Canada",
    category: "Writing",
    tags: ["Writing", "Creator", "Newsletter"],
  },
  {
    id: "demo-user-005",
    username: "kelechi.eth",
    name: "Kelechi Nwosu",
    profile_image_url: avatar("kelechi"),
    bio: "Onchain researcher · DAO governance · pay for an hour and I'll review your tokenomics",
    followers_count: 17890,
    following_count: 412,
    verified: true,
    location: "Singapore",
    category: "Web3",
    tags: ["Web3", "DAO", "Research"],
  },
  {
    id: "demo-user-006",
    username: "yetunde.hr",
    name: "Yetunde Balogun",
    profile_image_url: avatar("yetunde"),
    bio: "Head of People at a Series B. Career coaching for senior IC → manager moves.",
    followers_count: 9820,
    following_count: 510,
    verified: false,
    location: "London, UK",
    category: "Career",
    tags: ["Career", "Coaching", "Leadership"],
  },
  {
    id: "demo-user-007",
    username: "chinedu.films",
    name: "Chinedu Eze",
    profile_image_url: avatar("chinedu"),
    bio: "Director / DP · Nollywood feature lead 2023 · book me for script feedback",
    followers_count: 67410,
    following_count: 188,
    verified: true,
    location: "Lagos, Nigeria",
    category: "Film",
    tags: ["Film", "Creator", "Director"],
  },
  {
    id: "demo-user-008",
    username: "femi.invests",
    name: "Femi Okonkwo",
    profile_image_url: avatar("femi"),
    bio: "Early-stage GP. Pre-seed checks $25-$250k. Pitch me anything except crypto.",
    followers_count: 124300,
    following_count: 902,
    verified: true,
    location: "San Francisco, CA",
    category: "Investing",
    tags: ["Investing", "VC", "Founders"],
  },
  {
    id: "demo-user-009",
    username: "bisi.designs",
    name: "Bisi Adekunle",
    profile_image_url: avatar("bisi"),
    bio: "Brand designer · worked with Notion, Linear, and 40+ early stage startups",
    followers_count: 41200,
    following_count: 366,
    verified: false,
    location: "Cape Town, SA",
    category: "Design",
    tags: ["Design", "Branding", "Freelance"],
  },
  {
    id: "demo-user-010",
    username: "ifeanyi.ml",
    name: "Ifeanyi Obi",
    profile_image_url: avatar("ifeanyi"),
    bio: "ML researcher · LLM eval · happy to do 30-min paper walk-throughs",
    followers_count: 14600,
    following_count: 720,
    verified: true,
    location: "Boston, MA",
    category: "AI",
    tags: ["AI", "ML", "Research"],
  },
  {
    id: "demo-user-011",
    username: "halima.health",
    name: "Halima Ibrahim",
    profile_image_url: avatar("halima"),
    bio: "Clinical psychologist · digital wellbeing · I take a few paid sessions monthly",
    followers_count: 28760,
    following_count: 198,
    verified: true,
    location: "Abuja, Nigeria",
    category: "Wellness",
    tags: ["Wellness", "Health", "Coaching"],
  },
  {
    id: "demo-user-012",
    username: "obi.markets",
    name: "Obi Nwankwo",
    profile_image_url: avatar("obi"),
    bio: "Quant @ a top hedge fund. I review macro theses for serious traders.",
    followers_count: 53890,
    following_count: 244,
    verified: true,
    location: "New York, NY",
    category: "Finance",
    tags: ["Finance", "Trading", "Markets"],
  },
];

export const DEMO_CATEGORIES = [
  "Design",
  "Engineering",
  "Founders",
  "Writing",
  "Web3",
  "Career",
  "Film",
  "Investing",
  "AI",
  "Wellness",
  "Finance",
  "Creator",
];

// ----------------------------------------------------------------------------
// Featured profiles — for /discover
// ----------------------------------------------------------------------------

export function getDemoFeaturedProfiles(opts: {
  page?: number;
  limit?: number;
  categories?: string[];
}) {
  const page = opts.page ?? 0;
  const limit = opts.limit ?? 50;
  let filtered = DEMO_PEOPLE.slice();
  if (opts.categories && opts.categories.length > 0) {
    filtered = filtered.filter((p) =>
      opts.categories!.every((c) => p.tags.includes(c)),
    );
  }
  const total = filtered.length;
  const start = page * limit;
  const slice = filtered.slice(start, start + limit);
  const profiles = slice.map((p, i) => ({
    id: p.id,
    twitter_id: `tid-${p.id}`,
    username: p.username,
    name: p.name,
    bio: p.bio,
    profile_image_url: p.profile_image_url,
    banner_url: banner(p.username),
    followers_count: p.followers_count,
    following_count: p.following_count,
    verified: p.verified,
    location: p.location,
    category: p.category,
    tags: p.tags,
    is_active: true,
    is_featured: true,
    display_order: start + i,
    rate: 25 + (i % 6) * 10,
    response_time_hours: 12 + ((i * 7) % 36),
    created_at: new Date(Date.now() - (i + 2) * 86_400_000).toISOString(),
    updated_at: new Date(Date.now() - (i + 1) * 3_600_000).toISOString(),
  }));
  return { profiles, total, hasMore: start + slice.length < total };
}

// ----------------------------------------------------------------------------
// Chats — for /chats and inbox badges (keyed to current user)
// ----------------------------------------------------------------------------

const CHAT_PREVIEWS = [
  "Hey! Just sent over the deck — would love your thoughts before our call tomorrow.",
  "Quick question on the schema — okay if I DM you the migration plan?",
  "Thanks again for the time today, you unblocked a week of work in 30 min.",
  "Following up on the audit notes — I pushed the diff, ready when you are.",
  "Loved your last post. Booking a slot to talk about the GTM angle.",
  "Are we still on for Thursday? Happy to push to next week if your sprint is heavy.",
  "Wrapping the v2 spec tonight. Want me to share the draft now or after review?",
  "Payment cleared, escrow is locked in. Looking forward to the session 🙌",
  "Sent the brief! No rush, end of week is great.",
  "I redid the section based on your feedback — way clearer now, thanks.",
  "Reminder: our 30-min call starts in 1 hour.",
  "Heads up: I might be 5 min late, jumping off another call.",
  "Notes from our chat are up on Notion, link in the next message.",
  "Already worth every cent. When can I book another?",
];

const SLOT_NAMES = [
  "30-min Strategy Call",
  "1h Design Review",
  "Codebase Walkthrough",
  "Pitch Deck Feedback",
  "Career Coaching",
  "Quick Question",
  "Audit Review",
  "Founder Office Hours",
];

export function getDemoUserChats(userId: string) {
  const now = Date.now();
  const people = DEMO_PEOPLE;
  return people.flatMap((person, i) => {
    // Each demo person gets one chat with the current user.
    // Half are inbox (creator = current user), half are sent (requester = current user).
    const isReceived = i % 2 === 0;
    const statusCycle = [
      "active",
      "pending",
      "active",
      "completed",
      "pending",
      "active",
    ];
    const status = i < 4 ? "active" : statusCycle[i % statusCycle.length];
    const amount = [25, 40, 60, 75, 100, 125, 150, 200][i % 8];
    const minutesAgo = (i + 1) * 17;
    const updatedAt = new Date(now - minutesAgo * 60_000).toISOString();
    const createdAt = new Date(now - (minutesAgo + 60) * 60_000).toISOString();
    const deadlineAt =
      status === "active"
        ? new Date(now + (12 + i * 3) * 3_600_000).toISOString()
        : status === "pending"
          ? new Date(now + (4 + i) * 3_600_000).toISOString()
          : null;

    return [
      {
        id: `demo-chat-${i + 1}`,
        requester_id: isReceived ? person.id : userId,
        creator_id: isReceived ? userId : person.id,
        status,
        amount,
        slot_name: SLOT_NAMES[i % SLOT_NAMES.length],
        slot_duration: [30, 45, 60][i % 3],
        deadline_at: deadlineAt,
        booked_date: null,
        booked_time: null,
        last_message: CHAT_PREVIEWS[i % CHAT_PREVIEWS.length],
        last_message_at: updatedAt,
        last_message_sender_id: i % 3 === 0 ? userId : person.id,
        unread_count_requester: i % 4 === 0 ? 2 : 0,
        unread_count_creator: i % 5 === 0 ? 1 : 0,
        created_at: createdAt,
        updated_at: updatedAt,
        requester: isReceived
          ? {
              id: person.id,
              name: person.name,
              username: person.username,
              profile_image_url: person.profile_image_url,
            }
          : {
              id: userId,
              name: "You",
              username: "you",
              profile_image_url: null,
            },
        creator: isReceived
          ? {
              id: userId,
              name: "You",
              username: "you",
              profile_image_url: null,
            }
          : {
              id: person.id,
              name: person.name,
              username: person.username,
              profile_image_url: person.profile_image_url,
            },
        otherParty: {
          id: person.id,
          name: person.name,
          username: person.username,
          profile_image_url: person.profile_image_url,
        },
      },
    ];
  });
}

// ----------------------------------------------------------------------------
// Summons — for /summons
// ----------------------------------------------------------------------------

const SUMMON_TARGETS = [
  {
    username: "elonmusk",
    name: "Elon Musk",
    image: avatar("elonmusk"),
    request:
      "Would love a 30-min AMA for first-time founders. We'll record and share.",
  },
  {
    username: "naval",
    name: "Naval",
    image: avatar("naval"),
    request: "An office-hours session for solopreneurs building in Africa.",
  },
  {
    username: "balajis",
    name: "Balaji Srinivasan",
    image: avatar("balajis"),
    request: "Talk through network-state ideas with our DAO cohort.",
  },
  {
    username: "shaa",
    name: "Sahil Lavingia",
    image: avatar("shaa"),
    request: "Indie hacker breakdown of pricing models — 45 min would be gold.",
  },
  {
    username: "patio11",
    name: "Patrick McKenzie",
    image: avatar("patio11"),
    request: "Pricing teardown for our infra startup. Will pay generously.",
  },
  {
    username: "dhh",
    name: "DHH",
    image: avatar("dhh"),
    request:
      "Opinions on monoliths vs services for a 6-person team. Real talk only.",
  },
  {
    username: "levelsio",
    name: "Pieter Levels",
    image: avatar("levelsio"),
    request:
      "Help us validate a remote-work tool — 30 min of brutal feedback please.",
  },
  {
    username: "swyx",
    name: "Shawn Wang",
    image: avatar("swyx"),
    request: "DX talk for our team — applied AI for product engineers.",
  },
  {
    username: "rauchg",
    name: "Guillermo Rauch",
    image: avatar("rauchg"),
    request: "Frontend perf review for a team scaling past 1M users.",
  },
  {
    username: "chamath",
    name: "Chamath Palihapitiya",
    image: avatar("chamath"),
    request: "Investor mindset for African pre-seed founders.",
  },
  {
    username: "morganhousel",
    name: "Morgan Housel",
    image: avatar("morganhousel"),
    request: "Q&A on personal finance habits for early-career people.",
  },
  {
    username: "tferriss",
    name: "Tim Ferriss",
    image: avatar("tferriss"),
    request: "30-min on productivity systems for founder-operators.",
  },
];

export function getDemoSummons() {
  const now = Date.now();
  return SUMMON_TARGETS.map((t, i) => {
    const backersCount = 8 + ((i * 7) % 42);
    const pledged = backersCount * (15 + (i % 5) * 5);
    const backers = Array.from(
      { length: Math.min(backersCount, 8) },
      (_, b) => {
        const person = DEMO_PEOPLE[(i + b) % DEMO_PEOPLE.length];
        return {
          id: person.id,
          name: person.name,
          username: person.username,
          profileImageUrl: person.profile_image_url,
          amount: 15 + ((b * 5) % 50),
          backedAt: new Date(now - (b + 1) * 3_600_000).toISOString(),
          reason: undefined as string | undefined,
        };
      },
    );
    const tags: Record<string, number> = {
      AMA: Math.floor(backersCount * 0.6),
      Mentorship: Math.floor(backersCount * 0.3),
      "Office hours": Math.floor(backersCount * 0.4),
    };
    const creator = DEMO_PEOPLE[i % DEMO_PEOPLE.length];
    return {
      id: `demo-summon-${i + 1}`,
      targetHandle: t.username,
      targetName: t.name,
      targetProfileImage: t.image,
      totalPledged: pledged,
      backers: backersCount,
      backersData: backers,
      category: "All",
      trend: "up" as const,
      trendValue: 12 + (i % 30),
      request: t.request,
      tags,
      createdAt: new Date(now - (i + 1) * 86_400_000).toISOString(),
      creatorUsername: creator.username,
      creatorName: creator.name,
      creatorProfileImage: creator.profile_image_url,
    };
  });
}

// Raw summons in the DB shape (used by /api/user/summons paths)
export function getDemoSummonsRaw(userId: string) {
  return SUMMON_TARGETS.map((t, i) => {
    const backersCount = 8 + ((i * 7) % 42);
    return {
      id: `demo-summon-${i + 1}`,
      creator_id: i % 3 === 0 ? userId : `demo-creator-${i}`,
      target_twitter_id: t.username,
      target_handle: t.username,
      target_username: t.username,
      target_name: t.name,
      target_image: t.image,
      target_profile_image: t.image,
      message: t.request,
      request: t.request,
      amount: 15 + (i % 5) * 5,
      pledged_amount: 15 + (i % 5) * 5,
      total_backed: backersCount * (15 + (i % 5) * 5),
      backers_count: backersCount,
      backers: [],
      tags: { AMA: 5, Mentorship: 3 },
      status: "active",
      created_at: new Date(Date.now() - (i + 1) * 86_400_000).toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    };
  });
}

// ----------------------------------------------------------------------------
// Notifications
// ----------------------------------------------------------------------------

export function getDemoNotifications() {
  const now = Date.now();
  const items = [
    {
      type: "request" as const,
      title: "New chat request",
      desc: "Ayodeji Okafor wants to book a 30-min Strategy Call",
      link: "/chats",
      person: DEMO_PEOPLE[0],
      minutesAgo: 3,
      read: false,
    },
    {
      type: "summon_backed" as const,
      title: "Your summon was backed",
      desc: "Femi Okonkwo backed your summon for @naval with $50",
      link: "/summons",
      person: DEMO_PEOPLE[7],
      minutesAgo: 22,
      read: false,
    },
    {
      type: "message" as const,
      title: "New message",
      desc: "Ngozi sent a message in Codebase Walkthrough",
      link: "/chats",
      person: DEMO_PEOPLE[1],
      minutesAgo: 51,
      read: false,
    },
    {
      type: "payment" as const,
      title: "Payment released",
      desc: "$75 released from escrow for your session with Tunde Bakare",
      link: "/profile",
      person: DEMO_PEOPLE[2],
      minutesAgo: 130,
      read: false,
    },
    {
      type: "completed" as const,
      title: "Session completed",
      desc: "Your call with Amaka Chen was marked complete. Leave a note?",
      link: "/chats",
      person: DEMO_PEOPLE[3],
      minutesAgo: 360,
      read: true,
    },
    {
      type: "summon_created" as const,
      title: "Summon trending",
      desc: "Your summon for @balajis crossed 30 backers 🎉",
      link: "/summons",
      person: DEMO_PEOPLE[4],
      minutesAgo: 720,
      read: true,
    },
    {
      type: "request" as const,
      title: "New chat request",
      desc: "Kelechi Nwosu requested a 1h Design Review",
      link: "/chats",
      person: DEMO_PEOPLE[4],
      minutesAgo: 1500,
      read: true,
    },
    {
      type: "message" as const,
      title: "New message",
      desc: "Yetunde replied in Career Coaching",
      link: "/chats",
      person: DEMO_PEOPLE[5],
      minutesAgo: 2880,
      read: true,
    },
  ];

  return items.map((it, i) => {
    const createdAt = new Date(now - it.minutesAgo * 60_000);
    return {
      id: `demo-notif-${i + 1}`,
      type: it.type,
      title: it.title,
      description: it.desc,
      read: it.read,
      link: it.link,
      relatedUserUsername: it.person.username,
      relatedUserImage: it.person.profile_image_url,
      createdAt: createdAt.toISOString(),
      timeAgo: formatTimeAgo(createdAt),
    };
  });
}

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

// ----------------------------------------------------------------------------
// Transactions
// ----------------------------------------------------------------------------

export function getDemoTransactions(userId: string, limit: number) {
  const now = Date.now();
  const types: Array<"chat_payment" | "summon_pledge" | "refund" | "payout"> = [
    "chat_payment",
    "summon_pledge",
    "payout",
    "chat_payment",
    "summon_pledge",
    "refund",
    "chat_payment",
    "payout",
    "summon_pledge",
    "chat_payment",
  ];
  const items = types.slice(0, limit).map((type, i) => {
    const person = DEMO_PEOPLE[i % DEMO_PEOPLE.length];
    const amount = [25, 40, 50, 75, 100, 30, 60, 200, 35, 80][i] || 50;
    return {
      id: `demo-tx-${i + 1}`,
      user_id: userId,
      type,
      status: type === "refund" ? "completed" : "completed",
      amount,
      currency: "USD",
      chat_id: type === "chat_payment" ? `demo-chat-${i + 1}` : null,
      summon_id: type === "summon_pledge" ? `demo-summon-${i + 1}` : null,
      wallet_address: null,
      counterparty_name: person.name,
      counterparty_username: person.username,
      counterparty_image: person.profile_image_url,
      metadata: {
        note:
          type === "chat_payment"
            ? `Paid chat with @${person.username}`
            : type === "summon_pledge"
              ? `Backed summon for @${person.username}`
              : type === "refund"
                ? `Refund · request expired`
                : `Payout to wallet`,
      },
      created_at: new Date(now - (i + 1) * 6 * 3_600_000).toISOString(),
    };
  });
  return items;
}

// ----------------------------------------------------------------------------
// Stats
// ----------------------------------------------------------------------------

export function getDemoUserStats() {
  return {
    totalChats: 14,
    activeChats: 4,
    totalSummons: 6,
    activeSummons: 3,
    totalTransactions: 22,
  };
}
