import { NextResponse } from "next/server";
import { captureApiError } from "@/lib/sentry";
import { getFeaturedCategories } from "@/lib/supabase";

export async function GET() {
  try {
    const categories = await getFeaturedCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    captureApiError(error, "GET /api/discover/categories");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
