"use server";

import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { clearAdminCookie } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function logout() {
  await clearAdminCookie();
  redirect("/admin/login");
}

export async function approveCampaign(campaignId: string) {
  const campaign = await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: "approved" },
    include: { creator: true },
  });
  await sendMail({
    to: campaign.creator.email,
    subject: `Your campaign is live: ${campaign.activityTitle}`,
    html: `<p>Your campaign is approved and live at ${process.env.NEXT_PUBLIC_BASE_URL}/c/${campaign.slug}</p>`,
  });
  revalidatePath("/admin");
}

export async function rejectCampaign(campaignId: string, reason: string) {
  const campaign = await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: "rejected", rejectReason: reason },
    include: { creator: true },
  });
  await sendMail({
    to: campaign.creator.email,
    subject: `Your campaign needs changes: ${campaign.activityTitle}`,
    html: `<p>We couldn't approve this yet: ${reason}</p>`,
  });
  revalidatePath("/admin");
}

export async function verifySocial(socialId: string, verifiedFollowers: number) {
  await prisma.socialAccount.update({
    where: { id: socialId },
    data: { verified: true, verifiedFollowers, reviewedAt: new Date() },
  });
  revalidatePath("/admin");
}

export async function refundSponsorship(sponsorshipId: string) {
  const sponsorship = await prisma.sponsorship.update({
    where: { id: sponsorshipId },
    data: { paymentStatus: "refunded" },
    include: { slot: true },
  });
  await prisma.slot.update({ where: { id: sponsorship.slotId }, data: { status: "available" } });
  revalidatePath("/admin/sponsorships");
  revalidatePath("/admin/payments");
}

export async function declareAuctionWinner(slotId: string, bidId: string) {
  const [slot, bid] = await Promise.all([
    prisma.slot.findUnique({ where: { id: slotId }, include: { campaign: { include: { creator: true } } } }),
    prisma.bid.findUnique({ where: { id: bidId } }),
  ]);
  if (!slot || !bid || bid.slotId !== slotId) throw new Error("Slot or bid not found");

  await prisma.slot.update({ where: { id: slotId }, data: { status: "pending", price: bid.amount } });
  const sponsorship = await prisma.sponsorship.create({
    data: {
      slotId,
      sponsorName: bid.bidderName,
      company: bid.company,
      email: bid.email,
      amount: bid.amount,
    },
  });

  await sendMail({
    to: bid.email,
    subject: `You won the auction for ${slot.name} on ${slot.campaign.activityTitle}`,
    html: `<p>Congrats — your bid of $${bid.amount} won. Complete payment here: ${process.env.NEXT_PUBLIC_BASE_URL}/c/${slot.campaign.slug}/mock-pay?sponsorship=${sponsorship.id}</p>`,
  });

  revalidatePath("/admin");
}

export async function markInquiry(inquiryId: string, status: string) {
  await prisma.inquiry.update({ where: { id: inquiryId }, data: { status } });
  revalidatePath("/admin/inquiries");
}
