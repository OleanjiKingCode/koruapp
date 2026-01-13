import { ImageResponse } from "next/og";

export const runtime = "edge";

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

// Tag colors matching the Premium variant
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

interface BackerInfo {
  user_id: string;
  username: string;
  name: string;
  profile_image_url: string | null;
  amount: number;
  backed_at: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Use direct fetch to Supabase REST API for edge runtime compatibility
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(145deg, #fefefe 0%, #f8f8f8 100%)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ color: "#111827", fontSize: 48, fontWeight: "bold" }}>
            Configuration Error
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // Fetch summon data via REST API
  const response = await fetch(
    `${supabaseUrl}/rest/v1/summons?id=eq.${id}&select=*`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    }
  );

  const data = await response.json();
  const summon = data?.[0];

  if (!summon) {
    // Return a default OG image for not found
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(145deg, #fefefe 0%, #f8f8f8 100%)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ color: "#111827", fontSize: 48, fontWeight: "bold" }}>
            Summon Not Found
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const targetHandle =
    summon.target_username ||
    summon.target_handle ||
    summon.target_twitter_id ||
    "unknown";
  const targetName =
    summon.target_name || summon.target_username || "Unknown";
  const targetProfileImage =
    summon.target_profile_image || summon.target_image || null;
  const totalPledged = Number(
    summon.total_backed || summon.pledged_amount || summon.amount || 0
  );
  const backersCount = summon.backers_count || 0;
  const tags = summon.tags || {};
  const trendValue = 0;

  // Get top tags
  const topTags = Object.entries(tags)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 2)
    .map(([tag]) => tag);

  // Get backers data
  const backersFromArray: BackerInfo[] = summon.backers || [];
  const trendColor = "#9deb61";

  // Premium variant - Clean professional design (matching appeal-share-card.tsx default)
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e5e5e5",
          fontFamily: "system-ui, sans-serif",
          padding: 40,
        }}
      >
        {/* Card Container - Premium variant */}
        <div
          style={{
            width: 1120,
            height: 550,
            background: "linear-gradient(145deg, #fefefe 0%, #f8f8f8 100%)",
            borderRadius: 48,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 4px 60px rgba(0,0,0,0.08)",
            position: "relative",
          }}
        >
          {/* Top gradient bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 12,
              background:
                "linear-gradient(90deg, #dab079 0%, #c385ee 50%, #9deb61 100%)",
              display: "flex",
            }}
          />

          {/* Decorative background shape */}
          <div
            style={{
              position: "absolute",
              bottom: -80,
              right: -80,
              width: 300,
              height: 300,
              background:
                "linear-gradient(135deg, rgba(218,176,121,0.1) 0%, rgba(195,133,238,0.1) 100%)",
              borderRadius: "50%",
              display: "flex",
            }}
          />

          {/* Content */}
          <div
            style={{
              flex: 1,
              padding: 56,
              paddingTop: 68,
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 48,
              }}
            >
              {/* Left side - Profile */}
              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                {/* Profile Image */}
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 32,
                    overflow: "hidden",
                    display: "flex",
                    background: "#e5e7eb",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                  }}
                >
                  {targetProfileImage ? (
                    <img
                      src={targetProfileImage}
                      alt={targetName}
                      width={120}
                      height={120}
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 120,
                        height: 120,
                        background:
                          "linear-gradient(135deg, #c385ee 0%, #9deb61 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 48,
                        fontWeight: "bold",
                        color: "#fff",
                      }}
                    >
                      {targetHandle.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      fontSize: 48,
                      fontWeight: "bold",
                      color: "#111827",
                      display: "flex",
                    }}
                  >
                    @{targetHandle}
                  </div>
                  <div
                    style={{
                      fontSize: 24,
                      color: "#6b7280",
                      display: "flex",
                      marginTop: 4,
                    }}
                  >
                    {targetName}
                  </div>
                </div>
              </div>

              {/* Right side - Tags and Trend */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 16,
                }}
              >
                {/* Tags */}
                {topTags.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      justifyContent: "flex-end",
                    }}
                  >
                    {topTags.map((tag) => {
                      const style = getTagStyle(tag);
                      return (
                        <div
                          key={tag}
                          style={{
                            padding: "10px 20px",
                            borderRadius: 12,
                            background: style.bg,
                            color: style.text,
                            fontSize: 20,
                            fontWeight: 600,
                            display: "flex",
                          }}
                        >
                          {tag}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Trend indicator */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: trendColor,
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={trendColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                    <polyline points="16 7 22 7 22 13" />
                  </svg>
                  <span style={{ fontSize: 22, fontWeight: "bold" }}>
                    +{trendValue}%
                  </span>
                </div>
              </div>
            </div>

            {/* Stats - Bottom section */}
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                {/* Stats */}
                <div style={{ display: "flex", gap: 64 }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div
                      style={{
                        fontSize: 72,
                        fontWeight: 900,
                        color: "#111827",
                        display: "flex",
                        lineHeight: 1,
                      }}
                    >
                      ${formatNumber(totalPledged)}
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        color: "#9ca3af",
                        display: "flex",
                        marginTop: 8,
                      }}
                    >
                      Total Pledged
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      paddingLeft: 64,
                      borderLeft: "2px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 72,
                        fontWeight: 900,
                        color: "#c385ee",
                        display: "flex",
                        lineHeight: 1,
                      }}
                    >
                      {backersCount}
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        color: "#9ca3af",
                        display: "flex",
                        marginTop: 8,
                      }}
                    >
                      Backers
                    </div>
                  </div>
                </div>

                {/* Backer avatars and branding */}
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  {/* Backer Avatars */}
                  {backersFromArray.length > 0 && (
                    <div style={{ display: "flex" }}>
                      {backersFromArray.slice(0, 4).map((backer, idx) => (
                        <div
                          key={backer.user_id || idx}
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 28,
                            overflow: "hidden",
                            border: "3px solid #f8f8f8",
                            marginLeft: idx > 0 ? -16 : 0,
                            display: "flex",
                            background: "#e5e7eb",
                          }}
                        >
                          {backer.profile_image_url ? (
                            <img
                              src={backer.profile_image_url}
                              alt={backer.name}
                              width={56}
                              height={56}
                              style={{ objectFit: "cover" }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 56,
                                height: 56,
                                background:
                                  "linear-gradient(135deg, #c385ee 0%, #9deb61 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 20,
                                fontWeight: "bold",
                                color: "#fff",
                              }}
                            >
                              {(backer.username || "U").charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      ))}
                      {backersCount > 4 && (
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 28,
                            background: "#e5e5e5",
                            border: "3px solid #f8f8f8",
                            marginLeft: -16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 16,
                              fontWeight: "bold",
                              color: "#525252",
                            }}
                          >
                            +{backersCount - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Koru branding */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 20px",
                      background: "rgba(195,133,238,0.1)",
                      borderRadius: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background:
                          "linear-gradient(135deg, #c385ee 0%, #dab079 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        color: "#fff",
                        fontSize: 18,
                      }}
                    >
                      K
                    </div>
                    <span
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "#c385ee",
                      }}
                    >
                      Koru
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
