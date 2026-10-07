import Link from "next/link";
import { prisma } from "@/lib/db";
import { categoryLabel } from "@/lib/categories";
import SiteHeader from "../SiteHeader";
import RevealHeadline from "../RevealHeadline";
import InquiryForm from "../c/[slug]/InquiryForm";

export const dynamic = "force-dynamic";

const BUYERS = [
  { cat: "Sports & Expeditions", featured: true, buyers: ["Supplements & nutrition", "Apparel & footwear", "Fitness apps & wearables"], example: "Chest logo at HYROX World Championships · $3,000" },
  { cat: "Events & Stages", buyers: ["B2B SaaS", "Dev & AI tools", "Fintech & payments"], example: "Intro slide at a 2,000-seat keynote · $3,000" },
  { cat: "Creators & Streams", buyers: ["Gaming studios", "Peripherals & hardware", "Energy drinks"], example: "24-hour stream overlay · $2,500" },
];

export default async function BrandsPage() {
  const campaigns = await prisma.campaign.findMany({
    where: { status: "approved" },
    include: { creator: { include: { socials: true } }, slots: true },
    orderBy: { eventDate: "asc" },
  });

  const open = campaigns
    .map((c) => ({ ...c, openSlots: c.slots.filter((s) => s.status === "available") }))
    .filter((c) => c.openSlots.length > 0)
    .sort((a, b) => (a.category === "sports" ? -1 : 0) - (b.category === "sports" ? -1 : 0))
    .slice(0, 6);

  return (
    <div className="flex-1 bg-zinc-50">
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-orange-600/20 blur-[120px]" />
        <SiteHeader />
        <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">For brands</p>
          <RevealHeadline className="mt-4 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
            Sponsor the moments <span className="font-display font-normal italic text-orange-500">people actually watch.</span>
          </RevealHeadline>
          <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-300">
            Race days, keynotes, live streams. Book a specific placement with a verified creator, pay through checkout, and get
            proof it ran.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#open" className="rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold hover:bg-orange-500">
              Browse open slots
            </a>
            <a href="#brief" className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold hover:bg-white/10">
              Send us a brief
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-24 md:grid-cols-3">
        {[
          ["Verified reach", "Every creator's audience is checked by a person before their page goes live."],
          ["One placement, one price", "Buy the chest logo, the intro slide or the overlay, not a vague 'collaboration'. Or bid on auction slots."],
          ["Proof after the moment", "Creators deliver photos, clips and posts after the event, so you have something to show for it."],
        ].map(([t, b], i) => (
          <div key={t} className="rounded-3xl border bg-white p-8">
            <p className="font-display text-4xl text-orange-600">0{i + 1}</p>
            <h3 className="mt-3 text-xl font-semibold">{t}</h3>
            <p className="mt-2 text-zinc-600">{b}</p>
          </div>
        ))}
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <RevealHeadline as="h2" onView className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Where brands like yours <span className="font-display font-normal italic text-orange-600">already spend.</span>
          </RevealHeadline>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {BUYERS.map((c) => (
              <div key={c.cat} className={`flex flex-col rounded-3xl border-2 p-7 ${c.featured ? "border-orange-400" : ""}`}>
                <p className="text-lg font-semibold">{c.cat}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.buyers.map((b) => (
                    <span key={b} className={`rounded-full px-3 py-1 text-sm ${c.featured ? "bg-orange-50 text-orange-800" : "bg-zinc-100 text-zinc-800"}`}>
                      {b}
                    </span>
                  ))}
                </div>
                <p className="mt-auto pt-6 text-sm text-zinc-500">e.g. {c.example}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="open" className="mx-auto max-w-6xl px-6 py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <RevealHeadline as="h2" onView className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Open <span className="font-display font-normal italic">right now.</span>
          </RevealHeadline>
          <Link href="/#campaigns" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
            All campaigns →
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {open.map((c) => {
            const reach = c.creator.socials.find((s) => s.verified);
            const thumb = c.images.split(",")[0]?.trim();
            const from = Math.min(...c.openSlots.map((s) => s.price));
            return (
              <Link key={c.id} href={`/c/${c.slug}`} className="group overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-lg">
                <div className="relative h-44 overflow-hidden bg-zinc-100">
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
                  <p className="mt-1 text-sm text-zinc-500">
                    {new Date(c.eventDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    {reach && <span className="ml-2 font-medium text-orange-600">✓ {(reach.verifiedFollowers ?? reach.followersClaimed).toLocaleString()} reach</span>}
                  </p>
                  <p className="mt-4 text-sm">
                    <span className="font-semibold">{c.openSlots.length} open</span>
                    <span className="text-zinc-500"> · from ${from.toLocaleString()}</span>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="brief" className="bg-zinc-950 py-24 text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2">
          <div>
            <RevealHeadline as="h2" onView className="font-display text-5xl leading-none sm:text-6xl">
              Not sure where to start? <span className="italic text-orange-500">Send a brief.</span>
            </RevealHeadline>
            <p className="mt-5 max-w-md text-zinc-400">
              Tell us your audience, budget and goal. We&apos;ll come back by email with matching athletes and creators.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-6 text-zinc-900">
            <InquiryForm />
          </div>
        </div>
      </section>
    </div>
  );
}
