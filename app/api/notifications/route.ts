import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { captureApiError } from "@/lib/sentry";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { parsePagination } from "@/lib/validation";

// Lazy initialization to avoid build-time errors
let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return null;
    }
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
}

export interface NotificationResponse {
  id: string;
  type:
    | "message"
    | "payment"
    | "request"
    | "completed"
    | "summon_backed"
    | "summon_created";
  title: string;
  description: string | null;
  read: boolean;
  link: string | null;
  relatedUserUsername: string | null;
  relatedUserImage: string | null;
  createdAt: string;
  timeAgo: string;
}

// Helper to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

// GET /api/notifications - Fetch user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use the database user ID (UUID), not the Twitter ID
    const userId = session.user.dbId;
    if (!userId) {
      // Return empty notifications if user doesn't have a database record yet
      return NextResponse.json({
        notifications: [],
        unreadCount: 0,
      });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({
        notifications: [],
        unreadCount: 0,
      });
    }

    const { searchParams } = new URL(request.url);
    const { limit } = parsePagination(null, searchParams.get("limit"));
    const unreadOnly = searchParams.get("unread") === "true";

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq("read", false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      captureApiError(error, "GET /api/notifications:fetch");
      // Return empty instead of 500 if table doesn't exist or other DB issues
      return NextResponse.json({
        notifications: [],
        unreadCount: 0,
      });
    }

    // Transform to response format
    const transformed: NotificationResponse[] = (notifications || []).map(
      (n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        description: n.description,
        read: n.read,
        link: n.link,
        relatedUserUsername: n.related_user_username,
        relatedUserImage: n.related_user_image,
        createdAt: n.created_at,
        timeAgo: formatTimeAgo(new Date(n.created_at)),
      }),
    );

    // Get unread count
    const { count: unreadCount } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);

    return NextResponse.json({
      notifications: transformed,
      unreadCount: unreadCount || 0,
    });
  } catch (error) {
    captureApiError(error, "GET /api/notifications");
    // Return empty response on error to prevent UI from breaking
    return NextResponse.json({
      notifications: [],
      unreadCount: 0,
    });
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use the database user ID (UUID), not the Twitter ID
    const userId = session.user.dbId;
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Service unavailable" },
        { status: 503 },
      );
    }

    const body = await request.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      // Mark all notifications as read
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);

      if (error) {
        captureApiError(error, "PATCH /api/notifications:mark-all-read");
        return NextResponse.json(
          { error: "Failed to mark notifications as read" },
          { status: 500 },
        );
      }

      return NextResponse.json({ success: true, markedAll: true });
    }

    if (notificationId) {
      // Mark single notification as read
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)
        .eq("user_id", userId);

      if (error) {
        captureApiError(error, "PATCH /api/notifications:mark-one-read");
        return NextResponse.json(
          { error: "Failed to mark notification as read" },
          { status: 500 },
        );
      }

      return NextResponse.json({ success: true, notificationId });
    }

    return NextResponse.json(
      { error: "Missing notificationId or markAllRead" },
      { status: 400 },
    );
  } catch (error) {
    captureApiError(error, "PATCH /api/notifications");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
