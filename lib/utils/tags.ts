// Tag utility functions

import { TAG_COLORS, type TagColor } from "@/lib/constants/discover";

/**
 * Get consistent color for a tag based on its name hash
 */
export function getTagColor(tag: string): TagColor {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TAG_COLORS.length;
  return TAG_COLORS[index];
}

/**
 * Deduplicate tags by normalizing case
 * e.g., "AI" and "Ai" become one
 */
export function deduplicateTags(tags: string[]): string[] {
  return tags.reduce<string[]>((acc, tag) => {
    const normalizedTag = tag.trim();
    const upperTag = normalizedTag.toUpperCase();
    if (!acc.some((t) => t.toUpperCase() === upperTag)) {
      acc.push(normalizedTag);
    }
    return acc;
  }, []);
}



