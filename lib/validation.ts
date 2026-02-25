export function parseAmount(
  value: unknown,
  { min = 1, max = 1_000_000, maxDecimals = 2 } = {},
): number | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (!str) return null;

  const num = Number(str);
  if (!Number.isFinite(num)) return null;
  if (num < min || num > max) return null;

  const decimalPart = str.split(".")[1];
  if (decimalPart && decimalPart.length > maxDecimals) return null;

  return num;
}

export function parsePagination(
  page: string | null,
  limit: string | null,
  { maxLimit = 100, defaultLimit = 50 } = {},
): { page: number; limit: number } {
  const p = Math.max(0, parseInt(page || "0", 10) || 0);
  const l = Math.max(
    1,
    Math.min(
      maxLimit,
      parseInt(limit || String(defaultLimit), 10) || defaultLimit,
    ),
  );
  return { page: p, limit: l };
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateTags(
  tags: unknown,
  { maxCount = 20, maxLength = 50 } = {},
): string[] | null {
  if (!Array.isArray(tags)) return null;
  if (tags.length > maxCount) return null;
  const valid = tags.every(
    (t) => typeof t === "string" && t.length > 0 && t.length <= maxLength,
  );
  return valid ? (tags as string[]) : null;
}

export function validateEnum<T extends string>(
  value: string | null,
  allowed: readonly T[],
  defaultValue: T,
): T {
  if (value && (allowed as readonly string[]).includes(value)) {
    return value as T;
  }
  return defaultValue;
}

export function trimOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
