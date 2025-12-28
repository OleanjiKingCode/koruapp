import { NextRequest, NextResponse } from "next/server";
import { getUserByUsername, getProfileByUsername } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // First check if user is registered on Koru
    const koruUser = await getUserByUsername(username);
    if (koruUser) {
      return NextResponse.json({
        profile: {
          name: koruUser.name,
          handle: koruUser.username,
          bio: koruUser.bio || undefined,
          profileImageUrl: koruUser.profile_image_url || undefined,
          followersCount: koruUser.followers_count || undefined,
          followingCount: koruUser.following_count || undefined,
          isVerified: koruUser.is_verified,
          tags: koruUser.tags || undefined,
          isOnKoru: true,
        },
      });
    }

    // Check featured profiles or search cache
    const cached = await getProfileByUsername(username);
    if (cached) {
      return NextResponse.json({
        profile: {
          name: cached.name,
          handle: cached.username,
          bio: cached.bio || undefined,
          profileImageUrl: cached.profile_image_url || undefined,
          bannerUrl: cached.banner_url || undefined,
          followersCount: cached.followers_count || undefined,
          followingCount: cached.following_count || undefined,
          isVerified: cached.verified,
          category: cached.category || undefined,
          tags: cached.tags || undefined,
          isOnKoru: false,
        },
      });
    }

    // Not found
    return NextResponse.json(
      { error: "Profile not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

