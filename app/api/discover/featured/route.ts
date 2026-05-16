import { NextRequest, NextResponse } from "next/server";
import { captureApiError } from "@/lib/sentry";
import { getDemoFeaturedProfiles } from "@/lib/demo-data";

// Demo-only override on feat/social-stats-dummy:
// Return a curated dummy list so the Discover page looks alive for marketing.
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "50");
    const categories = searchParams
      .get("categories")
      ?.split(",")
      .filter(Boolean);

    const result = getDemoFeaturedProfiles({ page, limit, categories });
    return NextResponse.json(result);
  } catch (error) {
    captureApiError(error, "GET /api/discover/featured");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
