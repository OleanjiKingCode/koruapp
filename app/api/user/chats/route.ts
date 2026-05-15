import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { captureApiError } from "@/lib/sentry";
import { getDemoUserChats } from "@/lib/demo-data";

// Demo-only override on feat/social-stats-dummy:
// Always return rich dummy chats so screenshots look populated for any logged-in
// user. The chats page filters by session.user.dbId, so we key all chats to it.
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.dbId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const chats = getDemoUserChats(session.user.dbId);
    return NextResponse.json({ chats });
  } catch (error) {
    captureApiError(error, "GET /api/user/chats");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
