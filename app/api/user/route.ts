import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByTwitterId } from "@/lib/supabase";
import { captureApiError } from "@/lib/sentry";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByTwitterId(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    captureApiError(error, "GET /api/user");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}




