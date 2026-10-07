# Sponsor My Journey — MVP

Creators sell sponsorship slots on a personal challenge or event; brands buy a slot and pay via Stripe Checkout.

Not limited to sports: a campaign picks a category (Sports & Challenges, Events & Spaces, Life Milestones, Content & Creator, Builder & Launch) with its own slot presets, so "my journey" can be a race, a product launch, a wedding, a newsletter, or a road trip.

## Flow

1. **Creator** fills out a single onboarding form: category, profile, the journey itself, self-reported social reach, and 1-10 sponsorship slots, each either a fixed price or an auction. Suggested prices are computed from reach × event tier × slot prominence, shown only as a range — the creator always sets the final ask. Submitting puts the campaign into `pending_review`.
2. **Admin** (`/admin`, password-gated) reviews the claimed social links, verifies the follower count by eye, and approves or rejects the campaign. Approving makes the public page live and emails the creator.
3. **Public campaign page** (`/c/[slug]`) shows the slots, a sold/raised progress bar, and a verified-reach badge. Clicking an open fixed-price slot collects sponsor details and starts Stripe Checkout; clicking an auction slot opens a bid form instead. A brand not ready to buy can submit a free-form inquiry instead, which emails the admin.
4. **Payment**: Stripe Checkout webhook (`/api/stripe-webhook`) marks the slot `sold`, emails the sponsor and creator, and notifies admin. Without `STRIPE_SECRET_KEY` set, slot purchase falls back to a `/mock-pay` page so the whole flow is testable without Stripe. For an auction, admin closes it from the review queue, which declares the top bidder the winner and emails them a payment link (also via `/mock-pay` until Stripe is wired up for winners too).
5. **Home page** (`/`) is a leaderboard of live campaigns ranked by amount raised, filterable by category — this is the brand-facing discovery surface, since sponsors increasingly come from browsing rather than a creator's own DMs.
5. **Admin panel** also has Sponsorships (with refund, which reopens the slot), Payments (GMV total), Users, and Brand inquiries.

## Running locally

```bash
pnpm install
cp .env.example .env   # fill in values
npx prisma db push
pnpm dev
```

## Environment variables

- `DATABASE_URL` — SQLite file for now (`file:./dev.db`); swap for Postgres in production.
- `ADMIN_PASSWORD` — password for `/admin/login`.
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — optional; omit to use the mock-pay fallback.
- `RESEND_API_KEY` — optional; omit to log emails to the console instead of sending them.
- `ADMIN_EMAIL` — where admin notifications go.
- `NEXT_PUBLIC_BASE_URL` — used to build links in emails and Stripe redirect URLs.

## Known gaps (by design, for a 2-3 week MVP)

- No Stripe Connect yet — payouts to creators are manual. Add Connect Express before taking real money from more than one creator.
- Slot "pending" holds never expire (no 30-minute TTL sweep yet).
- No real file upload — photo/logo/image fields take a pasted URL.
- No OAuth social verification — admin eyeballs the claimed link by hand, as decided.
- Auction winners pay through the `/mock-pay` fallback even when Stripe is configured for fixed-price slots — wiring a real Stripe Checkout session for the declared winner is a quick follow-up, not done yet.
- No auction close time enforcement yet (`auctionEndsAt` exists on the schema but nothing reads it) — admin manually decides when to close an auction.

