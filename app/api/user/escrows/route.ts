import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { captureApiError } from "@/lib/sentry";

// GET - Fetch user's escrows (both as recipient and depositor)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.dbId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role") || "recipient"; // 'recipient' | 'depositor' | 'all'
    const status = searchParams.get("status"); // Optional: 'pending', 'accepted', 'released', etc.

    // Build query
    let query = supabase.from("escrows").select(`
        id,
        escrow_id,
        depositor_address,
        recipient_address,
        depositor_user_id,
        recipient_user_id,
        amount,
        status,
        accept_deadline,
        dispute_deadline,
        accepted_at,
        completed_at,
        chat_id,
        description,
        created_at,
        chats:chat_id (
          id,
          status,
          requester_id,
          creator_id
        )
      `);

    // Filter by role
    if (role === "recipient") {
      query = query.eq("recipient_user_id", session.user.dbId);
    } else if (role === "depositor") {
      query = query.eq("depositor_user_id", session.user.dbId);
    } else {
      // All - either recipient or depositor
      query = query.or(
        `recipient_user_id.eq.${session.user.dbId},depositor_user_id.eq.${session.user.dbId}`,
      );
    }

    // Filter by status if provided
    if (status) {
      query = query.eq("status", status);
    } else {
      // By default, get active escrows (pending, accepted, released)
      query = query.in("status", ["pending", "accepted", "released"]);
    }

    // Order by created_at desc
    query = query.order("created_at", { ascending: false });

    const { data: escrows, error } = await query;

    if (error) {
      console.error("Error fetching escrows:", error);
      return NextResponse.json(
        { error: "Failed to fetch escrows" },
        { status: 500 },
      );
    }

    // Get other party info for each escrow
    const userIds = new Set<string>();
    escrows?.forEach((e) => {
      if (e.depositor_user_id && e.depositor_user_id !== session.user.dbId) {
        userIds.add(e.depositor_user_id);
      }
      if (e.recipient_user_id && e.recipient_user_id !== session.user.dbId) {
        userIds.add(e.recipient_user_id);
      }
    });

    let usersMap: Record<string, any> = {};
    if (userIds.size > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("id, name, username, profile_image_url")
        .in("id", Array.from(userIds));

      if (users) {
        usersMap = users.reduce((acc: Record<string, any>, u: any) => {
          acc[u.id] = u;
          return acc;
        }, {});
      }
    }

    // Transform escrows with other party info
    const transformedEscrows = escrows?.map((e) => {
      const isRecipient = e.recipient_user_id === session.user.dbId;
      const otherUserId = isRecipient
        ? e.depositor_user_id
        : e.recipient_user_id;
      const otherUser = otherUserId ? usersMap[otherUserId] : null;

      // Calculate hours left until deadline
      let hoursLeft: number | null = null;
      if (e.accept_deadline && e.status === "pending") {
        const deadline = new Date(e.accept_deadline);
        const now = new Date();
        const diffMs = deadline.getTime() - now.getTime();
        hoursLeft = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
      }

      return {
        id: e.id,
        escrowId: e.escrow_id,
        amount: Number(e.amount),
        status: e.status,
        acceptDeadline: e.accept_deadline,
        disputeDeadline: e.dispute_deadline,
        acceptedAt: e.accepted_at,
        completedAt: e.completed_at,
        chatId: e.chat_id,
        description: e.description,
        createdAt: e.created_at,
        isRecipient,
        hoursLeft,
        otherParty: otherUser
          ? {
              id: otherUser.id,
              name: otherUser.name,
              username: otherUser.username,
              profileImageUrl: otherUser.profile_image_url,
            }
          : null,
      };
    });

    // Calculate totals
    const pending = transformedEscrows?.filter(
      (e) => e.status === "pending" || e.status === "accepted",
    );
    const ready = transformedEscrows?.filter((e) => e.status === "released");

    const totalPending = pending?.reduce((sum, e) => sum + e.amount, 0) || 0;
    const totalReady = ready?.reduce((sum, e) => sum + e.amount, 0) || 0;

    return NextResponse.json({
      escrows: transformedEscrows,
      totals: {
        pending: totalPending,
        ready: totalReady,
        total: totalPending + totalReady,
      },
    });
  } catch (error) {
    captureApiError(error, "GET /api/user/escrows");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
