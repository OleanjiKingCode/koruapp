"use client";

import { parseBioText, extractUsername } from "@/lib/utils/bio-parser";

interface ParsedBioProps {
  text: string;
  className?: string;
}

/**
 * Renders bio text with clickable URLs and @mentions
 */
export function ParsedBio({ text, className }: ParsedBioProps) {
  if (!text) return null;

  const parts = parseBioText(text);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === "url") {
          return (
            <a
              key={index}
              href={part.value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-koru-purple hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part.value}
            </a>
          );
        }
        if (part.type === "mention") {
          const username = extractUsername(part.value);
          return (
            <a
              key={index}
              href={`https://x.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-koru-purple hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part.value}
            </a>
          );
        }
        return <span key={index}>{part.value}</span>;
      })}
    </span>
  );
}


