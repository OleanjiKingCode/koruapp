import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const protectedRoutes = ["/chats", "/chat", "/notifications"];
// Exact-match protected paths (own profile & edit, not public /profile/:username)
const protectedExactPrefixes = ["/profile/edit"];
const protectedExact = ["/profile"];
const authRoutes = ["/login", "/sign-in"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;

  if (isLoggedIn && authRoutes.some((r) => path.startsWith(r))) {
    return NextResponse.redirect(new URL("/discover", req.url));
  }

  const isProtected =
    protectedRoutes.some((r) => path.startsWith(r)) ||
    protectedExact.includes(path) ||
    protectedExactPrefixes.some((r) => path.startsWith(r));

  if (!isLoggedIn && isProtected) {
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
