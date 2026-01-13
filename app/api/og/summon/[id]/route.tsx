import { ImageResponse } from "next/og";
import { supabase } from "@/lib/supabase";

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

// Tag colors
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

  // Fetch summon data
  const { data: summon, error } = await supabase
    .from("summons")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !summon) {
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
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ color: "#fff", fontSize: 48, fontWeight: "bold" }}>
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
  const request_text = summon.message || summon.request || "";

  // Get top tags
  const topTags = Object.entries(tags)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([tag]) => tag);

  // Get backers data
  const backersFromArray: BackerInfo[] = summon.backers || [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          fontFamily: "system-ui, sans-serif",
          padding: 40,
        }}
      >
        {/* Card Container */}
        <div
          style={{
            width: 1120,
            height: 550,
            background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
            borderRadius: 32,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          {/* Gradient Header Bar */}
          <div
            style={{
              height: 8,
              background:
                "linear-gradient(90deg, #c385ee 0%, #dab079 50%, #9deb61 100%)",
              display: "flex",
            }}
          />

          {/* Content */}
          <div
            style={{
              flex: 1,
              padding: 48,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 24,
                marginBottom: 32,
              }}
            >
              {/* Profile Image */}
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 20,
                  overflow: "hidden",
                  display: "flex",
                  background: "#e5e7eb",
                  flexShrink: 0,
                }}
              >
                {targetProfileImage ? (
                  <img
                    src={targetProfileImage}
                    alt={targetName}
                    width={100}
                    height={100}
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: 100,
                      height: 100,
                      background:
                        "linear-gradient(135deg, #c385ee 0%, #9deb61 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 40,
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    {targetHandle.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div
                  style={{
                    fontSize: 14,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    marginBottom: 4,
                    display: "flex",
                  }}
                >
                  Summon for
                </div>
                <div
                  style={{
                    fontSize: 42,
                    fontWeight: "bold",
                    color: "#111827",
                    marginBottom: 4,
                    display: "flex",
                  }}
                >
                  @{targetHandle}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    color: "#6b7280",
                    display: "flex",
                  }}
                >
                  {targetName}
                </div>
              </div>

              {/* Koru Logo */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    background:
                      "linear-gradient(90deg, #c385ee 0%, #dab079 100%)",
                    backgroundClip: "text",
                    color: "transparent",
                    display: "flex",
                  }}
                >
                  Koru
                </div>
              </div>
            </div>

            {/* Tags */}
            {topTags.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 32,
                }}
              >
                {topTags.map((tag) => {
                  const style = getTagStyle(tag);
                  return (
                    <div
                      key={tag}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 20,
                        background: style.bg,
                        color: style.text,
                        fontSize: 16,
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

            {/* Request text (if any) */}
            {request_text && (
              <div
                style={{
                  flex: 1,
                  padding: 24,
                  background: "#f9fafb",
                  borderRadius: 16,
                  marginBottom: 32,
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    color: "#374151",
                    lineHeight: 1.5,
                    display: "flex",
                    overflow: "hidden",
                  }}
                >
                  &ldquo;
                  {request_text.length > 200
                    ? request_text.slice(0, 200) + "..."
                    : request_text}
                  &rdquo;
                </div>
              </div>
            )}

            {/* Stats Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 24,
                borderTop: "1px solid #e5e7eb",
                marginTop: "auto",
              }}
            >
              {/* Stats */}
              <div style={{ display: "flex", gap: 48 }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: "bold",
                      color: "#dab079",
                      display: "flex",
                    }}
                  >
                    ${formatNumber(totalPledged)}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "#9ca3af",
                      display: "flex",
                    }}
                  >
                    pledged
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: "bold",
                      color: "#c385ee",
                      display: "flex",
                    }}
                  >
                    {backersCount}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "#9ca3af",
                      display: "flex",
                    }}
                  >
                    backers
                  </div>
                </div>
              </div>

              {/* Backer Avatars */}
              {backersFromArray.length > 0 && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", marginLeft: -8 }}>
                    {backersFromArray.slice(0, 5).map((backer, idx) => (
                      <div
                        key={backer.user_id || idx}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          overflow: "hidden",
                          border: "3px solid #ffffff",
                          marginLeft: idx > 0 ? -12 : 0,
                          display: "flex",
                          background: "#e5e7eb",
                        }}
                      >
                        {backer.profile_image_url ? (
                          <img
                            src={backer.profile_image_url}
                            alt={backer.name}
                            width={40}
                            height={40}
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              background:
                                "linear-gradient(135deg, #c385ee 0%, #9deb61 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 14,
                              fontWeight: "bold",
                              color: "#fff",
                            }}
                          >
                            {(backer.username || "U").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {backersCount > 5 && (
                    <div
                      style={{
                        marginLeft: 8,
                        fontSize: 14,
                        color: "#6b7280",
                        display: "flex",
                      }}
                    >
                      +{backersCount - 5} more
                    </div>
                  )}
                </div>
              )}
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
