import Link from "next/link";
import SiteHeader from "../SiteHeader";
import RevealHeadline from "../RevealHeadline";

const FAQ = [
  ["Who can list?", "Athletes, creators, speakers and streamers with a dated moment and a real audience. We review every page before it goes live."],
  ["How do you check my reach?", "You share your profile link and follower count. A person on our team checks it and adds a verified badge to your page."],
  ["Do I have to accept every sponsor?", "No. You approve every sponsor before anything is final."],
  ["When do I get paid?", "Brands pay at checkout. You receive the payout once you've delivered and posted proof."],
];

export default function CreatorsPage() {
  return (
    <div className="flex-1 bg-zinc-50">
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-orange-600/20 blur-[120px]" />
        <SiteHeader />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">For athletes & creators</p>
            <RevealHeadline className="mt-4 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
              Your moment, <span className="font-display font-normal italic text-orange-500">your price.</span>
            </RevealHeadline>
            <p className="mt-6 max-w-md text-lg text-zinc-300">
              Turn your race, season, keynote or stream into a page of sponsor slots. Share one link. Brands pay at checkout.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/create" className="rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold hover:bg-orange-500">
                Create your page
              </Link>
              <Link href="/c/hyrox-world-championships" className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold hover:bg-white/10">
                See an example
              </Link>
            </div>
          </div>
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/scenes/athlete.jpg" alt="" className="aspect-[4/3] w-full rounded-[2rem] object-cover ring-1 ring-white/10" />
            <div className="absolute -bottom-6 left-6 right-6 rounded-2xl border border-white/15 bg-zinc-950/70 p-4 backdrop-blur-xl sm:left-auto sm:w-72">
              <p className="text-xs text-zinc-400">sponsormyjourney.com/c/hyrox-worlds</p>
              <div className="mt-2 space-y-1.5 text-sm">
                {[["Chest logo", "$3,000", true], ["Arm patch", "$1,200"], ["Race-day reel", "$1,500"]].map(([n, p, sold]) => (
                  <div key={n as string} className="flex justify-between">
                    <span className={sold ? "text-zinc-500 line-through" : ""}>{n}</span>
                    <span className="font-semibold">{sold ? "SOLD" : p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <RevealHeadline as="h2" onView className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">
          Simple, <span className="font-display font-normal italic text-orange-600">fair pricing.</span>
        </RevealHeadline>
        <p className="mx-auto mt-3 max-w-lg text-center text-zinc-600">Free to list. We only earn when you get paid.</p>
        <div className="mx-auto mt-12 grid max-w-3xl gap-5 md:grid-cols-2">
          <div className="rounded-3xl border bg-white p-8">
            <p className="text-sm font-medium text-zinc-500">Sponsors you bring</p>
            <p className="mt-2 text-6xl font-semibold tracking-tight">10%</p>
            <p className="mt-3 text-zinc-600">You share your link, a brand books. Covers payments and checkout.</p>
          </div>
          <div className="rounded-3xl bg-zinc-950 p-8 text-white">
            <p className="text-sm font-medium text-zinc-400">Sponsors we bring</p>
            <p className="mt-2 text-6xl font-semibold tracking-tight text-orange-500">20%</p>
            <p className="mt-3 text-zinc-300">We match you with a brand from our network. You only pay when it sells.</p>
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <RevealHeadline as="h2" onView className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Questions, <span className="font-display font-normal italic">answered.</span>
          </RevealHeadline>
          <div className="divide-y rounded-3xl border">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                  {q}
                  <span className="text-xl text-zinc-400 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-zinc-600">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 py-24 text-center text-white">
        <RevealHeadline as="h2" onView className="font-display text-6xl leading-none sm:text-7xl">
          What&apos;s your <span className="italic text-orange-500">moment?</span>
        </RevealHeadline>
        <Link href="/create" className="mt-10 inline-block rounded-full bg-orange-600 px-8 py-4 font-semibold hover:bg-orange-500">
          Create your page
        </Link>
      </section>
    </div>
  );
}
