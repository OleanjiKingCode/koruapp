import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { captureApiError } from "@/lib/sentry";
import { getDemoUserStats } from "@/lib/demo-data";

// Demo-only override on feat/social-stats-dummy.
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.dbId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ stats: getDemoUserStats() });
  } catch (error) {
    captureApiError(error, "GET /api/user/stats");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
