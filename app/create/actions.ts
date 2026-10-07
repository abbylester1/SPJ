"use server";

import { prisma } from "@/lib/db";
import { sendMail, adminEmail } from "@/lib/mailer";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";

type SlotInput = {
  name: string;
  whatYouGet?: string;
  price: number;
  suggestedMin?: number;
  suggestedMax?: number;
  isAuction?: boolean;
};

export async function createCampaign(formData: FormData) {
  const creatorName = String(formData.get("creatorName") || "").trim();
  const creatorEmail = String(formData.get("creatorEmail") || "").trim().toLowerCase();
  const photoUrl = String(formData.get("photoUrl") || "").trim() || null;

  const category = String(formData.get("category") || "sports");
  const activityTitle = String(formData.get("activityTitle") || "").trim();
  const eventDate = String(formData.get("eventDate") || "");
  const description = String(formData.get("description") || "").trim();
  const socialLinks = String(formData.get("socialLinks") || "").trim();
  const images = String(formData.get("images") || "").trim();
  const eventTier = String(formData.get("eventTier") || "local");

  const platform = String(formData.get("platform") || "").trim();
  const handle = String(formData.get("handle") || "").trim();
  const profileUrl = String(formData.get("profileUrl") || "").trim();
  const followersClaimed = parseInt(String(formData.get("followersClaimed") || "0"), 10) || 0;

  const slotsRaw = String(formData.get("slotsJson") || "[]");
  const slots: SlotInput[] = JSON.parse(slotsRaw);

  if (!creatorName || !creatorEmail || !activityTitle || !eventDate || slots.length === 0) {
    throw new Error("Missing required fields");
  }

  const editToken = nanoid(24);
  const slug = `${activityTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${nanoid(6)}`;

  const creator = await prisma.creator.upsert({
    where: { email: creatorEmail },
    update: { name: creatorName, photoUrl: photoUrl ?? undefined },
    create: { name: creatorName, email: creatorEmail, photoUrl, editToken },
  });

  if (platform && handle) {
    await prisma.socialAccount.create({
      data: {
        creatorId: creator.id,
        platform,
        handle,
        profileUrl: profileUrl || "",
        followersClaimed,
      },
    });
  }

  const campaign = await prisma.campaign.create({
    data: {
      slug,
      creatorId: creator.id,
      category,
      activityTitle,
      eventDate: new Date(eventDate),
      description,
      socialLinks,
      images,
      eventTier,
      status: "pending_review",
      slots: {
        create: slots.map((s) => ({
          name: s.name,
          whatYouGet: s.whatYouGet || null,
          price: s.price,
          suggestedMin: s.suggestedMin ?? null,
          suggestedMax: s.suggestedMax ?? null,
          isAuction: Boolean(s.isAuction),
        })),
      },
    },
  });

  await sendMail({
    to: adminEmail(),
    subject: `New campaign pending review: ${activityTitle}`,
    html: `
      <p><strong>${creatorName}</strong> (${creatorEmail}) submitted a campaign for review.</p>
      <p><strong>${activityTitle}</strong> — ${eventDate}</p>
      <p>Claimed reach: ${followersClaimed} on ${platform || "n/a"} (${profileUrl || "no link"})</p>
      <p>Slots: ${slots.map((s) => `${s.name} ($${s.price})`).join(", ")}</p>
      <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin">Review in admin panel</a></p>
    `,
  });

  redirect(`/create/submitted?token=${creator.editToken}&campaign=${campaign.slug}`);
}
