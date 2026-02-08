import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { captureApiError } from "@/lib/sentry";
import { supabase } from "@/lib/supabase";

interface ConnectedWallet {
  address: string;
  chain: string;
  is_primary: boolean;
  linked_at: string;
  unlinked_at?: string;
}

// Check if a wallet address is already linked to another user
async function isWalletLinkedToAnotherUser(
  walletAddress: string,
  currentUserTwitterId: string,
): Promise<boolean> {
  const normalizedAddress = walletAddress.toLowerCase();

  // Query all users to check their connected_wallets
  const { data: users, error } = await supabase
    .from("users")
    .select("twitter_id, connected_wallets")
    .neq("twitter_id", currentUserTwitterId);

  if (error || !users) return false;

  // Check if any other user has this wallet as a primary active wallet
  for (const user of users) {
    const wallets = user.connected_wallets as ConnectedWallet[] | null;
    if (!wallets) continue;

    const hasWallet = wallets.some(
      (w) =>
        w.address.toLowerCase() === normalizedAddress &&
        w.is_primary &&
        !w.unlinked_at,
    );

    if (hasWallet) return true;
  }

  return false;
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const allowedFields = [
      "bio",
      "is_creator",
      "price_per_message",
      "response_time_hours",
      "email",
      "tags",
      "website",
      "availability",
      "connected_wallets",
    ];

    // Filter out any fields that aren't allowed
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    // If updating connected_wallets, check for uniqueness
    if (updates.connected_wallets) {
      const wallets = updates.connected_wallets as ConnectedWallet[];

      // Find the primary wallet being added
      const newPrimaryWallet = wallets.find(
        (w) => w.is_primary && !w.unlinked_at,
      );

      if (newPrimaryWallet) {
        const isAlreadyLinked = await isWalletLinkedToAnotherUser(
          newPrimaryWallet.address,
          session.user.id,
        );

        if (isAlreadyLinked) {
          return NextResponse.json(
            {
              error:
                "This wallet is already linked to another Koru account. Each wallet can only be linked to one account.",
            },
            { status: 400 },
          );
        }
      }
    }

    // Update user directly using Supabase client
    const { data, error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("twitter_id", session.user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    captureApiError(error, "PATCH /api/user/update");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
