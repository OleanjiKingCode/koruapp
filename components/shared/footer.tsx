"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  TwitterIcon,
  DiscordIcon,
  GithubIcon as GitHubIcon,
} from "@/components/icons";

// Kaya variations
const kayaImages = [
  "/kayaWingsout.png",
  "/sadKaya.png",
  "/kayaSideWays.png",
] as const;

const kayaPositions = [
  { anchor: "bottom-0 right-0", transform: "translate-x-8 translate-y-8" },
  { anchor: "bottom-0 left-0", transform: "-translate-x-8 translate-y-8" },
  { anchor: "bottom-0 left-1/2", transform: "-translate-x-1/2 translate-y-8" },
] as const;

const footerLinks = {
  product: [
    { name: "Discover", href: "/discover" },
    { name: "Summons", href: "/summons" },
    { name: "How it works", href: "/how-it-works" },
  ],
  support: [
    { name: "FAQs", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ],
  // legal: [
  //   { name: "Privacy Policy", href: "/privacy" },
  //   { name: "Terms of Service", href: "/terms" },
  // ],
};

const socials = [
  { name: "Twitter", href: "https://twitter.com", icon: TwitterIcon },
  { name: "Discord", href: "https://discord.com", icon: DiscordIcon },
  { name: "GitHub", href: "https://github.com", icon: GitHubIcon },
];

export function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  // Random Kaya selection - picked once per page load
  const kayaVariant = useMemo(
    () => ({
      image: kayaImages[Math.floor(Math.random() * kayaImages.length)],
      position: kayaPositions[Math.floor(Math.random() * kayaPositions.length)],
    }),
    []
  );

  // Memoized visibility check function
  const checkVisibility = useCallback(() => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Calculate how far from the actual bottom the user is (in pixels)
    const distanceFromBottom = documentHeight - windowHeight - scrollTop;

    // Show footer when within 200px of bottom (matching floating nav threshold)
    const pixelThreshold = 200;

    // Calculate scrollable height
    const scrollableHeight = documentHeight - windowHeight;

    // Only show footer when:
    // 1. User is within 200px of the true bottom AND has scrolled significantly
    // 2. OR page is truly short (content less than viewport) AND document is less than 1.1x viewport
    //    AND user has scrolled at least 100px (to prevent showing on initial load)
    const nearBottom = distanceFromBottom <= pixelThreshold;
    const hasScrolledEnough = scrollTop > 200;
    const pageIsTrulyShort =
      scrollableHeight <= 30 &&
      documentHeight < windowHeight * 1.1 &&
      scrollTop > 100;

    setIsVisible((nearBottom && hasScrolledEnough) || pageIsTrulyShort);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Initial check
    checkVisibility();

    // Listen to scroll events
    window.addEventListener("scroll", checkVisibility, { passive: true });

    // Listen to resize events (window resize can change layout)
    window.addEventListener("resize", checkVisibility, { passive: true });

    // Use ResizeObserver to detect content size changes
    const resizeObserver = new ResizeObserver(() => {
      // Use requestAnimationFrame to batch updates
      requestAnimationFrame(checkVisibility);
    });

    // Observe the body for size changes
    resizeObserver.observe(document.body);

    // Use MutationObserver to detect DOM changes (like filtering adding/removing elements)
    const mutationObserver = new MutationObserver(() => {
      // Debounce the check slightly to allow layout to settle
      requestAnimationFrame(() => {
        requestAnimationFrame(checkVisibility);
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    });

    // Also set up an interval as a fallback for any edge cases
    const intervalId = setInterval(checkVisibility, 500);

    return () => {
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      clearInterval(intervalId);
    };
  }, [mounted, checkVisibility]);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.footer
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="fixed bottom-0 left-0 right-0 z-30"
        >
          <div className="mx-4 mb-4">
            <div
              className={cn(
                "rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden",
                isDark
                  ? "bg-neutral-900 border border-neutral-800 shadow-black/40"
                  : "bg-white border border-neutral-200 shadow-black/10"
              )}
            >
              {/* Kaya - Background Decoration (randomized position & image) */}
              <div
                className={cn(
                  "absolute pointer-events-none select-none",
                  kayaVariant.position.anchor
                )}
              >
                <Image
                  src={kayaVariant.image}
                  alt=""
                  width={200}
                  height={200}
                  className={cn(
                    "object-contain",
                    kayaVariant.position.transform,
                    isDark ? "opacity-[0.08]" : "opacity-[0.06]"
                  )}
                  aria-hidden="true"
                />
              </div>

              <div className="max-w-container mx-auto relative z-10">
                {/* Top Section */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-8">
                  {/* Brand */}
                  <div className="md:max-w-xs">
                    <h2
                      className={cn(
                        "text-2xl   mb-2",
                        isDark ? "text-white" : "text-neutral-900"
                      )}
                    >
                      Kōru
                    </h2>
                    <p
                      className={cn(
                        "text-sm   italic",
                        isDark ? "text-neutral-400" : "text-neutral-600"
                      )}
                    >
                      Pay for access. Earn for time.
                    </p>
                  </div>

                  {/* Links */}
                  <div className="grid grid-cols-2 gap-8 md:gap-12">
                    <div>
                      <h3
                        className={cn(
                          "text-sm   font-semibold mb-3",
                          isDark ? "text-white" : "text-neutral-900"
                        )}
                      >
                        Product
                      </h3>
                      <ul className="space-y-2">
                        {footerLinks.product.map((link) => (
                          <li key={link.name}>
                            <Link
                              href={link.href}
                              className={cn(
                                "text-sm   transition-colors",
                                isDark
                                  ? "text-neutral-400 hover:text-white"
                                  : "text-neutral-600 hover:text-neutral-900"
                              )}
                            >
                              {link.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3
                        className={cn(
                          "text-sm   font-semibold mb-3",
                          isDark ? "text-white" : "text-neutral-900"
                        )}
                      >
                        Support
                      </h3>
                      <ul className="space-y-2">
                        {footerLinks.support.map((link) => (
                          <li key={link.name}>
                            <Link
                              href={link.href}
                              className={cn(
                                "text-sm   transition-colors",
                                isDark
                                  ? "text-neutral-400 hover:text-white"
                                  : "text-neutral-600 hover:text-neutral-900"
                              )}
                            >
                              {link.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Legal section commented out */}
                    {/* <div>
                      <h3
                        className={cn(
                          "text-sm   font-semibold mb-3",
                          isDark ? "text-white" : "text-neutral-900"
                        )}
                      >
                        Legal
                      </h3>
                      <ul className="space-y-2">
                        {footerLinks.legal.map((link) => (
                          <li key={link.name}>
                            <Link
                              href={link.href}
                              className={cn(
                                "text-sm   transition-colors",
                                isDark
                                  ? "text-neutral-400 hover:text-white"
                                  : "text-neutral-600 hover:text-neutral-900"
                              )}
                            >
                              {link.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div> */}
                  </div>
                </div>

                {/* Divider */}
                <div
                  className={cn(
                    "h-px mb-6",
                    isDark ? "bg-neutral-800" : "bg-neutral-200"
                  )}
                />

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Copyright */}
                  <p
                    className={cn(
                      "text-sm  ",
                      isDark ? "text-neutral-500" : "text-neutral-500"
                    )}
                  >
                    © 2025 Kōru. All rights reserved.
                  </p>

                  {/* Socials & Theme Toggle */}
                  <div className="flex items-center gap-4">
                    {socials.map((social) => {
                      const Icon = social.icon;
                      return (
                        <a
                          key={social.name}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            isDark
                              ? "bg-neutral-800 hover:bg-neutral-700"
                              : "bg-neutral-100 hover:bg-neutral-200"
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-4 h-4",
                              isDark ? "text-neutral-400" : "text-neutral-600"
                            )}
                          />
                        </a>
                      );
                    })}

                    {/* Theme Toggle */}
                    <div className="ml-2">
                      <ThemeToggle size="sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.footer>
      )}
    </AnimatePresence>
  );
}

