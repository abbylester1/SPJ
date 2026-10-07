# Sponsor My Journey

**Turn a race day, a keynote, a livestream, or a product launch into sponsorship inventory a brand can buy — a slot, a price, a checkout link.**

Sponsor My Journey lets an athlete, creator, speaker, or founder list the visible surfaces and moments of something they're already doing — a chest logo on race day, a pre-roll on a podcast episode, an overlay on a 24-hour stream — as individually priced slots. A brand books a specific slot (fixed price or auction), pays through checkout, and the slot flips to **SOLD** in real time. No media kit, no back-and-forth, no agency in the middle.

## How it works

1. **List it.** The creator picks a category (Sports & Expeditions, Creators & Streams, Podcasts & Newsletters, Events & Stages, Launches & Products), adds their journey and 1–10 sponsorship slots. A suggested price range is computed from their claimed reach, event scale, and slot prominence — the creator always sets the final ask.
2. **Get verified.** The campaign goes into review. An admin checks the creator's claimed social reach by hand and approves the page, which also doubles as content moderation.
3. **Share one link.** The public campaign page shows a verified-reach badge, a countdown to the event, and the live slot board — SOLD, on hold, or available.
4. **Get paid.** A brand books a slot through Stripe Checkout (or wins an auction), the slot is marked sold the instant payment clears, and the sponsor, creator, and admin are all notified by email.

## Features

- **Creator onboarding** with category-specific slot presets and a live preview of the public page as the form is filled in.
- **Admin panel** (`/admin`) — campaign review queue, reach verification, sponsorships (with refund), payments/GMV, creators, and brand inquiries, all password-gated.
- **Public campaign pages** (`/c/[slug]`) with a photo hero, verified-reach badge, slot board, and a "not ready to buy" inquiry form for brands.
- **Checkout** via Stripe, with an automatic 30-minute hold release so two sponsors can't buy the same slot, and a mock-pay fallback so the full flow works without live Stripe keys.
- **Auctions** — any slot can be fixed price or open to bidding, with admin closing the auction and notifying the winner.
- **`/brands` and `/creators` landing pages** — separate funnels for the two sides of the marketplace, each with its own pitch, pricing, and call to action.
- **Interactive homepage** — a rotating hotspot hero showing real example campaigns, a live sales ticker, and a filterable leaderboard of active campaigns by category.

## Tech stack

- **[Next.js 16](https://nextjs.org)** (App Router, Server Actions) + TypeScript
- **[Prisma](https://www.prisma.io)** + SQLite (swap the `DATABASE_URL` for Postgres in production)
- **[Stripe](https://stripe.com)** Checkout + webhooks for payment
- **[Resend](https://resend.com)** for transactional email (falls back to console logging in development)
- **Tailwind CSS v4** for styling, **[kugiri](https://github.com/edoardolunardi/kugiri)** for line-based text reveal animation

## Getting started

```bash
pnpm install
cp .env.example .env   # fill in values — see below
npx prisma db push
pnpm dev
```

Visit `http://localhost:3000`. Create a campaign at `/create`, then approve it at `/admin` (see `ADMIN_PASSWORD` below).

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | yes | SQLite file path for development (`file:./dev.db`); point at Postgres in production. |
| `ADMIN_PASSWORD` | yes | Password for `/admin/login`. Change this before deploying. |
| `NEXT_PUBLIC_BASE_URL` | yes | Used to build absolute links in emails and Stripe redirect URLs. |
| `STRIPE_SECRET_KEY` | no | Omit to use the `/mock-pay` fallback instead of real Stripe Checkout. |
| `STRIPE_WEBHOOK_SECRET` | no | Required alongside `STRIPE_SECRET_KEY` for the webhook to verify and process `checkout.session.completed` events. |
| `RESEND_API_KEY` | no | Omit to log outgoing emails to the console instead of sending them. |
| `ADMIN_EMAIL` | no | Where admin notifications (new campaign, new inquiry, payment) are sent. |

## Project structure

```
app/
  page.tsx            # Homepage: hero, how-it-works, leaderboard
  brands/             # Brand-facing landing page
  creators/           # Creator-facing landing page
  create/             # Campaign creation form + server actions
  c/[slug]/            # Public campaign page, slot list, checkout, bids, inquiries
  admin/              # Password-gated admin panel
  api/stripe-webhook/ # Stripe webhook handler
lib/
  scoring.ts          # Suggested-price engine (reach × event tier × slot prominence)
  categories.ts       # Campaign category definitions and slot presets
  holds.ts            # Releases abandoned checkout holds after 30 minutes
  stripe.ts / mailer.ts / db.ts
prisma/schema.prisma  # Creator, Campaign, Slot, Sponsorship, Bid, Inquiry models
```

## Known limitations (MVP scope)

These are deliberate scope cuts for a fast first version, not oversights:

- **No Stripe Connect** — payouts to creators are handled manually. Add Connect Express before onboarding more than one or two creators for real money.
- **No real file upload** — photo and logo fields take a pasted URL.
- **Manual reach verification** — an admin checks the claimed social link by eye rather than an OAuth integration.
- **Auction winners pay through the mock-pay fallback** even when Stripe is configured for fixed-price slots — wiring a real Stripe session for a declared winner is a small follow-up.
- **No auction close-time enforcement** — admin manually decides when to close an auction (`auctionEndsAt` exists on the schema but isn't enforced yet).

## License

Proprietary — all rights reserved.
