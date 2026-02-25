"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function TermsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h2 className="text-2xl font-tenor text-neutral-900 dark:text-neutral-100 mb-2">
        Something went wrong
      </h2>
      <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md">
        We couldn't load the terms page. Please try again.
      </p>
      <Button onClick={reset} className="rounded-full">
        Try again
      </Button>
    </div>
  );
}
