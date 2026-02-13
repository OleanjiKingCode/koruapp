import { NextRequest, NextResponse } from "next/server";
import { getUserByUsername, getBookedSlots } from "@/lib/supabase";
import { captureApiError } from "@/lib/sentry";

// GET - Fetch booked time slots for a creator (public endpoint for booking UI)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  try {
    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 },
      );
    }

    // Look up the user
    const user = await getUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get booked slots
    const bookedSlots = await getBookedSlots(user.id);

    return NextResponse.json({ bookedSlots });
  } catch (error) {
    captureApiError(error, `GET /api/profile/${username}/booked-slots`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
