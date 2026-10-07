import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import SlotList from "./SlotList";
import InquiryForm from "./InquiryForm";
import { categoryLabel } from "@/lib/categories";
import { releaseStaleHolds } from "@/lib/holds";

export const dynamic = "force-dynamic";

export default async function CampaignPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ paid?: string; cancelled?: string }>;
}) {
  const { slug } = await params;
  const { paid, cancelled } = await searchParams;
  await releaseStaleHolds();
  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    include: {
      creator: { include: { socials: true } },
      slots: { include: { bids: { orderBy: { amount: "desc" }, take: 1 } } },
    },
  });

  if (!campaign || campaign.status !== "approved") notFound();

  const sold = campaign.slots.filter((s) => s.status === "sold").length;
  const raised = campaign.slots
    .filter((s) => s.status === "sold")
    .reduce((sum, s) => sum + s.price, 0);
  const verifiedSocial = campaign.creator.socials.find((s) => s.verified);
  const images = campaign.images.split(",").map((s) => s.trim()).filter(Boolean);
  const heroImage = images[0];
  const galleryImages = images.slice(1, 3);
  const daysLeft = Math.ceil(
    (new Date(campaign.eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="flex-1 bg-zinc-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-display text-xl">
              Sponsor My Journey
            </Link>
            <Link href="/creators" className="rounded-full border px-4 py-1.5 text-sm font-medium hover:border-zinc-400">
              Create yours →
            </Link>
          </div>
        </div>
      </header>

      {/* The photo carries the story — lead with it, not the copy. */}
      {heroImage && (
        <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-zinc-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-3xl px-6 pb-6 text-white">
            <p className="text-sm text-zinc-200">{campaign.creator.name} is</p>
            <h1 className="text-3xl font-bold leading-tight">{campaign.activityTitle}</h1>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-3xl px-6 py-8">
        {paid && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
            <span className="font-semibold">Payment received.</span> Your slot is confirmed and a receipt is on its way to your inbox.
          </div>
        )}
        {cancelled && (
          <div className="mb-6 rounded-2xl border bg-white px-5 py-4 text-sm text-zinc-600">Checkout cancelled. The slot is still yours to buy.</div>
        )}
        {!heroImage && (
          <div className="mb-2">
            <p className="text-sm text-zinc-500">{campaign.creator.name} is</p>
            <h1 className="text-2xl font-bold leading-tight">{campaign.activityTitle}</h1>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 text-sm">
          {verifiedSocial ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-600 text-white px-3 py-1.5 font-semibold">
              ✓ Verified · ~{verifiedSocial.verifiedFollowers ?? verifiedSocial.followersClaimed} on{" "}
              {verifiedSocial.platform}
            </span>
          ) : (
            <span className="rounded-full bg-zinc-200 text-zinc-600 px-3 py-1.5">
              Reach pending verification
            </span>
          )}
          <span className="rounded-full border border-zinc-300 px-3 py-1.5 text-zinc-700">
            {categoryLabel(campaign.category)}
          </span>
          <span className="rounded-full border border-zinc-300 px-3 py-1.5 text-zinc-700">
            {new Date(campaign.eventDate).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {daysLeft >= 0 && (
            <span className="rounded-full bg-amber-100 text-amber-800 px-3 py-1.5">
              closes in {daysLeft} day{daysLeft === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {galleryImages.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {galleryImages.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={img} alt="" className="h-32 w-full rounded-lg object-cover border" />
            ))}
          </div>
        )}

        <p className="mt-6 text-zinc-700 whitespace-pre-line">{campaign.description}</p>

        {campaign.socialLinks && (
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            {campaign.socialLinks.split(",").map((l) => (
              <a key={l} href={l.trim()} target="_blank" className="underline text-zinc-600">
                {l.trim()}
              </a>
            ))}
          </div>
        )}

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Sponsor my journey</h2>
            <span className="text-sm text-zinc-500">
              {sold} of {campaign.slots.length} sold · ${raised.toLocaleString()} raised
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-zinc-200">
            <div
              className="h-2 rounded-full bg-orange-600"
              style={{ width: `${(sold / Math.max(campaign.slots.length, 1)) * 100}%` }}
            />
          </div>

          <div className="mt-6">
            <SlotList slots={campaign.slots} campaignId={campaign.id} />
          </div>
        </section>

        <section className="mt-12 rounded-xl border bg-white p-6">
          <h2 className="font-semibold">Not ready to buy a slot?</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Tell us what you&apos;re trying to do and we&apos;ll get back to you by email.
          </p>
          <div className="mt-4">
            <InquiryForm campaignId={campaign.id} />
          </div>
        </section>
      </main>
    </div>
  );
}
