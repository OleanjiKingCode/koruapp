import { NextResponse } from "next/server";
import { getFeaturedCategories } from "@/lib/supabase";

export async function GET() {
  try {
    const categories = await getFeaturedCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}




