"use client";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

interface ThemeToggleProps {
  size?: "sm" | "default" | "lg";
}

export function ThemeToggle({ size = "default" }: ThemeToggleProps) {
  return <AnimatedThemeToggler size={size} />;
}
