# Kōru: The Attention Marketplace

### A White Paper on Fair, Guaranteed Access to the People Who Matter

**Version 1.0 — March 2026**

---

## Table of Contents

1. [Abstract](#1-abstract)
2. [The Problem](#2-the-problem)
3. [The Kōru Solution](#3-the-kōru-solution)
4. [How Kōru Works](#4-how-kōru-works)
5. [The Summons Protocol](#5-the-summons-protocol)
6. [Payment & Escrow Architecture](#6-payment--escrow-architecture)
7. [Trust & Safety Framework](#7-trust--safety-framework)
8. [Platform Economics](#8-platform-economics)
9. [Use Cases](#9-use-cases)
10. [Technical Architecture](#10-technical-architecture)
11. [Roadmap](#11-roadmap)
12. [Conclusion](#12-conclusion)

---

## 1. Abstract

The internet gave humanity the ability to reach anyone. But it never guaranteed anyone would respond.

Every day, millions of high-intent messages — pitch decks to investors, collaboration proposals to creators, career-defining asks to operators — vanish into inboxes. The outcome is determined not by the quality of the request, but by who already has the right connections. Access remains random. Opportunity remains unequal.

Kōru is a pay-for-attention marketplace that transforms direct messaging from a lottery into a system. It creates a transparent channel between **Seekers** — people who need access — and **Hosts** — experts, creators, founders, and thought leaders whose attention has quantifiable value.

The mechanism is straightforward: Seekers pay to send a message or book time. Funds are held in escrow via smart contract. The Host responds within a defined window or the Seeker gets a full refund. No ghosting. Just outcomes.

Kōru doesn't monetize attention through advertising or algorithmic manipulation. It builds a market where attention is priced fairly, time is respected, and good opportunities don't die in silence.

---

## 2. The Problem

### 2.1 Access Is Random

The modern internet is, paradoxically, both the most connected and the most gatekept communication medium in history. Consider the current state:

- **Cold DMs have a sub-2% response rate.** On platforms like X (Twitter), LinkedIn, and Instagram, the vast majority of outbound messages go unanswered — regardless of their quality, urgency, or potential value to the recipient.

- **Warm intros are the default currency.** Access to founders, investors, and industry leaders is overwhelmingly mediated by existing social capital. The person who gets a response isn't necessarily the one with the best idea — it's the one who already knows someone who knows someone.

- **Attention overload is real.** High-profile individuals receive hundreds or thousands of messages daily. Without a signal for seriousness, every message looks the same. The noise buries the signal.

The result: opportunity is distributed not by merit, but by proximity. A first-generation founder in Lagos has functionally zero access to the same investor that a Stanford dropout can reach via a group chat.

### 2.2 The Seeker's Pain

For the person trying to reach someone, the current experience is broken in specific, measurable ways:

- **Weeks wasted chasing one response.** The cycle of send → wait → follow up → wait → follow up again → give up is emotionally draining and economically wasteful.
- **Follow-ups that feel desperate.** There is no dignified way to send a fourth message to someone who hasn't replied to the first three.
- **High-value opportunities lost to silence.** Deals, collaborations, hires, and life-changing introductions fail not because the answer was "no" — but because there was no answer at all.

The fundamental issue isn't that people don't want to respond. It's that there's no mechanism to separate serious requests from noise, and no incentive structure to guarantee engagement.

### 2.3 The Host's Pain

The person on the receiving end faces a different but equally real set of problems:

- **Inbox overload with no signal.** When every message looks the same, there's no way to prioritize without reading everything — which is impossible at scale.
- **No compensation for time spent.** Responding to strangers is unpaid labor. Even when a response creates enormous value for the sender (a career opportunity, a funded startup, a business partnership), the responder receives nothing.
- **Guilt and reputation cost.** Not responding feels bad. But responding to everyone is unsustainable. High-profile individuals are stuck in an impossible position where silence damages their reputation but engagement drains their capacity.

### 2.4 Why Existing Solutions Fail

| Solution                                     | Failure Mode                                                          |
| -------------------------------------------- | --------------------------------------------------------------------- |
| **Cold email / DMs**                         | No signal, no incentive, no accountability                            |
| **LinkedIn InMail**                          | Monetizes the sender but doesn't guarantee the recipient's engagement |
| **Consulting marketplaces (Clarity, Intro)** | High overhead, scheduling friction, limited to advice-giving          |
| **Paid communities (Discord, Slack)**        | Access to the group ≠ access to the individual                        |
| **Celebrity platforms (Cameo)**              | Performative, one-directional, entertainment-focused                  |
| **Networking events**                        | Geographically limited, time-intensive, random by design              |

None of these solve the core problem: creating a direct, guaranteed, and fair channel between a specific person who wants access and a specific person whose attention has value.

---

## 3. The Kōru Solution

### 3.1 Core Mechanism

Kōru introduces a simple but powerful primitive: **paid, guaranteed messaging with smart contract escrow.**

The model works as follows:

1. **A Seeker finds a Host** on Kōru — through the discovery feed, search, or by summoning someone who isn't on the platform yet.
2. **The Seeker pays to send a message** or book a session. The payment (in USDC) is deposited into an escrow smart contract — not sent directly to the Host.
3. **The Host has a defined time window to respond.** If they respond, funds are released to them. If they don't, the Seeker can reclaim their full deposit automatically through the smart contract.
4. **Both parties are protected.** The Seeker gets a guaranteed outcome (response or refund). The Host gets compensated fairly for their attention.

This creates a self-correcting market: the payment signals seriousness, the escrow eliminates risk, and the time window creates accountability.

### 3.2 Design Principles

Kōru is built on five principles:

**1. Attention has value.**
If someone's response can change your career, fund your startup, or unlock a partnership, that attention is worth something. Kōru makes this value explicit rather than pretending it doesn't exist.

**2. Time is respected.**
Both the Seeker's time (no more weeks of follow-ups) and the Host's time (no more unpaid inbox labor) are treated as finite resources deserving of clear boundaries.

**3. Outcomes are guaranteed.**
Every transaction on Kōru ends in one of two ways: a response or a refund. There is no third option where money is taken and nothing happens.

**4. Access is fair.**
Anyone can reach anyone. The quality of your request and the seriousness of your intent (measured by willingness to pay) determine access — not your existing network.

**5. Trust is structural, not reputational.**
Protection doesn't come from hoping the other party acts in good faith. It comes from smart contract logic that enforces fair outcomes regardless of either party's behavior.

---

## 4. How Kōru Works

### 4.1 The Seeker Journey

#### Step 1: Discover

Seekers browse Kōru's discovery feed to find experts, creators, and thought leaders across categories: Web3, Tech, Business, Medical, Sports, and more. Profiles display:

- Expertise areas and tags
- Pricing (per message or per session)
- Availability windows
- Response time history
- Follower count and verification status
- Earnings and engagement badges

Seekers can filter by category, sort by price, response speed, or reputation, and switch between grid and list views.

If the person they want isn't on Kōru, they can **summon** them (see Section 5).

#### Step 2: Engage

Once a Seeker identifies a Host, they initiate engagement through one of two paths:

- **Direct Message:** Pay to send a message to a Host already on the platform. The Seeker writes a clear, contextual request — Kōru prompts for quality to ensure Hosts receive actionable messages rather than vague asks.
- **Book a Session:** Select an available time slot, provide context for the conversation, and confirm the booking. Sessions have defined durations and clear expectations.

In both cases, the payment is deposited into escrow immediately upon confirmation.

#### Step 3: Connect

Once the Host accepts, the interaction begins:

- **Real-time messaging** with read receipts and status indicators
- **Video calls** at the scheduled time
- **File sharing** for relevant documents, pitch decks, or materials

The chat interface shows the escrow status, time remaining, and clear next steps for both parties.

#### Step 4: Settle

After the interaction, the settlement process is automatic:

- The Host has **24 hours after the session date** to accept the engagement
- The Seeker then has **48 hours** to review and either release funds or raise a dispute
- If neither party takes action, funds **auto-release** to the Host after the dispute window closes
- If the Host never accepts, the Seeker can **reclaim their full deposit** automatically

### 4.2 The Host Journey

#### Step 1: Create a Listing

Any user can become a Host by setting up their profile:

- **Define expertise:** Select categories and tags that describe what they can help with
- **Set pricing:** Choose rates for messages and sessions that reflect the value of their time
- **Configure availability:** Define weekly time slots with specific durations and pricing per slot
- **Write a description:** Explain what Seekers can expect from interacting with them

#### Step 2: Accept Requests

When a Seeker initiates engagement, the Host receives a contextual booking request containing:

- The Seeker's profile and social proof
- The specific question or request
- The offered payment amount
- The proposed time slot (for sessions)

Hosts can **accept or decline** any request with no penalty for declining. When a Host declines, the Seeker is automatically refunded in full.

#### Step 3: Deliver Value

Hosts show up, engage with the Seeker's request, and provide genuine value. The platform tracks:

- Response times
- Completion rates
- Seeker satisfaction (via post-session ratings)

These metrics build the Host's on-platform reputation, driving more and higher-quality requests over time.

#### Step 4: Earn

Payment releases automatically after successful completion:

- No invoicing
- No payment chasing
- No payment processing delays (beyond blockchain confirmation)
- Clean, predictable earnings with full transaction history

Hosts can withdraw earnings to their connected wallet at any time.

---

## 5. The Summons Protocol

### 5.1 What Is a Summon?

A Summon is Kōru's mechanism for **demand-side discovery** — a way for the community to signal who they want on the platform and how much they'd pay for access.

A Summon is a **public pledge**, not a payment. When a Seeker creates a Summon, they're stating: _"I would pay $X to talk to this person if they join Kōru."_ No money changes hands at the time of the pledge.

### 5.2 How Summons Work

1. **A Seeker searches for a person** (by name or X handle) who isn't on Kōru yet.
2. **They create a Summon** with:
   - The target's X handle
   - A message explaining why they want to connect
   - A pledge amount (what they'd be willing to pay)
   - Relevant tags (e.g., Web3, Mentorship, Startup)
3. **The Summon becomes public.** Other users can see it, back it with their own pledges, and share it.
4. **Social proof accumulates.** As more people pledge, the total commitment grows — sending a clear signal to the target that there's genuine, financially-backed demand for their attention.
5. **If/when the target joins Kōru,** backers can then choose to engage directly through the normal paid messaging flow.

### 5.3 Why Summons Matter

Summons solve the **cold start problem** for attention marketplaces in a unique way:

- **For Seekers:** Instead of sending a cold DM that gets ignored, they create visible, public demand. A Summon with $5,000 in pledges from 50 people is a fundamentally different signal than a DM from a stranger.
- **For Targets:** Instead of wondering whether joining a new platform is worth their time, they can see exactly how much demand exists for their attention — before they commit to anything.
- **For the Platform:** Summons generate organic discovery and social sharing. Every Summon is inherently shareable: "Help me bring @elonmusk to Kōru — 127 people have already pledged $12,400."

### 5.4 Summons Economics

- **Creating a Summon is free.** No payment is collected at the time of the pledge.
- **Backing a Summon is free.** Additional pledges are also non-binding commitments.
- **Payment only occurs** when the target joins and a backer initiates a direct engagement through the standard escrow flow.
- **There is no penalty** for not following through on a pledge. The pledge represents intent, not obligation.

This design choice is intentional: by removing financial friction from the discovery phase, Kōru maximizes the signal surface. The real economic commitment happens at the moment of engagement, when both parties are ready.

---

## 6. Payment & Escrow Architecture

### 6.1 Currency

All transactions on Kōru are denominated in **USDC** — a stablecoin pegged 1:1 to the US dollar, operating on the **Base** blockchain (Coinbase's Layer 2).

The choice of USDC on Base provides:

- **Price stability:** Unlike volatile cryptocurrencies, USDC maintains a stable value, making pricing intuitive for both Seekers and Hosts.
- **Low transaction costs:** Base's Layer 2 architecture keeps gas fees minimal — typically under $0.01 per transaction.
- **Fast settlement:** Transactions confirm in seconds, not days.
- **Global accessibility:** Anyone with a crypto wallet can participate, regardless of geography or banking status.

### 6.2 Escrow Smart Contract

The escrow contract is the core trust mechanism of the platform. Here's how it works:

```
DEPOSIT → ACCEPT → REVIEW → RELEASE
   ↓         ↓        ↓
 RECLAIM   DECLINE  DISPUTE
```

**Deposit Phase:**
When a Seeker initiates engagement, their USDC payment is deposited into the escrow smart contract. The funds are held on-chain — neither Kōru nor the Host can access them.

**Accept/Decline Phase:**
The Host has **24 hours after the session date** to accept the engagement. If they accept, the flow continues. If they decline (or take no action), the Seeker can reclaim their full deposit.

**Review Phase:**
After acceptance, the Seeker has **48 hours** to review the interaction. They can:

- **Release funds** to the Host (if satisfied)
- **Raise a dispute** (if there's an issue)
- **Take no action** (funds auto-release to Host after 48 hours)

**Settlement:**
Released funds (minus the platform fee) become available for the Host to withdraw to their connected wallet.

### 6.3 Smart Contract Properties

The escrow contract is designed with the following properties:

- **Non-upgradeable (Immutable):** Once deployed, the contract logic cannot be changed — not by Kōru, not by anyone. This ensures the rules are permanent and verifiable.
- **Built on OpenZeppelin:** Uses battle-tested, audited smart contract libraries for standard functionality.
- **Reentrancy Protection:** Guards against common smart contract attack vectors.
- **Emergency Pause:** Circuit breaker functionality allows the contract to be paused in case of a critical security issue — but cannot redirect or seize funds.
- **Open Source:** The contract code is published and verifiable on-chain by anyone.
- **Publicly Audited:** Independent third-party audit (details forthcoming).

### 6.4 Refund Guarantees

Refunds on Kōru are not a customer service process — they're a smart contract function:

| Scenario                                    | Outcome                      | Speed              |
| ------------------------------------------- | ---------------------------- | ------------------ |
| Host doesn't accept within 24hrs of session | Seeker reclaims full deposit | Instant (on-chain) |
| Host explicitly declines                    | Full refund to Seeker        | Instant (on-chain) |
| Seeker raises valid dispute                 | Manual review, resolution    | Variable           |
| Session completes, no dispute               | Funds release to Host        | After 48hr window  |

"Instant" means one blockchain transaction — typically confirming in under 5 seconds on Base.

---

## 7. Trust & Safety Framework

### 7.1 Structural Trust

Kōru's trust model is fundamentally different from platform-mediated trust (where a company arbitrates disputes) or reputation-based trust (where you rely on reviews). Instead, Kōru implements **structural trust**: the smart contract enforces fair outcomes regardless of either party's intentions.

- **Seekers can't lose money to inaction.** If a Host doesn't respond, funds are automatically reclaimable.
- **Hosts can't be stiffed.** If a Seeker doesn't release funds and doesn't dispute, funds auto-release after 48 hours.
- **Neither party needs to trust the other.** The contract handles the adversarial case by default.

### 7.2 Identity Verification

- **X (Twitter) OAuth:** All accounts are verified through X authentication. Users sign in with their real social identity — no anonymous accounts.
- **Profile Verification Badges:** Active hosts display verification indicators based on their engagement history and identity confirmation.
- **Wallet Verification:** Connected wallets are verified to ensure payment capability.

### 7.3 Quality Mechanisms

- **Request Prompts:** When Seekers initiate engagement, Kōru prompts them to write clear, specific requests. This filters low-effort spam and helps Hosts prepare meaningful responses.
- **Rating System:** Post-interaction ratings build Host reputation over time.
- **Decline Without Penalty:** Hosts can decline any request without consequences, ensuring they only engage with requests they can genuinely help with.

### 7.4 Abuse Prevention

- **Automated Fraud Detection:** Platform-level monitoring for suspicious patterns.
- **Report Functionality:** Users can report abuse on any Summon or profile.
- **Safety Team Review:** All reports are reviewed by the Kōru safety team.
- **Immediate Removal:** Users who impersonate others or engage in fraudulent activity are permanently banned.

---

## 8. Platform Economics

### 8.1 Fee Structure

Kōru's revenue model is simple and aligned with user outcomes:

| Action                                  | Fee                    |
| --------------------------------------- | ---------------------- |
| Creating an account                     | Free                   |
| Creating a Summon                       | Free                   |
| Backing a Summon                        | Free                   |
| Browsing and discovery                  | Free                   |
| Completed transaction (paid engagement) | Up to 10% platform fee |
| Host doesn't accept / Seeker reclaims   | No fee                 |
| Host declines a request                 | No fee                 |

The platform only earns revenue when value is successfully delivered — when a Host responds and a Seeker receives what they paid for. This alignment ensures Kōru is incentivized to maximize successful outcomes, not transaction volume.

### 8.2 Fee Transparency

- The complete fee breakdown is shown to Seekers **before** they confirm payment.
- Hosts see the net amount they'll receive after fees **before** they accept a request.
- No hidden charges, no subscription fees, no feature-gating behind paywalls.

### 8.3 Host Earnings

Hosts set their own prices and receive payment automatically upon successful completion:

- **Per-message rates:** Set by the Host, visible on their profile
- **Per-session rates:** Tied to specific availability slots with defined durations
- **No payment chasing:** Funds release automatically through the smart contract
- **Full transaction history:** Complete earnings dashboard with detailed breakdowns
- **Wallet withdrawal:** Hosts can withdraw to their connected wallet at any time

### 8.4 Market Dynamics

Kōru's pricing is set by Hosts, creating a natural market:

- **High-demand Hosts** can raise prices as their reputation and request volume grow.
- **New Hosts** can set lower prices to build initial traction and ratings.
- **Specialized expertise** commands premium pricing — a 30-minute session with a top VC on fundraising strategy is worth more than a general business advice call.
- **Summons pledges** provide price discovery — showing Hosts what the market is willing to pay before they even join.

---

## 9. Use Cases

### 9.1 For Founders

**The Ask:** "I need 15 minutes with a specific investor to pitch my seed round."

**Before Kōru:** Send cold emails. Ask for warm intros. Attend networking events hoping to bump into the right person. Wait weeks. Get ghosted.

**With Kōru:** Search for the investor on Kōru. If they're on the platform, book a session at their stated rate. If not, create a Summon — rallying other founders who also want access. The investor sees $20,000 in pledges from 40 founders and joins the platform. You book your 15-minute pitch. The investor responds or you get your money back.

### 9.2 For Job Seekers

**The Ask:** "I want career advice from a VP of Engineering at a company I admire."

**Before Kōru:** Send a LinkedIn message that gets buried. Ask for an informational interview that never gets scheduled. Apply through the standard process and hope for the best.

**With Kōru:** Find the VP on Kōru. Pay $50 to send a thoughtful message with your specific questions. They respond within 48 hours with actionable advice — and you've just created a real connection backed by a demonstrated willingness to invest in your own growth.

### 9.3 For Creators

**The Ask:** "I want feedback on my content strategy from a creator who's built a 500K+ audience."

**Before Kōru:** DM them on X. Comment on their posts hoping to get noticed. Pay for a generic course that doesn't address your specific situation.

**With Kōru:** Book a session. Share your analytics, your content, your specific questions. Get personalized, actionable feedback from someone who's done exactly what you're trying to do.

### 9.4 For Experts & Hosts

**The Ask:** "I have deep expertise and hundreds of people asking for my time. I want to help people without burning out."

**Before Kōru:** Respond to DMs for free until it becomes unsustainable. Ignore most messages and feel guilty. Launch a course or community that requires ongoing content creation.

**With Kōru:** Set up a profile. Define your pricing and availability. Accept requests that align with your expertise. Get paid automatically. Help people on your terms, on your schedule, with clear boundaries.

### 9.5 For Web3 & Crypto

**The Ask:** "I need technical guidance on smart contract architecture from someone who's shipped production DeFi protocols."

**Before Kōru:** Join Discord servers. Ask in public channels. Hope someone with real experience sees your message among thousands.

**With Kōru:** Find a verified smart contract expert. Pay for a focused session where you can share your code, get specific feedback, and walk away with actionable next steps.

---

## 10. Technical Architecture

### 10.1 Stack Overview

Kōru is built on a modern, production-grade stack optimized for speed, reliability, and real-time interaction:

| Layer               | Technology                                                       |
| ------------------- | ---------------------------------------------------------------- |
| **Frontend**        | Next.js 15 (App Router), React 18, TypeScript                    |
| **Styling**         | Tailwind CSS with custom design tokens, Framer Motion animations |
| **Authentication**  | NextAuth with Twitter OAuth 2.0                                  |
| **Database**        | Supabase (PostgreSQL) with Row-Level Security                    |
| **Real-time**       | Supabase Realtime (WebSocket channels)                           |
| **Wallet**          | Privy SDK with Base chain support                                |
| **Smart Contracts** | Solidity on Base (Ethereum L2)                                   |
| **Payments**        | USDC on Base                                                     |
| **Hosting**         | Vercel                                                           |

### 10.2 Data Architecture

The platform's data model centers around five core entities:

- **Users:** Twitter-linked accounts with creator settings (rate, response time), balances, tags, and connected wallets.
- **Summons:** Public pledges targeting a Twitter handle with message, pledged/goal amounts, backers count, status, and expiry.
- **Chats:** Requester/creator linkage with status, pricing, escrow references, unread counters, and deadlines.
- **Messages:** Per-chat messages with real-time delivery via Supabase Realtime channels.
- **Transactions:** Payments, refunds, and pledges with type, status, amounts, and on-chain references.

### 10.3 Real-time Communication

Chat messaging uses Supabase Realtime subscriptions for instant message delivery:

- Messages are persisted to PostgreSQL and broadcast via WebSocket in the same operation
- Client-side hooks subscribe to per-chat channels for live updates
- Unread counts are tracked both server-side (for accuracy) and client-side (for performance)
- Typing indicators and read receipts provide real-time interaction feedback

### 10.4 Wallet Integration

Kōru uses Privy for wallet connection, supporting:

- **External wallets:** MetaMask, Coinbase Wallet, WalletConnect, and other popular options
- **Embedded wallets:** Automatically created for users without existing crypto wallets
- **Base chain:** All transactions occur on Base for low fees and fast confirmation
- **Email login:** Users can create wallets with just an email address, lowering the barrier to entry for non-crypto-native users

---

## 11. Roadmap

### Phase 1: Foundation (Current)

- Core marketplace: discovery, profiles, messaging, escrow
- Summons protocol for demand-side discovery
- X (Twitter) authentication and social graph integration
- USDC payments on Base
- Mobile-responsive web application

### Phase 2: Growth

- Native mobile applications (iOS, Android)
- Video call integration for live sessions
- Advanced Host analytics and earnings dashboard
- Enhanced matching and recommendation algorithms
- Multi-chain wallet support
- Expanded category coverage

### Phase 3: Scale

- API access for third-party integrations
- Enterprise tier for organizations
- Cross-platform Summons (beyond X/Twitter)
- Reputation portability (on-chain credentials)
- Community governance mechanisms
- International expansion with localized experiences

### Phase 4: Protocol

- Open protocol for attention markets
- SDK for developers to build on Kōru's infrastructure
- Decentralized dispute resolution
- Cross-platform interoperability
- Token-gated access tiers

---

## 12. Conclusion

The internet's original promise was that anyone could reach anyone. That promise remains unfulfilled — not because of technological limitation, but because of misaligned incentives. Sending a message is free, which means every message is equally ignorable. The cost of sending approaches zero while the cost of receiving (in attention, time, and cognitive load) approaches infinity.

Kōru resolves this asymmetry by introducing a simple economic primitive: **paid, guaranteed, escrowed messaging.** When sending a message costs something, it signals seriousness. When receiving a message pays something, it compensates attention. When the outcome is guaranteed (response or refund), both parties can transact with confidence.

This isn't about making communication expensive. It's about making it honest. The person sending a $100 message to an investor isn't paying for the privilege of being heard — they're proving that their request is worth hearing. The investor isn't selling access — they're being compensated for the real cost of their attention.

Kōru turns "DMs" from a lottery into a system. A system where attention has value, time is respected, and good opportunities don't die in silence.

**No ghosting. Just outcomes.**

---

_For more information, visit [koruapp.xyz](https://koruapp.xyz) or follow [@koruapp](https://x.com/koruapp) on X._

_Contact: hello@koruapp.com_
