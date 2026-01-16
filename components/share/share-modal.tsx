"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toPng } from "html-to-image";
import { ProfileShareCard } from "./profile-share-card";
import { AppealShareCard } from "./appeal-share-card";
import { CheckIcon, TwitterIcon } from "@/components/icons";
import type { UserData, Summon, Appeal } from "@/lib/types";

// Custom icons
function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

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

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: CardType;
  userData?: UserData;
  summon?: Summon;
  appeal?: Appeal; // Backwards compatibility alias
  hideShareButton?: boolean; // Hide the Twitter share button (for details modal)
}

export function ShareModal({
  open,
  onOpenChange,
  type,
  userData,
  summon,
  appeal, // Backwards compatibility
  hideShareButton = false,
}: ShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedVariant, setSelectedVariant] =
    useState<CardVariant>("default");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

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

  // Convert external images to base64 to avoid CORS issues
  const convertImagesToBase64 = useCallback(async (element: HTMLElement) => {
    const images = element.querySelectorAll("img");
    const promises = Array.from(images).map(async (img) => {
      if (img.src.startsWith("data:")) return; // Already base64
      if (img.src.startsWith("/")) return; // Local images are fine
      
      try {
        // Fetch through a proxy or use crossOrigin
        const response = await fetch(img.src);
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        img.src = base64;
      } catch {
        // If fetch fails, keep original src - it might still work
        console.warn("Could not convert image to base64:", img.src);
      }
    });
    await Promise.all(promises);
  }, []);

  const generateImage = useCallback(async () => {
    if (!cardRef.current) return null;

    setIsGenerating(true);
    try {
      // Wait for images to load
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Try to convert external images to base64
      await convertImagesToBase64(cardRef.current);

      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true, // Skip external fonts to avoid issues
      });

      return dataUrl;
    } catch (error) {
      console.error("Error generating image:", error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [convertImagesToBase64]);

  const handleDownload = useCallback(async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    const link = document.createElement("a");
    link.download =
      type === "profile"
        ? `koru-profile-${userData?.username || "card"}.png`
        : `koru-summon-${activeSummon?.targetHandle || "card"}.png`;
    link.href = dataUrl;
    link.click();

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  }, [generateImage, type, userData, activeSummon]);

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
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const text =
      type === "profile"
        ? `Check out my Koru profile!\n\n${userData?.points.toLocaleString()} points • ${
            userData?.level
          } level | ${userData?.badges.length} badges\n\n`
        : `Summon for @${activeSummon?.targetHandle} on Koru!\n\n"${
            activeSummon?.request
          }"\n\n$${activeSummon?.totalPledged.toLocaleString()} pledged by ${
            activeSummon?.backers
          } backers\n\n`;

    // Use the specific summon page URL when sharing a summon
    const url =
      type === "profile"
        ? `${baseUrl}/profile`
        : `${baseUrl}/summons/${activeSummon?.id}`;

    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(url)}`;

    window.open(tweetUrl, "_blank", "width=550,height=420");
  }, [type, userData, activeSummon]);

  const handleCopyLink = useCallback(async () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const url =
      type === "profile"
        ? `${baseUrl}/profile`
        : `${baseUrl}/summons/${activeSummon?.id}`;

    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error("Error copying link:", error);
    }
  }, [type, activeSummon]);

  const allActionButtons = [
    {
      id: "twitter",
      icon: TwitterIcon,
      label: "Share",
      onClick: handleShareToX,
      className: "bg-black text-white hover:bg-neutral-800",
      activeIcon: null,
      activeLabel: null,
      isActive: false,
      hidden: hideShareButton,
    },
    {
      id: "copyLink",
      icon: LinkIcon,
      label: "Copy Link",
      onClick: handleCopyLink,
      className:
        "bg-koru-purple text-white hover:bg-koru-purple/90",
      activeIcon: CheckIcon,
      activeLabel: "Copied!",
      isActive: linkCopied,
      hidden: false,
    },
    {
      id: "copy",
      icon: CopyIcon,
      label: "Copy Image",
      onClick: handleCopyImage,
      className:
        "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700",
      activeIcon: CheckIcon,
      activeLabel: "Copied!",
      isActive: copied,
      hidden: false,
    },
    {
      id: "download",
      icon: DownloadIcon,
      label: "Download",
      onClick: handleDownload,
      className:
        "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700",
      activeIcon: CheckIcon,
      activeLabel: "Done!",
      isActive: downloaded,
      hidden: false,
    },
  ];

  const actionButtons = allActionButtons.filter((button) => !button.hidden);

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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => onOpenChange(false)}
          />

          {/* Floating Container */}
          <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-2 sm:p-4">
            <div className="pointer-events-auto flex flex-col items-center gap-3 sm:gap-4 max-h-[90vh] overflow-y-auto">
              {/* Style Selector Pills */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="flex items-center gap-1.5 sm:gap-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-full p-1 sm:p-1.5 shadow-2xl shadow-black/20"
              >
                {variants.map((v, index) => (
                  <motion.button
                    key={v}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.03 }}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                      selectedVariant === v
                        ? "bg-koru-purple text-white shadow-lg shadow-koru-purple/30"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {variantLabels[v]}
                  </motion.button>
                ))}
              </motion.div>

              {/* Card Preview */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.9 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="relative"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedVariant}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="shadow-2xl shadow-black/30 rounded-3xl overflow-hidden"
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
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
              >
                {actionButtons.map((button, index) => {
                  const Icon =
                    button.isActive && button.activeIcon
                      ? button.activeIcon
                      : button.icon;
                  const label =
                    button.isActive && button.activeLabel
                      ? button.activeLabel
                      : button.label;

                  return (
                    <motion.button
                      key={button.id}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      onClick={button.onClick}
                      disabled={isGenerating}
                      className={`
                        flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 rounded-full font-medium
                        shadow-xl shadow-black/10 transition-all
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${button.className}
                        ${
                          button.isActive
                            ? "!bg-koru-lime/20 !text-koru-lime !border-koru-lime/30"
                            : ""
                        }
                      `}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-xs sm:text-sm">{label}</span>
                    </motion.button>
                  );
                })}
              </motion.div>

              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.3 }}
                onClick={() => onOpenChange(false)}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl shadow-xl shadow-black/10 flex items-center justify-center text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
              >
                <CloseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>

              {/* Loading Indicator */}
              <AnimatePresence>
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border-2 border-koru-purple/20 border-t-koru-purple animate-spin" />
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Generating...
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ShareModal;
