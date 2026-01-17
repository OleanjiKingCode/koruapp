"use client";

import { usePathname } from "next/navigation";
import { FloatingNav } from "./floating-nav";
import { Footer } from "./footer";

// Pages where we don't show the nav/footer
const EXCLUDED_ROUTES = ["/", "/sign-in", "/login"];

// Pages where we hide footer but show nav (full-screen experiences)
const NO_FOOTER_ROUTES = ["/chat"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const showNav = !EXCLUDED_ROUTES.includes(pathname);
  const showFooter =
    showNav && !NO_FOOTER_ROUTES.some((route) => pathname.startsWith(route));

  return (
    <>
      {/* Add bottom padding to account for footer height (~400px) */}
      <div className={showFooter ? "pb-[420px]" : ""}>
        {children}
      </div>
      {showNav && <FloatingNav />}
      {showFooter && <Footer />}
    </>
  );
}
