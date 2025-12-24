"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toPng, toJpeg } from "html-to-image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileShareCard } from "./profile-share-card";
import { AppealShareCard } from "./appeal-share-card";
import { CheckIcon, TwitterIcon } from "@/components/icons";
import type { UserData, Appeal } from "@/lib/types";

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

function ImageIcon({ className }: { className?: string }) {
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
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
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
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

type CardType = "profile" | "appeal";
type CardVariant =
  | "default"
  | "minimal"
  | "gradient"
  | "neon"
  | "compact"
  | "vibrant"
  | "dark";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: CardType;
  userData?: UserData;
  appeal?: Appeal;
}

export function ShareModal({
  open,
  onOpenChange,
  type,
  userData,
  appeal,
}: ShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedVariant, setSelectedVariant] =
    useState<CardVariant>("default");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const profileVariants: CardVariant[] = [
    "default",
    "minimal",
    "gradient",
    "neon",
  ];
  const appealVariants: CardVariant[] = [
    "default",
    "compact",
    "vibrant",
    "dark",
  ];
  const variants = type === "profile" ? profileVariants : appealVariants;

  const variantLabels: Record<CardVariant, string> = {
    default: "Premium",
    minimal: "Minimal",
    gradient: "Gradient",
    neon: "Neon",
    compact: "Compact",
    vibrant: "Vibrant",
    dark: "Dark",
  };

  const generateImage = useCallback(async () => {
    if (!cardRef.current) return null;

    setIsGenerating(true);
    try {
      // Wait for any animations to complete
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
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      // Fallback: download the image
      handleDownload();
    }
  }, [generateImage, handleDownload]);

  const handleShareToX = useCallback(async () => {
    const text =
      type === "profile"
        ? `Check out my Koru profile! 🌀\n\n${userData?.points.toLocaleString()} points • ${
            userData?.level
          } level • ${userData?.badges.length} badges\n\n`
        : `🔔 Appeal for @${appeal?.targetHandle} on Koru!\n\n"${
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-tenor flex items-center gap-3">
              Share Your {type === "profile" ? "Profile" : "Appeal"}
            </DialogTitle>
            <DialogDescription className="text-neutral-500 dark:text-neutral-400">
              Choose a style and share your card on social media
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          {/* Style Selector */}
          <div className="mb-6">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-koru-purple" />
              Choose a style
            </p>
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedVariant === v
                      ? "bg-koru-purple text-white shadow-lg shadow-koru-purple/25"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                >
                  {variantLabels[v]}
                </button>
              ))}
            </div>
          </div>

          {/* Card Preview */}
          <div className="mb-6 overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-6">
            <div className="flex justify-center overflow-x-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedVariant}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
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
                      }
                    />
                  )}
                  {type === "appeal" && appeal && (
                    <AppealShareCard
                      ref={cardRef}
                      appeal={appeal}
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
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            {/* Share to X */}
            <Button
              onClick={handleShareToX}
              className="h-14 bg-black hover:bg-neutral-800 text-white rounded-xl font-quicksand font-semibold group"
            >
              <TwitterIcon className="w-5 h-5 mr-2" />
              Share on X
            </Button>

            {/* Copy Image */}
            <Button
              onClick={handleCopyImage}
              disabled={isGenerating}
              variant="outline"
              className="h-14 rounded-xl font-quicksand font-semibold group relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.span
                    key="copied"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center text-koru-lime"
                  >
                    <CheckIcon className="w-5 h-5 mr-2" />
                    Copied!
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center"
                  >
                    <CopyIcon className="w-5 h-5 mr-2" />
                    Copy Image
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            {/* Download */}
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              variant="outline"
              className="h-14 rounded-xl font-quicksand font-semibold group relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {downloaded ? (
                  <motion.span
                    key="downloaded"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center text-koru-lime"
                  >
                    <CheckIcon className="w-5 h-5 mr-2" />
                    Downloaded!
                  </motion.span>
                ) : (
                  <motion.span
                    key="download"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center"
                  >
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    Download
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>

          {/* Loading overlay */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center z-50"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-4 border-koru-purple/20 border-t-koru-purple animate-spin" />
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Generating image...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer tip */}
        <div className="px-6 pb-6">
          <div className="p-4 rounded-xl bg-gradient-to-r from-koru-purple/5 to-koru-golden/5 border border-koru-purple/10">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
              💡 <span className="font-medium">Pro tip:</span> Share your card
              on X to earn bonus Koru points!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ShareModal;
