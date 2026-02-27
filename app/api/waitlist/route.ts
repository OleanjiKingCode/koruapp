import { NextResponse } from "next/server";
import { joinWaitlist } from "@/lib/supabase";
import { WAITLIST_SOURCES } from "@/lib/constants/waitlist";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const twitterHandle =
      typeof body.twitter_handle === "string"
        ? body.twitter_handle.trim()
        : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const heardFrom =
      typeof body.heard_from === "string" ? body.heard_from.trim() : "";
    const dreamConversation =
      typeof body.dream_conversation === "string"
        ? body.dream_conversation.trim()
        : "";
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";

    // Validate required fields
    if (!name || !twitterHandle || !email || !heardFrom) {
      return NextResponse.json(
        { error: "All required fields must be filled out" },
        { status: 400 },
      );
    }

    // Validate email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    // Validate heard_from against allowed options
    if (!(WAITLIST_SOURCES as readonly string[]).includes(heardFrom)) {
      return NextResponse.json(
        { error: "Invalid selection for how you heard about us" },
        { status: 400 },
      );
    }

    // Validate twitter handle (alphanumeric + underscores, 1-15 chars)
    const cleanHandle = twitterHandle.replace(/^@/, "");
    if (!/^[a-zA-Z0-9_]{1,15}$/.test(cleanHandle)) {
      return NextResponse.json(
        { error: "Please enter a valid X/Twitter handle" },
        { status: 400 },
      );
    }

    const result = await joinWaitlist({
      name,
      twitter_handle: cleanHandle,
      email,
      dream_conversation: dreamConversation || null,
      heard_from: heardFrom,
      notes: notes || null,
    });

    if (result.duplicate) {
      return NextResponse.json(
        { error: "This email or X handle is already on our waitlist!" },
        { status: 409 },
      );
    }

    if (!result.data) {
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "You've been added to the waitlist!",
    });
  } catch (error) {
    console.error("POST /api/waitlist error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
