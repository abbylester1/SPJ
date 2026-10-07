import { prisma } from "@/lib/db";
import { refundSponsorship } from "../actions";

export const dynamic = "force-dynamic";

export default async function SponsorshipsPage() {
  const sponsorships = await prisma.sponsorship.findMany({
    include: { slot: { include: { campaign: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-bold">Sponsorships</h1>
      <table className="mt-6 w-full text-sm bg-white rounded-xl border overflow-hidden">
        <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
          <tr>
            <th className="px-4 py-2">Sponsor</th>
            <th className="px-4 py-2">Campaign / slot</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {sponsorships.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="px-4 py-2">
                {s.sponsorName} · {s.company}
                <div className="text-xs text-zinc-400">{s.email}</div>
              </td>
              <td className="px-4 py-2">
                {s.slot.campaign.activityTitle} / {s.slot.name}
              </td>
              <td className="px-4 py-2">${s.amount}</td>
              <td className="px-4 py-2 capitalize">{s.paymentStatus}</td>
              <td className="px-4 py-2">
                {s.paymentStatus === "paid" && (
                  <form action={refundSponsorship.bind(null, s.id)}>
                    <button className="rounded-full border px-3 py-1 text-xs">Refund</button>
                  </form>
                )}
              </td>
            </tr>
          ))}
          {sponsorships.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-zinc-400">
                No sponsorships yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
