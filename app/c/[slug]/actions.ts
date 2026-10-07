"use server";

import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { sendMail, adminEmail } from "@/lib/mailer";
import { releaseStaleHolds } from "@/lib/holds";

export async function startCheckout(input: {
  slotId: string;
  sponsorName: string;
  company: string;
  email: string;
  logoUrl?: string;
}) {
  await releaseStaleHolds();
  const slot = await prisma.slot.findUnique({
    include: { campaign: { include: { creator: true } } },
    where: { id: input.slotId },
  });
  if (!slot) throw new Error("Slot not found");
  if (slot.status !== "available") throw new Error("Slot is no longer available");

  // Hold the slot so two sponsors can't both check out at once.
  await prisma.slot.update({ where: { id: slot.id }, data: { status: "pending" } });

  const sponsorship = await prisma.sponsorship.create({
    data: {
      slotId: slot.id,
      sponsorName: input.sponsorName,
      company: input.company,
      email: input.email,
      logoUrl: input.logoUrl || null,
      amount: slot.price,
    },
  });

  const stripe = getStripe();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (!stripe) {
    // Dev fallback with no Stripe keys configured: skip to a mock confirmation page.
    return { checkoutUrl: `/c/${slot.campaign.slug}/mock-pay?sponsorship=${sponsorship.id}` };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `${slot.name} — ${slot.campaign.activityTitle}` },
          unit_amount: slot.price * 100,
        },
        quantity: 1,
      },
    ],
    customer_email: input.email,
    success_url: `${baseUrl}/c/${slot.campaign.slug}?paid=1`,
    cancel_url: `${baseUrl}/c/${slot.campaign.slug}?cancelled=1`,
    metadata: { sponsorshipId: sponsorship.id, slotId: slot.id },
  });

  await prisma.sponsorship.update({
    where: { id: sponsorship.id },
    data: { stripeSessionId: session.id },
  });

  return { checkoutUrl: session.url! };
}

export async function placeBid(input: {
  slotId: string;
  bidderName: string;
  company: string;
  email: string;
  amount: number;
}) {
  const slot = await prisma.slot.findUnique({
    where: { id: input.slotId },
    include: { bids: { orderBy: { amount: "desc" }, take: 1 } },
  });
  if (!slot) throw new Error("Slot not found");
  if (!slot.isAuction) throw new Error("This slot isn't an auction");
  if (slot.status !== "available") throw new Error("Bidding has closed on this slot");

  const currentHigh = slot.bids[0]?.amount ?? slot.price - 1;
  if (input.amount <= currentHigh) {
    throw new Error(`Bid must beat the current highest bid of $${currentHigh}`);
  }

  await prisma.bid.create({
    data: {
      slotId: slot.id,
      bidderName: input.bidderName,
      company: input.company,
      email: input.email,
      amount: input.amount,
    },
  });

  return { ok: true };
}

export async function submitInquiry(input: {
  campaignId?: string;
  brandName: string;
  company: string;
  email: string;
  objective: string;
  budgetRange?: string;
}) {
  const inquiry = await prisma.inquiry.create({
    data: {
      campaignId: input.campaignId || null,
      brandName: input.brandName,
      company: input.company,
      email: input.email,
      objective: input.objective,
      budgetRange: input.budgetRange || null,
    },
  });

  await sendMail({
    to: adminEmail(),
    subject: `New brand inquiry: ${input.company}`,
    html: `
      <p><strong>${input.brandName}</strong> from <strong>${input.company}</strong> (${input.email}) sent an inquiry.</p>
      <p><strong>Objective:</strong> ${input.objective}</p>
      ${input.budgetRange ? `<p><strong>Budget range:</strong> ${input.budgetRange}</p>` : ""}
      <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/inquiries">Review in admin panel</a></p>
    `,
  });

  return { ok: true, id: inquiry.id };
}
