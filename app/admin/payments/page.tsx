import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const paid = await prisma.sponsorship.findMany({
    where: { paymentStatus: "paid" },
    include: { slot: { include: { campaign: true } } },
    orderBy: { createdAt: "desc" },
  });
  const total = paid.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div>
      <h1 className="text-xl font-bold">Payments</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Total GMV so far: <span className="font-semibold text-black">${total.toLocaleString()}</span>
      </p>
      <table className="mt-6 w-full text-sm bg-white rounded-xl border overflow-hidden">
        <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
          <tr>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Campaign</th>
            <th className="px-4 py-2">Sponsor</th>
            <th className="px-4 py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {paid.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="px-4 py-2">{new Date(s.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-2">{s.slot.campaign.activityTitle}</td>
              <td className="px-4 py-2">{s.company}</td>
              <td className="px-4 py-2">${s.amount}</td>
            </tr>
          ))}
          {paid.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-zinc-400">
                No payments yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
