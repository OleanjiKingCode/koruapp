// Bio text parsing utilities

export type BioPart = {
  type: "text" | "url" | "mention";
  value: string;
};

/**
 * Parse bio text and extract URLs and @mentions
 */
export function parseBioText(text: string): BioPart[] {
  if (!text) return [];

  const combinedPattern = /(https?:\/\/[^\s]+)|(@[a-zA-Z0-9_]+)/g;
  const parts: BioPart[] = [];
  let lastIndex = 0;
  let match;

  while ((match = combinedPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    if (match[1]) {
      parts.push({ type: "url", value: match[1] });
    } else if (match[2]) {
      parts.push({ type: "mention", value: match[2] });
    }
    lastIndex = combinedPattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts;
}

/**
 * Extract username from mention (removes @ prefix)
 */
export function extractUsername(mention: string): string {
  return mention.startsWith("@") ? mention.slice(1) : mention;
}




