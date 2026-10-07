import Link from "next/link";
import { prisma } from "@/lib/db";
import { CATEGORIES, categoryLabel } from "@/lib/categories";
import RevealHeadline from "./RevealHeadline";
import HotspotHero from "./HotspotHero";
import SiteHeader from "./SiteHeader";

export const dynamic = "force-dynamic";

const SURFACES = [
  { image: "/scenes/athlete.jpg", label: "Race kit", example: "HYROX World Champs" },
  { image: "/scenes/stream.jpg", label: "Stream overlay", example: "A 24-hour livestream" },
  { image: "/scenes/festival.jpg", label: "Festival screen", example: "Between-set loop" },
  { image: "/scenes/podcast.jpg", label: "Podcast pre-roll", example: "10 episodes" },
  { image: "/scenes/stage.jpg", label: "Keynote slide", example: "2,000 in the room" },
  { image: "/scenes/vlog.jpg", label: "Video integration", example: "A travel series" },
  { image: "/scenes/newsletter.jpg", label: "Newsletter slot", example: "40k subscribers" },
  { image: "/scenes/helmet.jpg", label: "Pro kit", example: "A full race season" },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const campaigns = await prisma.campaign.findMany({
    where: { status: "approved" },
    include: { creator: true, slots: { include: { sponsorship: true } } },
    orderBy: { createdAt: "desc" },
  });

  const filtered = category ? campaigns.filter((c) => c.category === category) : campaigns;

  const categoryTiles = CATEGORIES.map((c) => {
    const inCategory = campaigns.filter((camp) => camp.category === c.value);
    return { ...c, count: inCategory.length, sample: inCategory[0] };
  });

  const ranked = filtered
    .map((c) => {
      const sold = c.slots.filter((s) => s.status === "sold");
      return {
        ...c,
        raised: sold.reduce((sum, s) => sum + s.price, 0),
        soldCount: sold.length,
        totalSlots: c.slots.length,
      };
    })
    .sort((a, b) => b.raised - a.raised);

  // Ticker is built only from real campaign data: paid sponsorships and open slots.
  const tickerItems = campaigns.flatMap((c) =>
    c.slots.map((s) =>
      s.status === "sold" && s.sponsorship
        ? `${s.sponsorship.company} sponsored ${s.name} on ${c.activityTitle} · $${s.price.toLocaleString()}`
        : `${s.name} open on ${c.activityTitle} · $${s.price.toLocaleString()}`
    )
  );

  return (
    <div className="flex-1 bg-zinc-50">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-orange-600/20 blur-[120px]" />
        <SiteHeader />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-[1fr_1.15fr] lg:pb-28 lg:pt-16">
          <div>
            <RevealHeadline className="text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Turn your moments{" "}
              <span className="font-display font-normal italic text-orange-500">into money.</span>
            </RevealHeadline>
            <p className="mt-6 max-w-md text-lg text-zinc-300">
              You already have the race, the stage, the stream. Turn it into sponsor slots in minutes — you set the price,
              you approve the brand, you get paid the moment it sells.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/create" className="rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold hover:bg-orange-500">
                Create your campaign
              </Link>
              <a href="/brands" className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold hover:bg-white/10">
                I&apos;m a brand
              </a>
            </div>
          </div>
          <HotspotHero />
        </div>

        {tickerItems.length > 0 && (
          <div className="relative overflow-hidden border-t border-white/10 bg-black/40 py-3">
            <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-10 whitespace-nowrap text-sm text-zinc-400">
              {[...tickerItems, ...tickerItems].map((t, i) => (
                <span key={i} className="flex items-center gap-10">
                  {t}
                  <span className="text-orange-500">✦</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── How it works ─────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">How it works</p>
          <RevealHeadline as="h2" onView className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
            Moment <span className="font-display font-normal italic">to money.</span>
          </RevealHeadline>
        </div>
        <div className="relative mt-16 grid gap-6 md:grid-cols-3">
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-[3.25rem] hidden h-px bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200 md:block" />
          <Step n="1" title="List it" body="Add your journey and the surfaces brands can buy.">
            <div className="space-y-1.5">
              {[["Chest logo", "$3,000"], ["Arm patch", "$1,200"], ["Race-day reel", "$1,500"]].map(([n, p], i) => (
                <div key={n} className="flex justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm animate-[rise_0.6s_ease_both]" style={{ animationDelay: `${i * 150}ms` }}>
                  <span className="text-zinc-600">{n}</span>
                  <span className="font-semibold">{p}</span>
                </div>
              ))}
            </div>
          </Step>
          <Step n="2" title="Share it" body="One link, with your verified reach right on it.">
            <div className="rounded-xl bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-rose-500" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Racing HYROX World Champs</p>
                  <p className="text-[11px] font-semibold text-orange-600">✓ Verified · 64k followers</p>
                </div>
              </div>
              <p className="mt-3 truncate rounded-md bg-zinc-100 px-2 py-1.5 text-xs text-zinc-500">sponsormyjourney.com/c/hyrox-worlds</p>
            </div>
          </Step>
          <Step n="3" title="Get paid" body="A brand checks out. The slot flips to SOLD.">
            <div className="relative overflow-hidden rounded-xl bg-white p-4 shadow-sm">
              <p className="text-[11px] uppercase tracking-widest text-zinc-500">Chest logo</p>
              <p className="text-2xl font-semibold">$3,000</p>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 -rotate-6 rounded-md border-2 border-zinc-900 px-2 py-0.5 text-xs font-black tracking-widest">
                SOLD
              </span>
            </div>
          </Step>
        </div>
      </section>

      {/* ── Anything can be sponsored ───────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <RevealHeadline as="h2" onView className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              If people can see it, <span className="font-display font-normal italic text-orange-600">it&apos;s sponsorable.</span>
            </RevealHeadline>
            <p className="max-w-xs text-zinc-600">Race days, stages, streams, episodes, launches. If an audience sees it, a brand will pay for it.</p>
          </div>
          <div className="mt-12 grid auto-rows-[200px] grid-flow-dense grid-cols-2 gap-3 md:auto-rows-[220px] md:grid-cols-4 md:gap-4">
            {SURFACES.map((s, i) => (
              <div
                key={s.label}
                className={`group relative overflow-hidden rounded-3xl bg-zinc-200 ${[0, 2, 4, 5].includes(i) ? "md:row-span-2" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image} alt={s.label} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-4 text-white md:p-5">
                  <div>
                    <p className="font-display text-xl leading-tight md:text-2xl lg:text-3xl">{s.label}</p>
                    <p className="mt-1 text-xs text-zinc-300">{s.example}</p>
                  </div>
                  <span className="translate-y-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-900 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    Sponsor →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who buys ─────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">
            Brands already <span className="font-display font-normal italic text-orange-600">buying these moments.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-zinc-600">We match every campaign with the brands that already spend in that space.</p>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { cat: "Sports & Expeditions", ring: "border-orange-400", chip: "bg-orange-50 text-orange-800", buyers: ["Supplements & nutrition", "Apparel & footwear", "Fitness apps & wearables"], note: "Endemic brands that want race-day visibility and training content." },
              { cat: "Events & Stages", ring: "border-zinc-300", chip: "bg-zinc-100 text-zinc-800", buyers: ["B2B SaaS", "Dev & AI tools", "Fintech & payments"], note: "Companies that already sponsor conferences and want the speaker, not just a booth." },
              { cat: "Creators & Streams", ring: "border-zinc-300", chip: "bg-zinc-100 text-zinc-800", buyers: ["Gaming studios", "Peripherals & hardware", "Energy drinks"], note: "Brands that buy live attention from engaged, younger audiences." },
            ].map((c) => (
              <div key={c.cat} className={`rounded-3xl border-2 ${c.ring} bg-white p-7`}>
                <p className="text-lg font-semibold">{c.cat}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.buyers.map((b) => (
                    <span key={b} className={`rounded-full px-3 py-1 text-sm ${c.chip}`}>{b}</span>
                  ))}
                </div>
                <p className="mt-5 text-sm text-zinc-600">{c.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Two sides ────────────────────────────────────── */}
      <section id="brands" className="mx-auto grid max-w-6xl gap-6 px-6 py-24 md:grid-cols-2">
        <div className="flex flex-col rounded-3xl bg-zinc-950 p-10 text-white">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">For creators</p>
          <RevealHeadline as="h3" onView className="mt-3 font-display text-4xl">Your audience is worth something.</RevealHeadline>
          <ul className="mb-8 mt-6 space-y-3 text-zinc-300">
            <li>→ Set your own prices, or run an auction</li>
            <li>→ Approve every sponsor before it&apos;s final</li>
            <li>→ One link to share, no media kit needed</li>
          </ul>
          <Link href="/create" className="mt-auto self-start inline-block rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold hover:bg-orange-500">
            Create your campaign
          </Link>
        </div>
        <div className="flex flex-col rounded-3xl border border-zinc-200 bg-white p-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">For brands</p>
          <RevealHeadline as="h3" onView className="mt-3 font-display text-4xl">Sponsor moments, not banner ads.</RevealHeadline>
          <ul className="mb-8 mt-6 space-y-3 text-zinc-600">
            <li>→ Reach checked by a human before anything goes live</li>
            <li>→ Fixed price or bid, paid through secure checkout</li>
            <li>→ Not ready to buy? Send your objectives and we&apos;ll match you</li>
          </ul>
          <a href="#campaigns" className="mt-auto self-start inline-block rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700">
            Browse live campaigns
          </a>
        </div>
      </section>

      {/* ── Live campaigns ───────────────────────────────── */}
      <section id="campaigns" className="mx-auto max-w-6xl px-6 pb-24">
        <RevealHeadline as="h2" onView className="text-4xl font-semibold tracking-tight">
          Live <span className="font-display font-normal italic">campaigns</span>
        </RevealHeadline>
        <div className="-mx-6 mt-8 flex gap-2 overflow-x-auto px-6 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
          <Link
            href="/#campaigns"
            className={`shrink-0 rounded-full border px-4 py-2 text-sm ${!category ? "border-zinc-900 bg-zinc-900 text-white" : "bg-white hover:border-zinc-400"}`}
          >
            All · {campaigns.length}
          </Link>
          {categoryTiles.map((c) => (
            <Link
              key={c.value}
              href={`/?category=${c.value}#campaigns`}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm ${
                category === c.value ? "border-orange-600 bg-orange-600 text-white" : "bg-white hover:border-zinc-400"
              }`}
            >
              {c.label} · {c.count}
            </Link>
          ))}
        </div>

        {ranked.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center text-zinc-500">
            Nothing live here yet.{" "}
            <Link href="/create" className="underline">
              Be the first
            </Link>
            .
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ranked.map((c) => {
              const thumb = c.images.split(",")[0]?.trim();
              return (
                <Link key={c.id} href={`/c/${c.slug}`} className="group overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-lg">
                  <div className="relative h-48 overflow-hidden bg-zinc-100">
                    {thumb && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-zinc-700">
                      {categoryLabel(c.category)}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold">{c.activityTitle}</h3>
                    <p className="text-sm text-zinc-500">
                      by {c.creator.name} · {new Date(c.eventDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="font-semibold">${c.raised.toLocaleString()} raised</span>
                      <span className="text-zinc-500">
                        {c.soldCount}/{c.totalSlots} sold
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-zinc-100">
                      <div className="h-1.5 rounded-full bg-orange-600" style={{ width: `${c.totalSlots ? (c.soldCount / c.totalSlots) * 100 : 0}%` }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Closing CTA ──────────────────────────────────── */}
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-orange-600/25 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center">
          <RevealHeadline as="h2" onView className="font-display text-6xl leading-none sm:text-8xl">
            What&apos;s your <span className="italic text-orange-500">journey?</span>
          </RevealHeadline>
          <form action="/create" className="mx-auto mt-10 flex max-w-xl items-center gap-2 rounded-full bg-white/10 p-2 ring-1 ring-white/15">
            <span className="pl-4 text-zinc-400">I&apos;m</span>
            <input
              name="title"
              required
              placeholder="racing HYROX World Championships…"
              className="min-w-0 flex-1 bg-transparent py-2 text-white placeholder:text-zinc-500 focus:outline-none"
            />
            <button className="rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold hover:bg-orange-500">Start →</button>
          </form>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-400">
            {["Free to list", "Reach verified by a human", "Paid through secure checkout"].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-orange-500 text-[9px] text-orange-500">✓</span>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Step({ n, title, body, children }: { n: string; title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="relative rounded-3xl bg-zinc-100 p-6">
      <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 font-display text-xl text-white ring-8 ring-zinc-50">
        {n}
      </span>
      <h3 className="mt-5 text-2xl font-semibold">{title}</h3>
      <p className="mt-1 text-zinc-600">{body}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
