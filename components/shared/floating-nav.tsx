"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, FONT_OPTIONS, LANGUAGE_OPTIONS } from "@/lib/constants";
import { useMounted, useScrollPosition, useFontPreference } from "@/lib/hooks";
import {
  HomeIcon,
  DiscoverIcon,
  AppealsIcon,
  ProfileIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon,
  HelpCircleIcon,
  ChevronRightIcon,
  ChatIcon,
  BellIcon,
} from "@/components/icons";

// Map icon names to components
const iconMap = {
  home: HomeIcon,
  discover: DiscoverIcon,
  chats: ChatIcon,
  appeals: AppealsIcon,
  profile: ProfileIcon,
};

export function FloatingNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Use custom hooks
  const mounted = useMounted();
  const { isNearBottom } = useScrollPosition({ bottomThreshold: 90 });
  const { font: selectedFont, applyFont } = useFontPreference();

  // Apply font based on route
  useEffect(() => {
    if (!mounted) return;

    if (pathname === "/") {
      document.body.classList.remove(
        "font-quicksand",
        "font-tenor",
        "font-lemon"
      );
      return;
    }

    const savedFont =
      JSON.parse(localStorage.getItem("koru-font") || '"quicksand"') ??
      "quicksand";
    applyFont(savedFont, true);
  }, [pathname, mounted, applyFont]);

  const handleFontChange = (fontValue: string) => {
    // Always apply the font change
    applyFont(fontValue, true);
  };

  if (!mounted) return null;

  const isDark = theme === "dark";

  // Find active item index for mobile nav
  const activeIndex = NAV_ITEMS.findIndex((item) => pathname === item.href);

  return (
    <>
      {/* Mobile Nav - Bubble Style */}
      <AnimatePresence>
        {!isNearBottom && (
          <motion.nav
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 sm:hidden"
          >
            <div className="relative">
              {/* Main bar */}
              <div
                className={cn(
                  "flex items-center h-14 px-4 rounded-full shadow-2xl relative",
                  isDark
                    ? "bg-neutral-800 shadow-black/50"
                    : "bg-white/90 backdrop-blur-xl border border-neutral-200 shadow-black/10"
                )}
              >
                {/* Notch/Bubble cutout effect */}
                {activeIndex >= 0 && (
                  <motion.div
                    layoutId="mobile-notch"
                    className={cn(
                      "absolute -top-5 w-16 h-16 rounded-full flex items-center justify-center",
                      isDark ? "bg-neutral-900" : "bg-neutral-100 border border-neutral-200"
                    )}
                    style={{
                      left: `${activeIndex * 52 + 16}px`,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    {/* Inner active circle */}
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      isDark ? "bg-neutral-700" : "bg-neutral-900"
                    )}>
                      {NAV_ITEMS[activeIndex] && (
                        (() => {
                          const Icon = iconMap[NAV_ITEMS[activeIndex].iconName as keyof typeof iconMap];
                          return <Icon className="w-6 h-6 text-white" />;
                        })()
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Nav Items */}
                {NAV_ITEMS.map((item, index) => {
                  const isActive = pathname === item.href;
                  const Icon = iconMap[item.iconName as keyof typeof iconMap];

                  return (
                    <Link key={item.href} href={item.href} passHref>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className={cn(
                          "w-10 h-10 flex items-center justify-center mx-1.5 rounded-full transition-all cursor-pointer",
                          isActive
                            ? "opacity-0" // Hide the inline button when active (shown in bubble)
                            : isDark
                            ? "text-neutral-400 hover:text-white"
                            : "text-neutral-500 hover:text-neutral-900"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.button>
                    </Link>
                  );
                })}

                {/* Settings Button */}
                <motion.button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center ml-1 rounded-full transition-all cursor-pointer",
                    isSettingsOpen
                      ? "text-koru-purple"
                      : isDark
                      ? "text-neutral-400 hover:text-white"
                      : "text-neutral-500 hover:text-neutral-900"
                  )}
                >
                  <SettingsIcon className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Desktop Nav */}
      <AnimatePresence>
        {!isNearBottom && (
          <motion.nav
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="fixed bottom-6 inset-x-0 z-50 justify-center px-4 hidden sm:flex"
          >
            <motion.div
              layout
              className={cn(
                "flex items-center gap-2 p-2 rounded-2xl",
                "shadow-2xl",
                isDark
                  ? "bg-neutral-900 border border-neutral-800 shadow-black/40"
                  : "bg-white border border-neutral-200 shadow-black/10"
              )}
            >
              {/* Kōru Logo */}
              <div
                className={cn(
                  "flex items-center justify-center px-4 py-2 rounded-xl text-lg font-bold",
                  isDark
                    ? "bg-neutral-800 text-white"
                    : "bg-neutral-100 text-neutral-900"
                )}
              >
                Kōru
              </div>

              {/* Nav Items */}
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const isHovered = hoveredItem === item.href;
                const Icon = iconMap[item.iconName as keyof typeof iconMap];

                return (
                  <Link key={item.href} href={item.href} passHref>
                    <motion.button
                      layout
                      onMouseEnter={() => setHoveredItem(item.href)}
                      onMouseLeave={() => setHoveredItem(null)}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer overflow-hidden",
                        isActive
                          ? isDark
                            ? "bg-neutral-800 text-white border border-neutral-700"
                            : "bg-neutral-900 text-white border border-neutral-800"
                          : isDark
                          ? "bg-neutral-800/50 text-neutral-300 hover:bg-neutral-800"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      )}
                    >
                      <AnimatePresence mode="popLayout">
                        {(isHovered || isActive) && (
                          <motion.span
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: "auto", opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <Icon className="w-4 h-4" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                      <span>{item.name}</span>
                    </motion.button>
                  </Link>
                );
              })}

              {/* Settings Button */}
              <motion.button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                whileHover={{ scale: 1.05, rotate: 15 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "p-3 rounded-xl transition-all cursor-pointer",
                  isSettingsOpen
                    ? "bg-koru-purple text-white"
                    : "bg-koru-purple/80 text-white hover:bg-koru-purple"
                )}
              >
                <SettingsIcon className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {isSettingsOpen && !isNearBottom && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsSettingsOpen(false)}
            />

            {/* Settings Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed bottom-20 sm:bottom-28 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 sm:w-80"
            >
              <div
                className={cn(
                  "p-4 sm:p-5 rounded-2xl shadow-2xl max-h-[70vh] overflow-y-auto",
                  isDark
                    ? "bg-neutral-900 border border-neutral-800 shadow-black/40"
                    : "bg-white border border-neutral-200 shadow-black/10"
                )}
              >
                <h3
                  className={cn(
                    "text-base sm:text-lg mb-4",
                    isDark ? "text-white" : "text-neutral-900"
                  )}
                >
                  Settings
                </h3>

                {/* Theme Toggle */}
                <div className="mb-4">
                  <label
                    className={cn(
                      "text-xs sm:text-sm font-medium mb-2 block",
                      isDark ? "text-neutral-400" : "text-neutral-600"
                    )}
                  >
                    Appearance
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTheme("light")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm transition-all",
                        !isDark
                          ? "bg-koru-purple text-white"
                          : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                      )}
                    >
                      <SunIcon className="w-4 h-4" />
                      Light
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm transition-all",
                        isDark
                          ? "bg-koru-purple text-white"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      )}
                    >
                      <MoonIcon className="w-4 h-4" />
                      Dark
                    </button>
                  </div>
                </div>

                {/* Font Selector */}
                <div className="mb-4">
                  <label
                    className={cn(
                      "text-xs sm:text-sm font-medium mb-2 block",
                      isDark ? "text-neutral-400" : "text-neutral-600"
                    )}
                  >
                    Font
                  </label>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {FONT_OPTIONS.map((font) => (
                      <button
                        key={font.value}
                        onClick={() => handleFontChange(font.value)}
                        className={cn(
                          "flex-1 py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm transition-all",
                          font.className,
                          selectedFont === font.value
                            ? "bg-koru-purple text-white"
                            : isDark
                            ? "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        )}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language Selector */}
                <div className="mb-4">
                  <label
                    className={cn(
                      "text-xs sm:text-sm font-medium mb-2 block",
                      isDark ? "text-neutral-400" : "text-neutral-600"
                    )}
                  >
                    Language
                  </label>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setSelectedLang(lang.code)}
                        className={cn(
                          "flex-1 py-2.5 px-2 sm:px-4 rounded-xl text-xs sm:text-sm transition-all",
                          selectedLang === lang.code
                            ? "bg-koru-golden text-neutral-900"
                            : isDark
                            ? "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        )}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notifications Link */}
                <div className="mb-4">
                  <Link
                    href="/notifications"
                    onClick={() => setIsSettingsOpen(false)}
                    className={cn(
                      "flex items-center justify-between w-full py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm transition-all",
                      isDark
                        ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    )}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <BellIcon className="w-4 h-4" />
                      <span>Notifications</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-[10px] sm:text-xs font-medium text-koru-purple bg-koru-purple/10 px-1.5 sm:px-2 py-0.5 rounded-full">
                        3 new
                      </span>
                      <ChevronRightIcon className="w-4 h-4" />
                    </div>
                  </Link>
                </div>

                {/* Divider */}
                <div
                  className={cn(
                    "h-px mb-3",
                    isDark ? "bg-neutral-800" : "bg-neutral-200"
                  )}
                />

                {/* How it Works Link */}
                <Link
                  href="/how-it-works"
                  onClick={() => setIsSettingsOpen(false)}
                  className={cn(
                    "flex items-center gap-2 sm:gap-3 py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm transition-all w-full",
                    isDark
                      ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900"
                  )}
                >
                  <HelpCircleIcon className="w-4 h-4" />
                  How Kōru Works
                  <ChevronRightIcon className="w-4 h-4 ml-auto" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
