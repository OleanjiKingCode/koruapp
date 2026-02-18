import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const protectedRoutes = ["/profile", "/chats", "/chat", "/notifications"];
const authRoutes = ["/login", "/sign-in"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;

  if (isLoggedIn && authRoutes.some((r) => path.startsWith(r))) {
    return NextResponse.redirect(new URL("/discover", req.url));
  }

  if (!isLoggedIn && protectedRoutes.some((r) => path.startsWith(r))) {
    const callbackUrl = encodeURIComponent(path);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, req.url),
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|monitoring|.*\\.(?:jpg|jpeg|png|gif|ico|svg|webp|woff|woff2)$).*)",
  ],
};
