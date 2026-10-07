import { prisma } from "@/lib/db";
import { markInquiry } from "../actions";

export const dynamic = "force-dynamic";

export default async function InquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({
    include: { campaign: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-bold">Brand inquiries</h1>
      <div className="mt-6 space-y-3">
        {inquiries.map((i) => (
          <div key={i.id} className="rounded-xl border bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">
                  {i.brandName} · {i.company}
                </p>
                <p className="text-xs text-zinc-500">{i.email}</p>
                {i.campaign && (
                  <p className="text-xs text-zinc-500">Re: {i.campaign.activityTitle}</p>
                )}
              </div>
              <StatusBadge status={i.status} />
            </div>
            <p className="mt-2 text-sm text-zinc-700">{i.objective}</p>
            {i.budgetRange && <p className="text-xs text-zinc-500 mt-1">Budget: {i.budgetRange}</p>}
            {i.status === "new" && (
              <div className="mt-3 flex gap-2">
                <form action={markInquiry.bind(null, i.id, "contacted")}>
                  <button className="rounded-full border px-3 py-1 text-xs">Mark contacted</button>
                </form>
                <form action={markInquiry.bind(null, i.id, "closed")}>
                  <button className="rounded-full border px-3 py-1 text-xs">Close</button>
                </form>
              </div>
            )}
          </div>
        ))}
        {inquiries.length === 0 && (
          <p className="text-sm text-zinc-400">No inquiries yet.</p>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "bg-amber-100 text-amber-700",
    contacted: "bg-blue-100 text-blue-700",
    closed: "bg-zinc-100 text-zinc-500",
  };
  return <span className={`text-xs rounded-full px-2 py-1 ${map[status] || ""}`}>{status}</span>;
}
