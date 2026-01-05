# Koru Project Overview

## What Koru Is
- Koru is a marketplace for high-intent conversations with experts and creators. Seekers browse curated profiles, book or pay-to-message hosts, and use “summons” (appeals) to rally support to reach specific people.
- Core user flows: discover featured/filtered profiles, view a profile and check availability or rates, start a paid chat, create or back a summon for a target handle, and exchange real-time messages once a chat is active.
- Trust/UX pillars showcased in the product copy: upfront payments held in escrow, clear time windows, no-show protection/refunds, quality request prompts, and status-aware chat badges.

## Stack
- Framework: Next.js 15 (App Router) with React 18 and TypeScript.
- Styling: Tailwind CSS with custom brand tokens (koru purple/golden/lime/deep) and font families (Quicksand, Tenor, Lemon). Animations via `motion` and custom keyframes; theming via `next-themes`.
- UI kit: Radix-based components wrapped in `components/ui` (buttons, cards, dialog/drawer, dropdown-menu, select, tabs, avatar, responsive modal, timeline, highlighter, glowing-effect, typing-animation, etc.) plus feature components in `components/shared`, `components/discover`, `components/auth`, and modals (booking, availability, user overview, cookie consent, share).
- Data + state: SWR for client data fetching, small utility hooks (`use-local-storage`, `use-unread-count`, `use-twitter-search`, `use-chat-messages` with Supabase realtime), and localStorage-backed badges.
- Auth: NextAuth with Twitter OAuth 2.0; session enriches JWT with Twitter fields and persists/updates the Supabase `users` row on sign-in.
- Backend/data: Supabase (Postgres) accessed via server-side `lib/supabase.ts` plus a client-side `lib/supabase-client.ts` for realtime chat. RPC helpers used for counters/updates.
- External services: RapidAPI `twitter241` search endpoint for profile lookup (cached in Supabase), Supabase realtime channels for messages, and @vercel/analytics.

## Application Layout
- `app/`: Routes for the marketing shell and product flows (`/`, `/discover`, `/summons`, `/profile`, `/chat/[id]`, `/chats`, `/notifications`, `/login`/`/sign-in`, `/how-it-works`, `/contact`, `/faq`, `/terms`, `/privacy`, error and not-found). `app/globals.css` contains Tailwind base styles.
- `app/api/`: Next.js API routes that back the UI (see “APIs” below).
- `components/`: Shared UI building blocks (`ui/`), branded text/logo (`koru-text`), theme provider/toggle, dialogs/modals for auth, booking, availability, sharing, cookie consent, and discovery/profile cards.
- `lib/`: Supabase data layer, NextAuth config, constants (navigation/routes/summon tags/categories), hooks (profile data, featured profiles, unread counts, chat messages, twitter search), helpers/utils, and TypeScript types.
- `public/`, `fonts/`, `components.json`: Assets, font registrations, and shadcn/radix config.
- `scripts/`: Utility scripts such as `scripts/seed-profiles.js` to seed `featured_profiles` via Supabase.
- `supabase-*.sql`: SQL setup and migration scripts for schema creation, updates, cleanup, and featured/backers data.

## Key Features & Flows
- Discovery: `/discover` pulls featured profiles and category filters via `/api/discover/featured` and `/api/discover/categories`, backed by Supabase `featured_profiles`/`twitter_profiles`.
- Summons (appeals): `/summons` lists treemap and card views; users can search Twitter handles via `/api/twitter/search`, create a summon (`/api/summons` POST), and back existing ones (`/api/summons/back`). Tags come from `lib/constants/summon-tags.ts`.
- Chat & messaging: `/api/chats` creates chats; `/api/user/chats` lists chats for inbox badges; `/api/chat/[id]/messages` fetches and posts messages with auth gating; `use-chat-messages` subscribes to Supabase realtime inserts for live updates. Unread counts persist in localStorage and badges via `use-unread-count`.
- Profiles & availability: `/profile/[username]` uses `/api/profile/[username]` plus `/api/user/*` endpoints for stats, wallets, availability slots, summons, and transactions. Booking/availability modals surface slot selection and request details.
- Auth flow: Twitter OAuth through NextAuth (`app/api/auth/[...nextauth]`); on login, the RapidAPI search enriches profile data, and `upsertUser` writes to Supabase.
- Theming/branding: Koru colors/fonts are defined in `tailwind.config.ts`; `ThemeProvider` + `ThemeToggle` enable light/dark across the app.

## APIs (Next.js Routes)
- `/api/auth/[...nextauth]`: NextAuth handler (Twitter OAuth).
- `/api/twitter/search`: Proxy to RapidAPI `twitter241` search; caches results in Supabase `twitter_profiles`.
- `/api/discover/featured`, `/api/discover/categories`: Fetch curated profiles and category list from Supabase.
- `/api/profile/[username]`: Resolve a profile (featured or cached) with optional user data.
- `/api/summons` (GET for active summons, POST to create), `/api/summons/back` (POST to back).
- `/api/chats` (POST to create chat), `/api/chat/[id]/messages` (GET/POST messages).
- `/api/user`: Lookup user by Twitter ID; `/api/user/update`: Update user profile fields; `/api/user/chats`: Chats list for unread counts; `/api/user/summons`: Created/backed summons; `/api/user/transactions`: Recent transactions; `/api/user/wallets`: Connected wallets; `/api/user/availability`: Availability slots; `/api/user/stats`: Aggregate counts.

## Database (Supabase/Postgres)
- `twitter_profiles`: Cached Twitter search results with bio, banner, counts, category/tags, and featured flags.
- `featured_profiles`: Curated profiles with ordering, categories, and tags used on Discover.
- `users`: Twitter-linked accounts with creator settings (rate, response time), balances, tags, location, optional availability JSON and connected wallets JSONB, stats counters, and timestamps.
- `summons` / `appeals`: Public requests targeting a Twitter handle with message, pledged/goal amounts, backers_count, status, expiry timestamps; ties to `users` as creator.
- `summon_backers` / `appeal_backers`: Join users to summons with pledge amounts; used for totals and backer lists.
- `chats`: Requester/creator linkage, status, pricing/slot info, unread counters, last_message metadata, deadlines, and timestamps.
- `messages`: Per-chat messages with sender, content, read flag, and created_at; used for realtime subscriptions.
- `transactions`: Payments/refunds/pledges with type/status, amounts, chat/summon references, wallet linkage, and metadata.
- `wallets`: Connected crypto wallets with chain, labels, primary flag, and verification timestamp.
- `availability_slots` + `availability_times`: Creator slots with duration/pricing, active flag, per-day windows; exposed via `/api/user/availability`.
- Supporting RPC/helpers: e.g., `increment_user_summons`, `increment_summon_backing`, and counters used after summons/backers are created.
- SQL files: `supabase-setup.sql` (base schema), `supabase-schema.sql` (expanded schema with triggers/RLS), `supabase-schema-v2.sql` (availability/wallet/stats updates), `supabase-cleanup.sql` (drops), and seed helpers (tags/backers/featured profiles).

## UI Components & Styling Notes
- Design tokens: brand colors in `tailwind.config.ts` (`koru.purple/golden/lime/deep`), extended radii/shadows, and custom animations (blink, fade-in/up, shimmer). Fonts registered in `fonts/` and exposed via CSS variables.
- Component highlights: `components/ui/button`, `card`, `input`, `select`, `tabs`, `dialog`, `drawer`, `dropdown-menu`, `avatar`, `timeline`, `responsive-modal`, `glowing-effect`, `text-highlight`, `typing-animation`, `transaction-error`, `avatar-generator`. Feature components include discovery cards, page headers, status pills, empty states, share modal, and about modal with animated backgrounds.
- Theming: `ThemeProvider` and `ThemeToggle` wrap the app, with light/dark class-based Tailwind styles and animated orbs on the landing page.

## Environment & Configuration
- Required envs (server): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`, `RAPIDAPI_KEY` (for twitter241 search).
- Client Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` for realtime chat subscriptions.
- Ports/scripts: `npm run dev` (Next dev on 2396), `npm run build`, `npm run start`, `npm run lint`.

## Quick File Map (reference)
- `app/`: Pages; `app/api/`: API routes; `app/globals.css`: base styles.
- `components/ui/`: Reusable primitives; `components/shared/`: page-level helpers (headers, states, skeletons).
- `components/auth/`, `components/discover/`, `components/share/`, modals in root components folder.
- `lib/`: `supabase.ts` (server client + data ops), `supabase-client.ts` (client realtime), `auth.ts` (NextAuth), `hooks/`, `constants/`, `types/`, `utils.ts`.
- `scripts/`: Supabase seeding utilities. `supabase-*.sql`: schema and seed scripts. `tailwind.config.ts`: design tokens.
