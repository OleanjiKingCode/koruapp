"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

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
    { name: "Appeals", href: "/appeals" },
    { name: "How it works", href: "/how-it-works" },
  ],
  support: [
    { name: "FAQs", href: "#" },
    { name: "Help Center", href: "#" },
    { name: "Contact", href: "#" },
  ],
  legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Policy", href: "#" },
  ],
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
    
    // Be very strict - only show when within 30px of bottom
    const pixelThreshold = 30;
    
    // Calculate scrollable height
    const scrollableHeight = documentHeight - windowHeight;
    
    // Only show footer when:
    // 1. User is within 30px of the true bottom AND has scrolled significantly
    // 2. OR page is truly short (content less than viewport) AND document is less than 1.2x viewport
    //    This prevents showing footer on pages that use min-h-screen but have little actual content
    const nearBottom = distanceFromBottom <= pixelThreshold;
    const hasScrolledEnough = scrollTop > 150;
    const pageIsTrulyShort = scrollableHeight <= 30 && documentHeight < windowHeight * 1.2;
    
    setIsVisible(
      (nearBottom && hasScrolledEnough) || 
      pageIsTrulyShort
    );
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
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
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
                  <div className="grid grid-cols-3 gap-8 md:gap-12">
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
                    <div>
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
                    </div>
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

// Social Icons
function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
