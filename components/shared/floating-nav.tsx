"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { usePrivy } from "@privy-io/react-auth";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, FONT_OPTIONS, LANGUAGE_OPTIONS, STORAGE_KEYS } from "@/lib/constants";
import {
  useMounted,
  useScrollPosition,
  useFontPreference,
  useUnreadCount,
  formatUnreadCount,
} from "@/lib/hooks";
import { useModalContext } from "@/lib/contexts/modal-context";
import { LoginModal } from "@/components/auth";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import {
  HomeIcon,
  DiscoverIcon,
  SummonsIcon,
  ProfileIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon,
  HelpCircleIcon,
  ChevronRightIcon,
  ChatIcon,
  BellIcon,
  LogoutIcon,
  XIcon,
  ShieldIcon,
  ContractIcon,
  EditIcon,
  SparkleIcon,
  SearchIcon,
} from "@/components/icons";

// Protected routes that require authentication
const PROTECTED_ROUTES = ["/profile", "/chats", "/chat", "/notifications"];

// Nav items to hide when not authenticated
const HIDDEN_WHEN_UNAUTHENTICATED = ["chats"];

// Map icon names to components
const iconMap = {
  home: HomeIcon,
  discover: DiscoverIcon,
  chats: ChatIcon,
  summons: SummonsIcon,
  profile: ProfileIcon,
};

// Map "other" pages to contextual icons
const contextualPageIcons: Record<string, { icon: typeof HomeIcon; label: string; color: string }> = {
  "/how-it-works": { icon: HelpCircleIcon, label: "How It Works", color: "text-koru-purple" },
  "/faq": { icon: SearchIcon, label: "FAQ", color: "text-koru-golden" },
  "/contact": { icon: ChatIcon, label: "Contact", color: "text-koru-lime" },
  "/notifications": { icon: BellIcon, label: "Notifications", color: "text-koru-purple" },
  "/privacy": { icon: ShieldIcon, label: "Privacy", color: "text-koru-lime" },
  "/terms": { icon: ContractIcon, label: "Terms", color: "text-koru-golden" },
  "/login": { icon: XIcon, label: "Login", color: "text-white" },
  "/sign-in": { icon: XIcon, label: "Sign In", color: "text-white" },
  "/profile/edit": { icon: EditIcon, label: "Edit Profile", color: "text-koru-purple" },
};

// Helper to find contextual icon for current path
function getContextualIcon(pathname: string) {
  // Exact match first
  if (contextualPageIcons[pathname]) {
    return contextualPageIcons[pathname];
  }
  // Check for partial matches (e.g., /summons/[id])
  for (const [path, config] of Object.entries(contextualPageIcons)) {
    if (pathname.startsWith(path)) {
      return config;
    }
  }
  // Default for unknown pages
  return { icon: SparkleIcon, label: "Page", color: "text-koru-purple" };
}

export function FloatingNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  const {
    ready: privyReady,
    authenticated: privyAuthenticated,
    user: privyUser,
    logout: privyLogout,
  } = usePrivy();

  const getWalletAddress = (): string | null => {
    if (!privyUser) return null;
    const walletAccount = privyUser.linkedAccounts?.find(
      (account: { type: string }) => account.type === "wallet"
    );
    if (walletAccount && "address" in walletAccount) {
      return walletAccount.address as string;
    }
    if (privyUser.wallet?.address) {
      return privyUser.wallet.address;
    }
    return null;
  };

  const walletAddress = getWalletAddress();
  const shortenAddress = (address: string) =>
    `${address.slice(0, 4)}...${address.slice(-4)}`;

  const mounted = useMounted();
  const { isNearBottom } = useScrollPosition({ bottomThreshold: 200 });
  const { font: selectedFont, applyFont } = useFontPreference();
  const unreadCounts = useUnreadCount();
  const { isModalOpen } = useModalContext();

  const isAuthenticated = status === "authenticated";

  // Hide nav when modal/drawer is open on mobile
  if (isModalOpen) {
    return null;
  }

  // Filter nav items based on auth status
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (
      !isAuthenticated &&
      HIDDEN_WHEN_UNAUTHENTICATED.includes(item.iconName)
    ) {
      return false;
    }
    return true;
  });

  // Handle protected route navigation
  const handleNavClick = (href: string, e: React.MouseEvent) => {
    if (
      PROTECTED_ROUTES.some((route) => href.startsWith(route)) &&
      !isAuthenticated
    ) {
      e.preventDefault();
      setPendingRoute(href);
      setShowLoginModal(true);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
    setIsSettingsOpen(false);
  };

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
      JSON.parse(localStorage.getItem(STORAGE_KEYS.FONT_PREFERENCE) || '"quicksand"') ??
      "quicksand";
    applyFont(savedFont, true);
  }, [pathname, mounted, applyFont]);

  const handleFontChange = (fontValue: string) => {
    // Always apply the font change
    applyFont(fontValue, true);
  };

  if (!mounted) return null;

  const isDark = theme === "dark";

  // Find active item index for mobile nav (using visible items)
  const activeIndex = visibleNavItems.findIndex(
    (item) => pathname === item.href
  );

  // Get contextual icon for "other" pages
  const contextualPage = activeIndex === -1 ? getContextualIcon(pathname) : null;

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
                {/* Notch/Bubble cutout effect for main nav items */}
                {activeIndex >= 0 && (
                  <motion.div
                    layoutId="mobile-notch"
                    className={cn(
                      "absolute -top-5 w-16 h-16 rounded-full flex items-center justify-center",
                      isDark
                        ? "bg-neutral-900"
                        : "bg-neutral-100 border border-neutral-200"
                    )}
                    style={{
                      left: `${activeIndex * 52 + 16}px`,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    {/* Inner active circle */}
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        isDark ? "bg-neutral-700" : "bg-neutral-900"
                      )}
                    >
                      {visibleNavItems[activeIndex] &&
                        (() => {
                          const Icon =
                            iconMap[
                            visibleNavItems[activeIndex]
                              .iconName as keyof typeof iconMap
                            ];
                          return <Icon className="w-6 h-6 text-white" />;
                        })()}
                    </div>
                  </motion.div>
                )}


                {/* Nav Items */}
                {visibleNavItems.map((item, index) => {
                  const isActive = pathname === item.href;
                  const Icon = iconMap[item.iconName as keyof typeof iconMap];
                  const showBadge =
                    item.iconName === "chats" && unreadCounts.chats > 0;
                  const isProtected = PROTECTED_ROUTES.some((route) =>
                    item.href.startsWith(route)
                  );
                  const isProfileItem = item.iconName === "profile";
                  const showUserImage =
                    isProfileItem && isAuthenticated && session?.user?.image;
                  const showWalletInfo = isProfileItem && privyReady && walletAddress;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      passHref
                      onClick={(e) => handleNavClick(item.href, e)}
                    >
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className={cn(
                          "relative flex items-center justify-center mx-1.5 rounded-full transition-all cursor-pointer",
                          showWalletInfo ? "px-2 gap-1.5" : "w-10 h-10",
                          isActive
                            ? "opacity-0" // Hide the inline button when active (shown in bubble)
                            : isDark
                              ? "text-neutral-400 hover:text-white"
                              : "text-neutral-500 hover:text-neutral-900"
                        )}
                      >
                        {showWalletInfo ? (
                          <div className="flex items-center gap-2">
                            <>
                              {session?.user?.image ? (
                                <img
                                  src={session.user.image}
                                  alt={session.user.name || "Profile"}
                                  className="w-5 h-5 rounded-full object-cover ring-1 ring-neutral-300 dark:ring-neutral-600"
                                />
                              ) :
                                (<Icon className="w-5 h-5" />)}</>

                            <span className="font-mono text-xs">
                              {shortenAddress(walletAddress)}
                            </span>
                          </div>
                        ) : showUserImage ? (
                          <img
                            src={session.user.image}
                            alt={session.user.name || "Profile"}
                            className="w-7 h-7 rounded-full object-cover ring-2 ring-neutral-200 dark:ring-neutral-700"
                          />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                        {/* Unread Badge */}
                        {showBadge && !isActive && (
                          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-lg animate-pulse">
                            {formatUnreadCount(unreadCounts.chats)}
                          </span>
                        )}
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

                {/* Mobile Contextual Page Icon - with gap separator */}
                <AnimatePresence>
                  {contextualPage && (
                    <>
                      {/* Visual gap/separator */}
                      <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-600 mx-2" />

                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      >
                        <motion.div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center cursor-pointer",
                            isDark
                              ? "bg-neutral-700/50"
                              : "bg-neutral-100"
                          )}
                          whileTap={{ scale: 0.9 }}
                        >
                          {(() => {
                            const Icon = contextualPage.icon;
                            return (
                              <motion.div
                                initial={{ rotate: -90 }}
                                animate={{ rotate: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                              >
                                <Icon className={cn("w-5 h-5", contextualPage.color)} />
                              </motion.div>
                            );
                          })()}
                        </motion.div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
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
                    ? " text-white"
                    : " text-neutral-900"
                )}
              >
                Kōru
              </div>

              {/* Nav Items */}
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.href;
                const isHovered = hoveredItem === item.href;
                const Icon = iconMap[item.iconName as keyof typeof iconMap];
                const showBadge =
                  item.iconName === "chats" && unreadCounts.chats > 0;
                const isProtected = PROTECTED_ROUTES.some((route) =>
                  item.href.startsWith(route)
                );
                const isProfileItem = item.iconName === "profile";
                const showUserImage =
                  isProfileItem && isAuthenticated && session?.user?.image;
                const showWalletInfo = isProfileItem && privyReady && walletAddress;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    passHref
                    onClick={(e) => handleNavClick(item.href, e)}
                  >
                    <motion.button
                      layout
                      onMouseEnter={() => setHoveredItem(item.href)}
                      onMouseLeave={() => setHoveredItem(null)}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "relative flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer overflow-hidden",
                        isActive
                          ? isDark
                            ? "bg-neutral-800 text-white border border-neutral-700"
                            : "bg-neutral-900 text-white border border-neutral-800"
                          : isDark
                            ? "bg-neutral-800/50 text-neutral-300 hover:bg-neutral-800"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      )}
                    >
                      {showWalletInfo ? (
                        <div className="flex items-center gap-2">
                          <>
                            {session?.user?.image ? (<img
                              src={session.user.image}
                              alt={session.user.name || "Profile"}
                              className="w-5 h-5 rounded-full object-cover ring-1 ring-neutral-300 dark:ring-neutral-600"
                            />) :
                              (<AnimatePresence mode="popLayout">
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
                              </AnimatePresence>)}</>

                          <span className="font-mono text-xs">
                            {shortenAddress(walletAddress)}
                          </span>
                        </div>
                      ) : showUserImage ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || "Profile"}
                          className="w-5 h-5 rounded-full object-cover ring-1 ring-neutral-300 dark:ring-neutral-600"
                        />
                      ) : (
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
                      )}
                      {!showWalletInfo && <span>{item.name}</span>}

                      {showBadge && (
                        <span className="min-w-[20px] h-5 flex items-center justify-center px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full ml-1">
                          {formatUnreadCount(unreadCounts.chats)}
                        </span>
                      )}
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

              {/* Desktop Contextual Page Icon - with gap separator */}
              <AnimatePresence>
                {contextualPage && (
                  <>
                    {/* Visual gap/separator */}
                    <div className="w-px h-8 bg-neutral-300 dark:bg-neutral-700 mx-2" />

                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <motion.div
                        className={cn(
                          "p-3 rounded-xl cursor-pointer",
                          isDark
                            ? "bg-neutral-800/50"
                            : "bg-neutral-100"
                        )}
                        whileHover={{ scale: 1.05 }}
                      >
                        {(() => {
                          const Icon = contextualPage.icon;
                          return (
                            <motion.div
                              initial={{ rotate: -90 }}
                              animate={{ rotate: 0 }}
                              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                            >
                              <Icon className={cn("w-4 h-4", contextualPage.color)} />
                            </motion.div>
                          );
                        })()}
                      </motion.div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
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
                  "p-4 sm:p-5 rounded-2xl shadow-2xl max-h-[70vh] overflow-y-auto scrollbar-none",
                  "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
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
                      {unreadCounts.notifications > 0 && (
                        <span className="text-[10px] sm:text-xs font-medium text-koru-purple bg-koru-purple/10 px-1.5 sm:px-2 py-0.5 rounded-full">
                          {formatUnreadCount(unreadCounts.notifications)} new
                        </span>
                      )}
                      <ChevronRightIcon className="w-4 h-4" />
                    </div>
                  </Link>
                </div>

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


                <div className="mt-6" />
                {privyReady && walletAddress && (
                  <div className="mb-4">
                    <div
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl",
                        isDark
                          ? "bg-koru-lime/10 border border-koru-lime/20"
                          : "bg-koru-lime/10 border border-koru-lime/20"
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-koru-purple to-koru-lime flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {walletAddress.slice(2, 4).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            isDark ? "text-white" : "text-neutral-900"
                          )}
                        >
                          Wallet Connected
                        </p>
                        <p
                          className={cn(
                            "text-xs font-mono truncate",
                            isDark ? "text-neutral-400" : "text-neutral-500"
                          )}
                        >
                          {shortenAddress(walletAddress)} • Base
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await privyLogout();
                          } catch (error) {
                            console.error("Error disconnecting wallet:", error);
                          }
                          setIsSettingsOpen(false);
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
                {isAuthenticated && session?.user ? (
                  <div className="space-y-3">
                    {/* User Info */}
                    <div
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl",
                        isDark ? "bg-neutral-800" : "bg-neutral-100"
                      )}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700">
                        {session.user.image ? (
                          <img
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <AvatarGenerator
                            seed={session.user.id || "user"}
                            size={40}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm font-medium truncate",
                            isDark ? "text-white" : "text-neutral-900"
                          )}
                        >
                          {session.user.name || "User"}
                        </p>
                        {session.user.username && (
                          <p
                            className={cn(
                              "text-xs truncate",
                              isDark ? "text-neutral-400" : "text-neutral-500"
                            )}
                          >
                            @{session.user.username}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className={cn(
                        "flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
                        isDark
                          ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      )}
                    >
                      <LogoutIcon className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setPendingRoute("/profile");
                      setShowLoginModal(true);
                    }}
                    className={cn(
                      "flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-sm font-medium transition-all",
                      "bg-neutral-900 text-white hover:bg-neutral-800",
                      "dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                    )}
                  >
                    <XIcon className="w-4 h-4" />
                    Sign in with X
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        callbackUrl={pendingRoute || "/profile"}
        title="Sign in to continue"
        description="Connect your X account to access all features"
      />
    </>
  );
}

