import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { captureApiError } from "@/lib/sentry";
import { getUserWallets } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.dbId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wallets = await getUserWallets(session.user.dbId);
    return NextResponse.json({ wallets });
  } catch (error) {
    captureApiError(error, "GET /api/user/wallets");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
