import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { sendMail, adminEmail } from "@/lib/mailer";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const sponsorshipId = session.metadata?.sponsorshipId;
    if (sponsorshipId) {
      const sponsorship = await prisma.sponsorship.findUnique({
        where: { id: sponsorshipId },
        include: { slot: { include: { campaign: { include: { creator: true } } } } },
      });
      if (sponsorship && sponsorship.paymentStatus !== "paid") {
        await prisma.$transaction([
          prisma.sponsorship.update({
            where: { id: sponsorshipId },
            data: { paymentStatus: "paid" },
          }),
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
      }
    }
  }

  return NextResponse.json({ received: true });
}
