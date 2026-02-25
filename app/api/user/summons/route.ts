import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { captureApiError } from "@/lib/sentry";
import {
  getUserSummons,
  getUserBackedSummons,
  getUserTargetedSummons,
} from "@/lib/supabase";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.dbId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const twitterId = session.user.id;
    const username = session.user.username;
    const dbUserId = session.user.dbId;

    const [createdSummons, backedSummons, targetedSummons] = await Promise.all([
      getUserSummons(dbUserId),
      getUserBackedSummons(dbUserId),
      twitterId
        ? getUserTargetedSummons(twitterId, username, dbUserId)
        : Promise.resolve([]),
    ]);

    return NextResponse.json({
      createdSummons,
      backedSummons,
      targetedSummons,
    });
  } catch (error) {
    captureApiError(error, "GET /api/user/summons");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
