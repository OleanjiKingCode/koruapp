import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { captureApiError } from "@/lib/sentry";
import { getDemoSummonsRaw } from "@/lib/demo-data";

// Demo-only override on feat/social-stats-dummy.
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.dbId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const all = getDemoSummonsRaw(session.user.dbId);
    return NextResponse.json({
      createdSummons: all.slice(0, 4),
      backedSummons: all.slice(4, 9),
      targetedSummons: all.slice(9, 11),
    });
  } catch (error) {
    captureApiError(error, "GET /api/user/summons");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
