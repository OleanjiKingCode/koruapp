"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  WalletIcon,
  SearchIcon,
  ContractIcon,
  ProfileIcon,
} from "@/components/icons";

const navItems = [
  { name: "Discover", href: "/discover" },
  { name: "Appeals", href: "/appeals" },
  { name: "Profile", href: "/profile" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="w-full max-w-container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl   text-neutral-900 dark:text-neutral-100">
              Kōru
            </span>
          </Link>

          {/* Center Nav */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/50 rounded-full p-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    className={cn(
                      "px-5 py-2 rounded-full text-sm   font-medium transition-colors relative",
                      isActive
                        ? "text-white"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-koru-purple rounded-full"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <span className="relative z-10">{item.name}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 rounded-full bg-koru-purple/10 border border-koru-purple/20">
              <span className="text-xs   text-koru-purple font-medium">
                Web3
              </span>
            </div>
            <Button variant="outline" size="sm" className="rounded-full">
              <WalletIcon className="w-4 h-4 mr-2" />
              0x1a2b...3c4d
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-t border-neutral-200/50 dark:border-neutral-800/50 safe-area-pb">
        <div className="flex items-center justify-around h-16 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <motion.div
                  className={cn(
                    "flex flex-col items-center gap-1 py-2",
                    isActive
                      ? "text-koru-purple"
                      : "text-neutral-500 dark:text-neutral-400"
                  )}
                  whileTap={{ scale: 0.9 }}
                >
                  <NavIcon name={item.name} className="w-5 h-5" />
                  <span className="text-xs   font-medium">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacers */}
      <div className="hidden md:block h-16" />
      <div className="md:hidden h-0" />
    </>
  );
}

function NavIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "Discover":
      return <SearchIcon className={className} />;
    case "Appeals":
      return <ContractIcon className={className} />;
    case "Profile":
      return <ProfileIcon className={className} />;
    default:
      return null;
  }
}






