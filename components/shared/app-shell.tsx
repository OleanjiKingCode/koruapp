"use client";

import { usePathname } from "next/navigation";
import { FloatingNav } from "./floating-nav";
import { Footer } from "./footer";

// Pages where we don't show the nav/footer
const EXCLUDED_ROUTES = ["/", "/sign-in"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const showNav = !EXCLUDED_ROUTES.includes(pathname);

  return (
    <>
      {children}
      {showNav && <FloatingNav />}
      {showNav && <Footer />}
    </>
  );
}

