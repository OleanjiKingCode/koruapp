"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface AnimatedThemeTogglerProps
  extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number;
  size?: "sm" | "default" | "lg";
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  size = "default",
  ...props
}: AnimatedThemeTogglerProps) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return;

    const newTheme = isDark ? "light" : "dark";

    // Check if the browser supports view transitions
    if (!document.startViewTransition) {
      // Fallback for browsers without view transition support
      setTheme(newTheme);
      return;
    }

    try {
      await document.startViewTransition(() => {
        flushSync(() => {
          setTheme(newTheme);
        });
      }).ready;

      const { top, left, width, height } =
        buttonRef.current.getBoundingClientRect();
      const x = left + width / 2;
      const y = top + height / 2;
      const maxRadius = Math.hypot(
        Math.max(left, window.innerWidth - left),
        Math.max(top, window.innerHeight - top)
      );

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    } catch {
      // Fallback if view transition fails
      setTheme(newTheme);
    }
  }, [isDark, duration, setTheme]);

  const sizeClasses = {
    sm: "w-8 h-8",
    default: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    default: "w-5 h-5",
    lg: "w-6 h-6",
  };

  // Show placeholder while mounting to avoid hydration mismatch
  if (!mounted) {
    return (
      <div
        className={cn(
          "rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse",
          sizeClasses[size]
        )}
      />
    );
  }

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(
        "relative rounded-full flex items-center justify-center transition-all duration-300",
        "bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900",
        "border border-neutral-300 dark:border-neutral-700",
        "shadow-lg hover:shadow-xl dark:shadow-neutral-900/50",
        "hover:scale-105 active:scale-95",
        "group overflow-hidden",
        sizeClasses[size],
        className
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      {...props}
    >
      {/* Background glow effect */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          isDark
            ? "bg-gradient-to-br from-koru-golden/20 to-orange-500/10"
            : "bg-gradient-to-br from-koru-purple/20 to-indigo-500/10"
        )}
      />

      {/* Icon container with smooth transition */}
      <div className="relative z-10 transition-transform duration-300">
        {isDark ? (
          <Sun
            className={cn(
              iconSizes[size],
              "text-koru-golden drop-shadow-[0_0_8px_rgba(218,176,121,0.5)]",
              "transition-all duration-300 group-hover:rotate-45"
            )}
          />
        ) : (
          <Moon
            className={cn(
              iconSizes[size],
              "text-koru-purple drop-shadow-[0_0_8px_rgba(195,133,238,0.5)]",
              "transition-all duration-300 group-hover:-rotate-12"
            )}
          />
        )}
      </div>

      <span className="sr-only">Toggle theme</span>
    </button>
  );
};
