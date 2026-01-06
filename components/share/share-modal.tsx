"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toPng } from "html-to-image";
import { ProfileShareCard } from "./profile-share-card";
import { AppealShareCard } from "./appeal-share-card";
import {
  CheckIcon,
  TwitterIcon,
  DownloadIcon,
  CopyIcon,
  CloseIcon,
} from "@/components/icons";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import type { UserData, Summon, Appeal } from "@/lib/types";

type CardType = "profile" | "summon" | "appeal"; // appeal for backwards compatibility
type CardVariant =
  | "default"
  | "minimal"
  | "gradient"
  | "neon"
  | "ticket"
  | "compact"
  | "vibrant"
  | "dark";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: CardType;
  userData?: UserData;
  summon?: Summon;
  appeal?: Appeal; // Backwards compatibility alias
}

export function ShareModal({
  open,
  onOpenChange,
  type,
  userData,
  summon,
  appeal, // Backwards compatibility
}: ShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedVariant, setSelectedVariant] =
    useState<CardVariant>("default");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 640px)");

  // Use summon or appeal (for backwards compatibility)
  const activeSummon = summon || appeal;

  const profileVariants: CardVariant[] = [
    "default",
    "minimal",
    "gradient",
    "neon",
    "ticket",
  ];
  const summonVariants: CardVariant[] = [
    "default",
    "compact",
    "vibrant",
    "dark",
  ];
  const variants = type === "profile" ? profileVariants : summonVariants;

  const variantLabels: Record<CardVariant, string> = {
    default: "Premium",
    minimal: "Minimal",
    gradient: "Gradient",
    neon: "Neon",
    ticket: "Ticket",
    compact: "Compact",
    vibrant: "Vibrant",
    dark: "Dark",
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  const generateImage = useCallback(async () => {
    if (!cardRef.current) return null;

    setIsGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });

      return dataUrl;
    } catch (error) {
      console.error("Error generating image:", error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    const link = document.createElement("a");
    link.download =
      type === "profile"
        ? `koru-profile-${userData?.username || "card"}.png`
        : `koru-appeal-${appeal?.targetHandle || "card"}.png`;
    link.href = dataUrl;
    link.click();

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  }, [generateImage, type, userData, appeal]);

  const handleCopyImage = useCallback(async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      handleDownload();
    }
  }, [generateImage, handleDownload]);

  const handleShareToX = useCallback(async () => {
    const text =
      type === "profile"
        ? `Check out my Koru profile!\n\n${userData?.points.toLocaleString()} points | ${
            userData?.level
          } level | ${userData?.badges.length} badges\n\n`
        : `Appeal for @${appeal?.targetHandle} on Koru!\n\n"${
            appeal?.request
          }"\n\n$${appeal?.totalPledged.toLocaleString()} pledged by ${
            appeal?.backers
          } backers\n\n`;

    const url = `https://koruapp.xyz/${
      type === "profile" ? "profile" : "appeals"
    }`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(url)}`;

    window.open(tweetUrl, "_blank", "width=550,height=420");
  }, [type, userData, appeal]);

  const actionButtons = [
    {
      id: "twitter",
      icon: TwitterIcon,
      label: "Share",
      onClick: handleShareToX,
      className: "bg-black text-white hover:bg-neutral-800",
      activeIcon: null,
      activeLabel: null,
      isActive: false,
    },
    {
      id: "copy",
      icon: CopyIcon,
      label: "Copy",
      onClick: handleCopyImage,
      className:
        "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700",
      activeIcon: CheckIcon,
      activeLabel: "Copied!",
      isActive: copied,
    },
    {
      id: "download",
      icon: DownloadIcon,
      label: "Save",
      onClick: handleDownload,
      className:
        "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700",
      activeIcon: CheckIcon,
      activeLabel: "Done!",
      isActive: downloaded,
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => onOpenChange(false)}
          />

          {/* Modal Container */}
          <motion.div
            initial={isDesktop ? { opacity: 0, scale: 0.95 } : { y: "100%" }}
            animate={isDesktop ? { opacity: 1, scale: 1 } : { y: 0 }}
            exit={isDesktop ? { opacity: 0, scale: 0.95 } : { y: "100%" }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className={`
              fixed z-50 bg-white dark:bg-neutral-900
              ${
                isDesktop
                  ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-3xl shadow-2xl max-w-lg w-full mx-4"
                  : "bottom-0 left-0 right-0 rounded-t-3xl shadow-2xl max-h-[85vh]"
              }
            `}
          >
            {/* Drawer handle for mobile */}
            {!isDesktop && (
              <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-neutral-900 rounded-t-3xl z-10">
                <div className="w-10 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full" />
              </div>
            )}

            <div
              className={`
                flex flex-col items-center overflow-y-auto
                ${isDesktop ? "p-6 max-h-[85vh]" : "px-4 pb-6 pt-2"}
              `}
              style={{ maxHeight: isDesktop ? "85vh" : "calc(85vh - 16px)" }}
            >
              {/* Close Button - Top right on desktop */}
              {isDesktop && (
                <button
                  onClick={() => onOpenChange(false)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors z-10"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              )}

              {/* Style Selector Pills - Scrollable on mobile */}
              <div className="w-full mb-4">
                <div className="overflow-x-auto scrollbar-hide pb-1">
                  <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full p-1 w-fit mx-auto min-w-max">
                    {variants.map((v) => (
                      <button
                        key={v}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                          selectedVariant === v
                            ? "bg-koru-purple text-white shadow-md"
                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        }`}
                      >
                        {variantLabels[v]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Preview - Scaled on mobile */}
              <div
                className={`
                  relative flex-shrink-0 mb-4
                  ${!isDesktop ? "w-full flex justify-center" : ""}
                `}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedVariant}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="shadow-xl shadow-black/20 rounded-xl overflow-hidden"
                    style={{
                      transform: !isDesktop ? "scale(0.65)" : "scale(0.85)",
                      transformOrigin: "top center",
                      marginBottom: !isDesktop ? "-80px" : "-40px",
                    }}
                  >
                    {type === "profile" && userData && (
                      <ProfileShareCard
                        ref={cardRef}
                        userData={userData}
                        variant={
                          selectedVariant as
                            | "default"
                            | "minimal"
                            | "gradient"
                            | "neon"
                            | "ticket"
                        }
                      />
                    )}
                    {(type === "summon" || type === "appeal") &&
                      activeSummon && (
                        <AppealShareCard
                          ref={cardRef}
                          appeal={activeSummon}
                          variant={
                            selectedVariant as
                              | "default"
                              | "compact"
                              | "vibrant"
                              | "dark"
                          }
                        />
                      )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Action Buttons - Horizontal row */}
              <div className="flex items-center justify-center gap-2 w-full">
                {actionButtons.map((button) => {
                  const Icon =
                    button.isActive && button.activeIcon
                      ? button.activeIcon
                      : button.icon;
                  const label =
                    button.isActive && button.activeLabel
                      ? button.activeLabel
                      : button.label;

                  return (
                    <button
                      key={button.id}
                      onClick={button.onClick}
                      disabled={isGenerating}
                      className={`
                        flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-medium
                        shadow-sm transition-all flex-1 max-w-[120px]
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${button.className}
                        ${
                          button.isActive
                            ? "!bg-koru-lime/20 !text-koru-lime !border-koru-lime/30"
                            : ""
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Cancel Button for mobile */}
              {!isDesktop && (
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-full py-3 mt-3 text-neutral-500 text-sm font-medium hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                >
                  Cancel
                </button>
              )}

              {/* Loading Indicator */}
              <AnimatePresence>
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none bg-white/90 dark:bg-neutral-900/90 rounded-3xl z-20"
                  >
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl px-5 py-3 shadow-xl flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-koru-purple/20 border-t-koru-purple animate-spin" />
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Generating...
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ShareModal;
