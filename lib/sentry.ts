import * as Sentry from "@sentry/nextjs";

/**
 * Capture a database operation error
 */
export function captureDbError(
  error: Error | unknown,
  operation: string,
  extra?: Record<string, unknown>
) {
  if (process.env.NODE_ENV === "development") {
    console.error(`[DB:${operation}]:`, error);
    return;
  }

  const errorObj = error instanceof Error ? error : new Error(String(error));
  Sentry.captureException(errorObj, {
    tags: { operation: `db:${operation}` },
    extra,
  });
}

/**
 * Capture an API error
 */
export function captureApiError(
  error: Error | unknown,
  endpoint: string,
  extra?: Record<string, unknown>
) {
  if (process.env.NODE_ENV === "development") {
    console.error(`[API:${endpoint}]:`, error);
    return;
  }

  const errorObj = error instanceof Error ? error : new Error(String(error));
  Sentry.captureException(errorObj, {
    tags: { operation: `api:${endpoint}` },
    extra,
  });
}
