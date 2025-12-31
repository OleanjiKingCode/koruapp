import { NextRequest, NextResponse } from "next/server";
import { getFeaturedProfiles } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "50");
    const categories = searchParams.get("categories")?.split(",").filter(Boolean);

    const result = await getFeaturedProfiles(page, limit, categories);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching featured profiles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}




