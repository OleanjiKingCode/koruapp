import { NextResponse } from "next/server";
import { captureApiError } from "@/lib/sentry";
import { DEMO_CATEGORIES } from "@/lib/demo-data";

// Demo-only override on feat/social-stats-dummy.
export async function GET() {
  try {
    return NextResponse.json({ categories: DEMO_CATEGORIES });
  } catch (error) {
    captureApiError(error, "GET /api/discover/categories");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
