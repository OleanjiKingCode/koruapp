"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface AvatarGeneratorProps {
  seed: string;
  size?: number;
  className?: string;
}

// Generate a unique avatar based on a seed (like Boring Avatars)
export function AvatarGenerator({ seed, size = 40, className }: AvatarGeneratorProps) {
  const avatar = useMemo(() => generateAvatar(seed), [seed]);

  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      className={cn("rounded-full", className)}
    >
      <defs>
        <linearGradient id={`grad-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={avatar.colors[0]} />
          <stop offset="100%" stopColor={avatar.colors[1]} />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <rect width="80" height="80" fill={`url(#grad-${seed})`} />
      
      {/* Shapes based on seed */}
      {avatar.shapes.map((shape, i) => (
        <Shape key={i} {...shape} />
      ))}
    </svg>
  );
}

interface ShapeProps {
  type: "circle" | "rect" | "triangle" | "ring";
  x: number;
  y: number;
  size: number;
  color: string;
  rotation?: number;
}

function Shape({ type, x, y, size, color, rotation = 0 }: ShapeProps) {
  const transform = `rotate(${rotation} ${x} ${y})`;
  
  switch (type) {
    case "circle":
      return <circle cx={x} cy={y} r={size / 2} fill={color} opacity={0.8} />;
    case "rect":
      return (
        <rect
          x={x - size / 2}
          y={y - size / 2}
          width={size}
          height={size}
          fill={color}
          opacity={0.7}
          rx={size / 8}
          transform={transform}
        />
      );
    case "triangle":
      const points = `${x},${y - size / 2} ${x - size / 2},${y + size / 2} ${x + size / 2},${y + size / 2}`;
      return <polygon points={points} fill={color} opacity={0.75} transform={transform} />;
    case "ring":
      return (
        <circle
          cx={x}
          cy={y}
          r={size / 2}
          fill="none"
          stroke={color}
          strokeWidth={size / 5}
          opacity={0.6}
        />
      );
    default:
      return null;
  }
}

// Color palettes inspired by Koru brand
const palettes = [
  ["#c385ee", "#9deb61"], // Purple to Lime
  ["#dab079", "#c385ee"], // Golden to Purple
  ["#9deb61", "#dab079"], // Lime to Golden
  ["#c385ee", "#dab079"], // Purple to Golden
  ["#6366f1", "#c385ee"], // Indigo to Purple
  ["#f472b6", "#dab079"], // Pink to Golden
  ["#34d399", "#9deb61"], // Emerald to Lime
  ["#fbbf24", "#dab079"], // Amber to Golden
  ["#818cf8", "#c385ee"], // Violet to Purple
  ["#a78bfa", "#9deb61"], // Purple to Lime
];

const shapeColors = [
  "rgba(255, 255, 255, 0.9)",
  "rgba(255, 255, 255, 0.7)",
  "rgba(0, 0, 0, 0.15)",
  "rgba(0, 0, 0, 0.1)",
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function generateAvatar(seed: string) {
  const hash = hashCode(seed);
  
  // Select palette
  const paletteIndex = hash % palettes.length;
  const colors = palettes[paletteIndex];
  
  // Generate 2-4 shapes
  const numShapes = 2 + (hash % 3);
  const shapes: ShapeProps[] = [];
  
  const shapeTypes: ShapeProps["type"][] = ["circle", "rect", "triangle", "ring"];
  
  for (let i = 0; i < numShapes; i++) {
    const shapeHash = hashCode(seed + i.toString());
    
    shapes.push({
      type: shapeTypes[shapeHash % shapeTypes.length],
      x: 15 + ((shapeHash >> 4) % 50),
      y: 15 + ((shapeHash >> 8) % 50),
      size: 15 + ((shapeHash >> 12) % 30),
      color: shapeColors[(shapeHash >> 16) % shapeColors.length],
      rotation: (shapeHash >> 20) % 360,
    });
  }
  
  return { colors, shapes };
}

// Helper to get initials-based avatar as fallback
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}




