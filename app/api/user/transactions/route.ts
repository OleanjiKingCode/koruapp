import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { captureApiError } from "@/lib/sentry";
import { getRecentTransactions } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.dbId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");

    const transactions = await getRecentTransactions(session.user.dbId, limit);
    return NextResponse.json({ transactions });
  } catch (error) {
    captureApiError(error, "GET /api/user/transactions");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
