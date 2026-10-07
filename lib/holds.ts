import { prisma } from "@/lib/db";

const HOLD_MINUTES = 30;

// A slot is held while a sponsor is in checkout. If they abandon it, free the slot again.
export async function releaseStaleHolds() {
  const cutoff = new Date(Date.now() - HOLD_MINUTES * 60 * 1000);
  const stale = await prisma.sponsorship.findMany({
    where: { paymentStatus: "pending", createdAt: { lt: cutoff }, slot: { status: "pending" } },
    select: { id: true, slotId: true },
  });
  for (const s of stale) {
    await prisma.$transaction([
      prisma.sponsorship.delete({ where: { id: s.id } }),
      prisma.slot.update({ where: { id: s.slotId }, data: { status: "available" } }),
    ]);
  }
}
