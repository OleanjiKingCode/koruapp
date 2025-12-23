"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  FloatingNav,
  PageHeader,
  StatCard,
  StatusPill,
  EmptyState,
} from "@/components/shared";
import { Footer } from "@/components/shared/footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import { cn } from "@/lib/utils";
import { MOCK_USER_DATA, MOCK_CHATS } from "@/lib/data";
import { MOCK_USER_APPEALS } from "@/lib/data/mock-appeals";
import {
  CheckIcon,
  ShareIcon,
  EditIcon,
  DollarIcon,
  RefundIcon,
  ChatIcon,
  BeaconIcon,
} from "@/components/icons";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("chats");

  return (
    <div className="min-h-screen pb-96">
      <FloatingNav />

      <main className="max-w-container mx-auto px-4 sm:px-6 py-8">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden mb-8 shadow-soft"
        >
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-koru-purple via-koru-golden/50 to-koru-lime/30 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          </div>

          <div className="px-6 md:px-8 pb-6 -mt-16 relative">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-neutral-900 shadow-xl overflow-hidden bg-white dark:bg-neutral-800">
                  <AvatarGenerator seed={MOCK_USER_DATA.address} size={128} />
                </div>
                {/* Level Badge */}
                <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-koru-golden text-neutral-900 text-xs font-quicksand font-bold shadow-lg">
                  {MOCK_USER_DATA.level}
                </div>
              </motion.div>

              {/* Info */}
              <div className="flex-1 pt-4 md:pt-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-tenor text-neutral-900 dark:text-neutral-100">
                    {MOCK_USER_DATA.shortAddress}
                  </h1>
                  <Badge className="bg-koru-purple/20 text-koru-purple border-0">
                    {MOCK_USER_DATA.points.toLocaleString()} pts
                  </Badge>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-mono mb-3">
                  {MOCK_USER_DATA.address}
                </p>
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {MOCK_USER_DATA.badges.map((badge) => (
                    <Badge
                      key={badge}
                      variant="outline"
                      className={cn(
                        "text-xs",
                        badge === "Early Adopter" &&
                          "border-koru-golden text-koru-golden bg-koru-golden/10",
                        badge === "Power User" &&
                          "border-koru-purple text-koru-purple bg-koru-purple/10",
                        badge === "Verified" &&
                          "border-koru-lime text-koru-lime bg-koru-lime/10"
                      )}
                    >
                      {badge === "Verified" && (
                        <CheckIcon className="w-3 h-3 mr-1" />
                      )}
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 md:pt-0">
                <Button variant="outline" size="sm">
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button size="sm">
                  <EditIcon className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Member Since */}
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-4">
              Member since {MOCK_USER_DATA.joinDate}
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            title="Total Spent"
            value={MOCK_USER_DATA.stats.totalSpent}
            icon={<DollarIcon className="w-5 h-5" />}
            variant="purple"
          />
          <StatCard
            title="Total Refunded"
            value={MOCK_USER_DATA.stats.totalRefunded}
            icon={<RefundIcon className="w-5 h-5" />}
            trend="down"
            trendValue="12%"
          />
          <StatCard
            title="Active Chats"
            value={MOCK_USER_DATA.stats.activeChats}
            icon={<ChatIcon className="w-5 h-5" />}
            variant="golden"
          />
          <StatCard
            title="Appeals Created"
            value={MOCK_USER_DATA.stats.appealsCreated}
            icon={<BeaconIcon className="w-5 h-5" />}
            variant="lime"
          />
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-neutral-100 dark:bg-neutral-800/50 p-1 rounded-xl mb-6">
            <TabsTrigger
              value="chats"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm"
            >
              💬 Chats ({MOCK_CHATS.length})
            </TabsTrigger>
            <TabsTrigger
              value="appeals"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm"
            >
              🔔 Appeals ({MOCK_USER_APPEALS.length})
            </TabsTrigger>
          </TabsList>

          {/* Chats Tab */}
          <TabsContent value="chats" className="space-y-4">
            {MOCK_CHATS.length > 0 ? (
              MOCK_CHATS.map((chat, index) => (
                <motion.a
                  href={`/chat/${chat.id}`}
                  key={chat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="block bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-koru-purple/30 dark:hover:border-koru-purple/30 transition-all cursor-pointer group hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-koru-purple/20 to-koru-golden/20 flex items-center justify-center">
                        <span className="text-sm font-tenor font-medium text-koru-purple">
                          {chat.otherParty
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-quicksand font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-koru-purple transition-colors">
                            {chat.otherParty}
                          </h3>
                          <StatusPill status={chat.status} />
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          @{chat.handle}
                        </p>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="text-right shrink-0">
                      <p className="font-quicksand font-semibold text-neutral-900 dark:text-neutral-100">
                        {chat.amount}
                      </p>
                      <p
                        className={cn(
                          "text-xs",
                          chat.deadline.includes("left")
                            ? "text-koru-golden"
                            : chat.deadline === "Completed"
                            ? "text-koru-lime"
                            : "text-neutral-400"
                        )}
                      >
                        {chat.deadline}
                      </p>
                    </div>
                  </div>

                  {/* Last message preview */}
                  <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1">
                    {chat.lastMessage}
                  </p>
                </motion.a>
              ))
            ) : (
              <EmptyState
                icon="search"
                title="No chats yet"
                description="Start a conversation by finding someone on the Discover page."
              />
            )}
          </TabsContent>

          {/* Appeals Tab */}
          <TabsContent value="appeals" className="space-y-4">
            {MOCK_USER_APPEALS.length > 0 ? (
              MOCK_USER_APPEALS.map((appeal, index) => (
                <motion.div
                  key={appeal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-koru-golden/30 dark:hover:border-koru-golden/30 transition-all cursor-pointer group hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-koru-golden/20 to-koru-lime/20 flex items-center justify-center">
                        <BeaconIcon className="w-5 h-5 text-koru-golden" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-quicksand font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-koru-golden transition-colors">
                            @{appeal.targetHandle}
                          </h3>
                          <StatusPill status={appeal.status} />
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {appeal.targetName}
                        </p>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="text-right shrink-0">
                      <p className="font-quicksand font-semibold text-koru-golden">
                        {appeal.pledgedAmount}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {appeal.backers} backers
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
                    Created {appeal.date}
                  </p>
                </motion.div>
              ))
            ) : (
              <EmptyState
                icon="beacon"
                title="No appeals yet"
                description="Create an appeal to attract attention to someone you want to reach."
              />
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}

