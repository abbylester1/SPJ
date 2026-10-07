import { prisma } from "@/lib/db";
import { sendMail, adminEmail } from "@/lib/mailer";
import { redirect } from "next/navigation";
import Link from "next/link";

// Stand-in for Stripe Checkout when no keys are configured, so the full flow
// (slot -> sold, emails) can be tested end to end without Stripe.
export default async function MockPayPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sponsorship?: string; confirm?: string }>;
}) {
  const { slug } = await params;
  const { sponsorship: sponsorshipId, confirm } = await searchParams;
  if (!sponsorshipId) redirect(`/c/${slug}`);

  const sponsorship = await prisma.sponsorship.findUnique({
    where: { id: sponsorshipId },
    include: { slot: { include: { campaign: { include: { creator: true } } } } },
  });
  if (!sponsorship) redirect(`/c/${slug}`);

  if (confirm === "1" && sponsorship.paymentStatus !== "paid") {
    await prisma.$transaction([
      prisma.sponsorship.update({ where: { id: sponsorship.id }, data: { paymentStatus: "paid" } }),
      prisma.slot.update({ where: { id: sponsorship.slotId }, data: { status: "sold" } }),
    ]);

    await sendMail({
      to: sponsorship.email,
      subject: `You're confirmed: ${sponsorship.slot.name} on ${sponsorship.slot.campaign.activityTitle}`,
      html: `<p>Thanks ${sponsorship.sponsorName}! Your sponsorship of the <strong>${sponsorship.slot.name}</strong> slot ($${sponsorship.amount}) is confirmed.</p>`,
    });
    await sendMail({
      to: sponsorship.slot.campaign.creator.email,
      subject: `Sold: ${sponsorship.slot.name} on ${sponsorship.slot.campaign.activityTitle}`,
      html: `<p>${sponsorship.company} just sponsored your <strong>${sponsorship.slot.name}</strong> slot for $${sponsorship.amount}.</p>`,
    });
    await sendMail({
      to: adminEmail(),
      subject: `Payment recorded: ${sponsorship.slot.campaign.activityTitle}`,
      html: `<p>${sponsorship.company} paid $${sponsorship.amount} for ${sponsorship.slot.name}.</p>`,
    });

    redirect(`/c/${slug}?paid=1`);
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-xl border bg-white p-6 text-center">
        <p className="text-xs uppercase tracking-wide text-zinc-400">Stripe not configured — test mode</p>
        <h1 className="mt-2 text-xl font-bold">
          Pay ${sponsorship.amount} for {sponsorship.slot.name}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Add STRIPE_SECRET_KEY to replace this with real Stripe Checkout.
        </p>
        <Link
          href={`/c/${slug}/mock-pay?sponsorship=${sponsorshipId}&confirm=1`}
          className="mt-6 inline-block w-full rounded-full bg-black text-white py-2 font-medium"
        >
          Simulate successful payment
        </Link>
      </div>
    </div>
  );
}
