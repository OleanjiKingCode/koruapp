import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserAvailabilitySlots } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.dbId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const slots = await getUserAvailabilitySlots(session.user.dbId);
    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error fetching user availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}




