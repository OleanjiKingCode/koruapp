"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import { FloatingNav } from "@/components/shared";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import { cn } from "@/lib/utils";
import { MOCK_USER_DATA } from "@/lib/data";
import { CheckIcon, ChevronRightIcon } from "@/components/icons";
import {
  AvailabilityModal,
  TIMEZONES,
  DURATION_OPTIONS,
} from "@/components/availability-modal";
import { useAvailability } from "@/lib/hooks";

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

// Farcaster Icon
function FarcasterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 4h18v16H3V4zm2 2v12h14V6H5zm2 2h10v2H7V8zm0 4h10v2H7v-2z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
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
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
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
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

export default function EditProfilePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Form state - initialized from mock user data
  const [formData, setFormData] = useState({
    username: MOCK_USER_DATA.username,
    displayName: MOCK_USER_DATA.displayName,
    bio: MOCK_USER_DATA.bio,
    website: MOCK_USER_DATA.website,
    twitterHandle: MOCK_USER_DATA.twitterHandle,
  });

  // Availability
  const { availability, setAvailability, filledSlots, hasAvailability } =
    useAvailability();
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const selectedTimezone =
    TIMEZONES.find((tz) => tz.value === availability.timezone) || TIMEZONES[0];

  const [isFarcasterConnected, setIsFarcasterConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConnectFarcaster = () => {
    // Simulate Farcaster connection flow
    setIsFarcasterConnected(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen">
      <FloatingNav />

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-koru-lime/20 to-koru-lime/5 border border-koru-lime/30 shadow-lg shadow-koru-lime/10 backdrop-blur-xl">
              <div className="w-8 h-8 rounded-full bg-koru-lime/20 flex items-center justify-center">
                <CheckIcon className="w-5 h-5 text-koru-lime" />
              </div>
              <span className="  font-semibold text-koru-lime">
                Profile updated successfully!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-container mx-auto px-4 sm:px-6 pt-8 pb-48">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-koru-purple transition-colors mb-6 group"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className=" ">Back to Profile</span>
          </Link>

          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl   text-neutral-900 dark:text-neutral-100">
                Edit Profile
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400  ">
                Customize how others see you on Koru
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Preview (Sticky) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="lg:sticky lg:top-8 space-y-6">
              {/* Profile Picture */}
              <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-soft">
                <h3 className="  text-lg text-neutral-900 dark:text-neutral-100 mb-4">
                  Profile Picture
                </h3>

                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-full border-4 border-koru-purple/20 shadow-xl overflow-hidden bg-white dark:bg-neutral-800">
                    <AvatarGenerator seed={MOCK_USER_DATA.address} size={128} />
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-soft">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="  text-lg text-neutral-900 dark:text-neutral-100">
                    Live Preview
                  </h3>
                  <span className="text-xs text-koru-purple   font-medium px-2 py-1 rounded-full bg-koru-purple/10">
                    Real-time
                  </span>
                </div>

                {/* Mini Profile Card Preview */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-koru-purple/10 via-koru-golden/5 to-koru-lime/10 p-4 border border-neutral-200/50 dark:border-neutral-700/50">
                  {/* Mini Banner */}
                  <div className="h-16 -mx-4 -mt-4 mb-4 bg-gradient-to-r from-koru-purple via-koru-golden/50 to-koru-lime/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2),transparent_50%)]" />
                  </div>

                  <div className="flex items-start gap-3 -mt-10 relative z-10">
                    <div className="w-16 h-16 rounded-full border-3 border-white dark:border-neutral-800 shadow-lg overflow-hidden">
                      <AvatarGenerator
                        seed={MOCK_USER_DATA.address}
                        size={64}
                      />
                    </div>
                    <div className="pt-8">
                      <h4 className="  font-bold text-neutral-900 dark:text-neutral-100">
                        {formData.displayName || "Display Name"}
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        @{formData.username || "username"}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-3 line-clamp-2">
                    {formData.bio || "Your bio will appear here..."}
                  </p>

                  {/* Badges preview */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {MOCK_USER_DATA.badges.slice(0, 2).map((badge) => (
                      <span
                        key={badge}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-koru-purple/10 text-koru-purple"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Basic Info */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 shadow-soft">
              <h3 className="  text-xl text-neutral-900 dark:text-neutral-100 mb-6">
                Basic Information
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Username */}
                <div className="space-y-2">
                  <label className="block text-sm   font-medium text-neutral-700 dark:text-neutral-300">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                      @
                    </span>
                    <Input
                      value={formData.username}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
                      className="pl-8 h-12 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 focus:border-koru-purple focus:ring-koru-purple/20"
                      placeholder="username"
                    />
                  </div>
                </div>

                {/* Display Name */}
                <div className="space-y-2">
                  <label className="block text-sm   font-medium text-neutral-700 dark:text-neutral-300">
                    Display Name
                  </label>
                  <Input
                    value={formData.displayName}
                    onChange={(e) =>
                      handleInputChange("displayName", e.target.value)
                    }
                    className="h-12 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 focus:border-koru-purple focus:ring-koru-purple/20"
                    placeholder="Your display name"
                  />
                </div>

                {/* Bio - Full width */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm   font-medium text-neutral-700 dark:text-neutral-300">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    rows={4}
                    className="w-full rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:border-koru-purple focus:ring-1 focus:ring-koru-purple/20 p-4 text-sm resize-none transition-colors  "
                    placeholder="Tell the world about yourself..."
                    maxLength={160}
                  />
                  <p className="text-xs text-neutral-400 text-right">
                    {formData.bio.length}/160 characters
                  </p>
                </div>

                {/* Website */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm   font-medium text-neutral-700 dark:text-neutral-300">
                    Website
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      value={formData.website}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      className="pl-11 h-12 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 focus:border-koru-purple focus:ring-koru-purple/20"
                      placeholder="https://your-website.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Connect Farcaster */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 shadow-soft overflow-hidden relative">
              {/* Farcaster branding background */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-purple-100 dark:from-purple-900/20 to-transparent rounded-full opacity-50" />
              <div className="absolute -right-10 -top-10 w-40 h-40 flex items-center justify-center opacity-5">
                <FarcasterIcon className="w-32 h-32" />
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                      <FarcasterIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="  text-xl text-neutral-900 dark:text-neutral-100">
                        Connect Farcaster
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400  ">
                        Link your Farcaster account for extra reach
                      </p>
                    </div>
                  </div>

                  {isFarcasterConnected && (
                    <Badge className="bg-purple-500/20 text-purple-500 border-0">
                      <CheckIcon className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </div>

                {isFarcasterConnected ? (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/30">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                      <FarcasterIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="  font-semibold text-neutral-900 dark:text-neutral-100">
                        @{MOCK_USER_DATA.username}.eth
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Your Farcaster account is linked
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFarcasterConnected(false)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400  ">
                      Connect your Farcaster account to expand your reach and
                      share your profile as casts to the Farcaster community.
                    </p>

                    <Button
                      onClick={handleConnectFarcaster}
                      className="w-full h-14 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl   font-semibold text-base group"
                    >
                      <FarcasterIcon className="w-5 h-5 mr-3" />
                      Connect Farcaster
                      <ChevronRightIcon className="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Availability Settings */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-koru-lime/10 flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-koru-lime" />
                  </div>
                  <div>
                    <h3 className="text-xl text-neutral-900 dark:text-neutral-100">
                      Availability
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {selectedTimezone.label} ({selectedTimezone.offset})
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setAvailabilityModalOpen(true)}
                  className="bg-koru-purple hover:bg-koru-purple/90"
                >
                  {hasAvailability ? "Edit times" : "Set times"}
                </Button>
              </div>

              {/* Configured Slots */}
              {hasAvailability ? (
                <div className="space-y-3">
                  {filledSlots.map((slot) => {
                    const durationLabel =
                      DURATION_OPTIONS.find((d) => d.value === slot.duration)
                        ?.label || `${slot.duration} min`;
                    return (
                      <div
                        key={slot.id}
                        className="flex items-center gap-3 p-4 rounded-xl bg-koru-lime/5 border border-koru-lime/20"
                      >
                        <div className="w-10 h-10 rounded-full bg-koru-lime/20 flex items-center justify-center">
                          <ClockIcon className="w-5 h-5 text-koru-lime" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            {slot.name}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {durationLabel} · {slot.times.length} time slot
                            {slot.times.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                          {slot.times.slice(0, 4).map((time) => (
                            <span
                              key={time}
                              className="text-xs font-mono px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                            >
                              {time}
                            </span>
                          ))}
                          {slot.times.length > 4 && (
                            <span className="text-xs px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                              +{slot.times.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 p-8 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border-2 border-dashed border-neutral-200 dark:border-neutral-700">
                  <ClockIcon className="w-8 h-8 text-neutral-300 dark:text-neutral-600" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      No availability set yet
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                      Click &quot;Set times&quot; to configure your available
                      slots
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Wallet Info (Read-only) */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 shadow-soft">
              <h3 className="  text-xl text-neutral-900 dark:text-neutral-100 mb-6">
                Wallet Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-koru-purple/5 to-koru-golden/5 border border-koru-purple/10">
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                      Connected Wallet
                    </p>
                    <p className="font-mono text-sm text-neutral-900 dark:text-neutral-100">
                      {MOCK_USER_DATA.address}
                    </p>
                  </div>
                  <Badge className="bg-koru-lime/20 text-koru-lime border-0">
                    <CheckIcon className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 text-center">
                    <p className="text-2xl   text-koru-purple">
                      {MOCK_USER_DATA.level}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Level
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 text-center">
                    <p className="text-2xl   text-koru-golden">
                      {MOCK_USER_DATA.points.toLocaleString()}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Points
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 text-center">
                    <p className="text-2xl   text-koru-lime">
                      {MOCK_USER_DATA.badges.length}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Badges
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-end gap-4 pt-4"
            >
              <Link href="/profile">
                <Button variant="outline" size="lg" className="px-8">
                  Cancel
                </Button>
              </Link>
              <Button
                size="lg"
                className="px-10 bg-gradient-to-r from-koru-purple to-koru-purple/80 hover:from-koru-purple/90 hover:to-koru-purple/70"
                onClick={handleSave}
                isLoading={isSaving}
              >
                {!isSaving && <CheckIcon className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Spacer before footer */}
      <div className="h-32" />

      {/* Availability Modal */}
      <AvailabilityModal
        open={availabilityModalOpen}
        onOpenChange={setAvailabilityModalOpen}
        initialData={availability}
        onSave={setAvailability}
      />

      <Footer />
    </div>
  );
}
