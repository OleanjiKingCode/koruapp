"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import { BookingModal } from "@/components/booking-modal";
import { cn } from "@/lib/utils";
import { MOCK_PROFILES } from "@/lib/data";
import { ROUTES } from "@/lib/constants";
import type {
  AvailabilityData,
  AvailabilitySlot,
} from "@/components/availability-modal";

// Icons
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

function ChatIcon({ className }: { className?: string }) {
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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

function GlobeIcon({ className }: { className?: string }) {
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
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function DollarIcon({ className }: { className?: string }) {
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
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
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
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function MegaphoneIcon({ className }: { className?: string }) {
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
      <path d="m3 11 18-5v12L3 13v-2z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
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
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
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
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

export default function ViewProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [appealModalOpen, setAppealModalOpen] = useState(false);

  // Find the profile by ID
  const profile = useMemo(() => {
    return MOCK_PROFILES.find((p) => p.id === params.id);
  }, [params.id]);

  // If profile not found, show 404
  if (!profile) {
    notFound();
  }

  // Convert profile availability to AvailabilityData format for the modal
  const mockAvailabilityData: AvailabilityData = useMemo(() => {
    // Generate default dates (next 14 days)
    const today = new Date();
    const defaultDates: string[] = [];
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      defaultDates.push(date.toISOString().split("T")[0]);
    }

    if (!profile.availability) {
      return {
        timezone: "America/New_York",
        slots: [],
      };
    }

    // Group time slots by time range and create mock slots
    const slots: AvailabilitySlot[] = profile.availability.timeSlots.reduce(
      (acc: AvailabilitySlot[], slot, index) => {
        if (index < 3) {
          acc.push({
            id: index + 1,
            name: `${slot.day} Session`,
            duration: 60, // 1 hour
            times: [`${slot.startTime}-${slot.endTime}`],
            price: profile.price,
            selectedDates: defaultDates,
          });
        }
        return acc;
      },
      []
    );

    return {
      timezone: profile.availability.timezone,
      slots:
        slots.length > 0
          ? slots
          : [
              {
                id: 1,
                name: "Standard Session",
                duration: 60,
                times: ["10:00-11:00", "14:00-15:00", "16:00-17:00"],
                price: profile.price,
                selectedDates: defaultDates,
              },
            ],
    };
  }, [profile]);

  const handleBook = (
    slot: AvailabilitySlot,
    date: Date,
    timeSlot: string,
    receipt: { id: string }
  ) => {
    console.log(`Booked ${profile.name} - Receipt: ${receipt.id}`);
    setBookingModalOpen(false);
    router.push(ROUTES.CHAT(profile.id));
  };

  const hasAvailability = mockAvailabilityData.slots.length > 0;

  return (
    <div className="min-h-screen pb-[500px] sm:pb-96">

      <main className="max-w-container mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            href={ROUTES.DISCOVER}
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-koru-purple transition-colors group"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Discover</span>
          </Link>
        </motion.div>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden mb-8 shadow-soft"
        >
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-koru-purple via-koru-golden/50 to-koru-lime/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6 relative">
            {/* Avatar - positioned to overlap banner */}
            <div className="absolute -top-14 left-6">
              <div className="w-28 h-28 rounded-2xl border-4 border-white dark:border-neutral-900 shadow-xl overflow-hidden bg-white dark:bg-neutral-800">
                <AvatarGenerator seed={profile.handle} size={112} />
              </div>
            </div>

            <div className="pt-16 sm:pt-20">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {profile.name}
                  </h1>
                  <a
                    href={`https://twitter.com/${profile.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-neutral-500 hover:text-koru-purple transition-colors"
                  >
                    <TwitterIcon className="w-4 h-4" />
                    <span>@{profile.handle}</span>
                  </a>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setAppealModalOpen(true)}
                    className="border-koru-golden text-koru-golden hover:bg-koru-golden/10"
                  >
                    <MegaphoneIcon className="w-5 h-5 mr-2" />
                    Appeal
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => setBookingModalOpen(true)}
                    disabled={!hasAvailability}
                    className="bg-koru-purple hover:bg-koru-purple/90 text-white font-semibold px-8"
                  >
                    <ChatIcon className="w-5 h-5 mr-2" />
                    Talk to {profile.name.split(" ")[0]}
                  </Button>
                </div>
              </div>

              {/* Bio */}
              <p className="text-neutral-600 dark:text-neutral-400 mt-4 max-w-2xl">
                {profile.bio}
              </p>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.categories.map((category) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="bg-koru-purple/10 text-koru-purple border-0"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            icon={<UsersIcon className="w-5 h-5" />}
            label="Followers"
            value={profile.followers}
            color="purple"
          />
          <StatCard
            icon={<DollarIcon className="w-5 h-5" />}
            label="Min Price"
            value={`$${profile.price}`}
            color="golden"
          />
          <StatCard
            icon={<ClockIcon className="w-5 h-5" />}
            label="Avg Response"
            value={`${profile.responseTime}h`}
            color="lime"
          />
          <StatCard
            icon={<DollarIcon className="w-5 h-5" />}
            label="Total Earned"
            value={`$${profile.earnings.toLocaleString()}`}
            color="purple"
          />
        </motion.div>

        {/* Availability Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-koru-lime/10 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-koru-lime" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Availability
                </h3>
                {profile.availability && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {profile.availability.timezone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {hasAvailability ? (
            <div className="space-y-4">
              {/* Response Time */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                <ClockIcon className="w-5 h-5 text-koru-golden" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Average Response Time
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {profile.availability?.averageResponseTime}
                  </p>
                </div>
              </div>

              {/* Available Slots */}
              <div>
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                  Available Sessions
                </p>
                <div className="space-y-2">
                  {mockAvailabilityData.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {slot.name}
                        </span>
                        <span
                          className={cn(
                            "font-semibold",
                            slot.price === 0
                              ? "text-koru-lime"
                              : "text-koru-golden"
                          )}
                        >
                          {slot.price === 0 ? "Free" : `$${slot.price}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {slot.duration} min
                        </span>
                        <span>·</span>
                        <span>
                          {slot.times.length} time
                          {slot.times.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legacy Time Slots Preview (for compatibility) */}
              {profile.availability?.timeSlots &&
                profile.availability.timeSlots.length > 0 &&
                mockAvailabilityData.slots.length === 0 && (
                  <div>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                      Time Slots
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profile.availability.timeSlots
                        .slice(0, 4)
                        .map((slot) => (
                          <div
                            key={slot.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-koru-purple/5 border border-koru-purple/20"
                          >
                            <span className="text-xs font-medium text-koru-purple">
                              {slot.day}
                            </span>
                            <span className="text-xs text-neutral-600 dark:text-neutral-400">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                        ))}
                      {profile.availability.timeSlots.length > 4 && (
                        <div className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-500">
                          +{profile.availability.timeSlots.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* CTA */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <Button
                  onClick={() => setBookingModalOpen(true)}
                  className="w-full bg-koru-purple hover:bg-koru-purple/90"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Book a Time
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8">
              <CalendarIcon className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
                This user hasn&apos;t set up their availability yet.
              </p>
            </div>
          )}
        </motion.div>
      </main>


      {/* Booking Modal */}
      <BookingModal
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        personName={profile.name}
        personId={profile.id}
        availability={mockAvailabilityData}
        onBook={handleBook}
      />

      {/* Appeal Modal */}
      <AppealModal
        open={appealModalOpen}
        onOpenChange={setAppealModalOpen}
        personName={profile.name}
        personHandle={profile.handle}
        onCreateAppeal={() => {
          setAppealModalOpen(false);
          router.push(`${ROUTES.APPEALS}/new?to=${profile.handle}`);
        }}
      />
    </div>
  );
}

// Appeal Modal Component
function AppealModal({
  open,
  onOpenChange,
  personName,
  personHandle,
  onCreateAppeal,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string;
  personHandle: string;
  onCreateAppeal: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-koru-golden/20 via-koru-purple/10 to-koru-lime/20 p-6 pb-8">
                <button
                  onClick={() => onOpenChange(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-neutral-600 dark:text-neutral-400 transition-colors"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-koru-golden/20 flex items-center justify-center">
                    <MegaphoneIcon className="w-6 h-6 text-koru-golden" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                      Appeal to {personName.split(" ")[0]}
                    </h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      @{personHandle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                    What is an Appeal?
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                    An appeal is a public request to connect with a creator. It shows them you&apos;re genuinely interested in their expertise and helps them prioritize who to respond to.
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                    Why Appeal?
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-koru-purple/5 border border-koru-purple/10">
                      <SparklesIcon className="w-5 h-5 text-koru-purple shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          Stand Out
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Your appeal becomes visible to {personName.split(" ")[0]}, showing your genuine interest
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-koru-golden/5 border border-koru-golden/10">
                      <UsersIcon className="w-5 h-5 text-koru-golden shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          Community Support
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Others can upvote your appeal, increasing its visibility
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-koru-lime/5 border border-koru-lime/10">
                      <DollarIcon className="w-5 h-5 text-koru-lime shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          Set Your Price
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Offer what you&apos;re willing to pay for their time and expertise
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    onClick={onCreateAppeal}
                    className="w-full bg-gradient-to-r from-koru-golden to-koru-golden/80 hover:from-koru-golden/90 hover:to-koru-golden/70 text-neutral-900 font-semibold"
                  >
                    <MegaphoneIcon className="w-4 h-4 mr-2" />
                    Create Appeal
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    className="w-full"
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "purple" | "golden" | "lime";
}) {
  const colorClasses = {
    purple: "bg-koru-purple/10 text-koru-purple",
    golden: "bg-koru-golden/10 text-koru-golden",
    lime: "bg-koru-lime/10 text-koru-lime",
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-soft">
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
          colorClasses[color]
        )}
      >
        {icon}
      </div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
        {value}
      </p>
    </div>
  );
}
