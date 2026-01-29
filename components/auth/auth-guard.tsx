"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  fallback,
}: AuthGuardProps) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      // Redirect to login with callback URL
      const callbackUrl = encodeURIComponent(pathname);
      router.replace(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [status, router, pathname]);

  // Loading state
  if (status === "loading") {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-koru-purple/30 border-t-koru-purple animate-spin" />
        </div>
      )
    );
  }

  // Not authenticated - show loading while redirecting
  if (status === "unauthenticated") {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-koru-purple/30 border-t-koru-purple animate-spin" />
        </div>
      )
    );
  }

  // Authenticated
  return <>{children}</>;
}
