import { prisma } from "@/lib/db";
import { approveCampaign, rejectCampaign, verifySocial, declareAuctionWinner, logout } from "./actions";
import { categoryLabel } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "pending_review" } = await searchParams;
  const [counts, gmv, newInquiries] = await Promise.all([
    prisma.campaign.groupBy({ by: ["status"], _count: true }),
    prisma.sponsorship.aggregate({ where: { paymentStatus: "paid" }, _sum: { amount: true } }),
    prisma.inquiry.count({ where: { status: "new" } }),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const allCampaigns = await prisma.campaign.findMany({
    include: {
      creator: { include: { socials: true } },
      slots: { include: { bids: { orderBy: { amount: "desc" } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  const campaigns = allCampaigns.filter((c) => c.status === status);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Overview</h1>
        <form action={logout}>
          <button className="text-sm text-zinc-500 hover:underline">Log out</button>
        </form>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Waiting for review", count("pending_review"), "/admin?status=pending_review", count("pending_review") > 0],
          ["Live campaigns", count("approved"), "/admin?status=approved", false],
          ["GMV (paid)", `$${(gmv._sum.amount ?? 0).toLocaleString()}`, "/admin/payments", false],
          ["New brand inquiries", newInquiries, "/admin/inquiries", newInquiries > 0],
        ].map(([label, value, href, alert]) => (
          <a key={label as string} href={href as string} className={`rounded-2xl border bg-white p-4 hover:border-zinc-400 ${alert ? "border-orange-300" : ""}`}>
            <p className="text-xs text-zinc-500">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${alert ? "text-orange-600" : ""}`}>{value}</p>
          </a>
        ))}
      </div>

      <div className="mt-8 flex gap-2">
        {[
          ["pending_review", "Waiting for review"],
          ["approved", "Live"],
          ["rejected", "Rejected"],
        ].map(([value, label]) => (
          <a
            key={value}
            href={`/admin?status=${value}`}
            className={`rounded-full border px-4 py-1.5 text-sm ${status === value ? "border-zinc-900 bg-zinc-900 text-white" : "bg-white hover:border-zinc-400"}`}
          >
            {label} · {count(value)}
          </a>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {campaigns.length === 0 && <p className="rounded-2xl border border-dashed bg-white p-10 text-center text-sm text-zinc-500">Nothing here.</p>}
        {campaigns.map((c) => (
          <div key={c.id} className="rounded-xl border bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">
                  {c.activityTitle}{" "}
                  <span className="text-xs font-normal text-zinc-400">/{c.slug}</span>
                </p>
                <p className="text-sm text-zinc-500">
                  {c.creator.name} ({c.creator.email}) · {categoryLabel(c.category)} ·{" "}
                  {new Date(c.eventDate).toLocaleDateString()} · {c.eventTier}
                </p>
              </div>
              <StatusBadge status={c.status} />
            </div>

            <p className="mt-2 text-sm text-zinc-600 line-clamp-2">{c.description}</p>

            <div className="mt-3 text-sm">
              <p className="font-medium text-zinc-700">Slots</p>
              <div className="flex flex-col gap-1 mt-1">
                {c.slots.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border px-2 py-1 text-xs">
                      {s.name} · ${s.price} · {s.status}
                      {s.isAuction ? " · auction" : ""}
                    </span>
                    {s.isAuction && s.status === "available" && s.bids.length > 0 && (
                      <>
                        <span className="text-xs text-zinc-500">
                          top bid ${s.bids[0].amount} by {s.bids[0].company}
                        </span>
                        <form action={declareAuctionWinner.bind(null, s.id, s.bids[0].id)}>
                          <button className="rounded-full border px-2 py-0.5 text-xs">
                            Close auction & declare winner
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 text-sm">
              <p className="font-medium text-zinc-700">Claimed social reach</p>
              {c.creator.socials.length === 0 && (
                <p className="text-zinc-400 text-xs">No socials submitted.</p>
              )}
              {c.creator.socials.map((s) => (
                <div key={s.id} className="flex items-center gap-3 mt-1 text-xs">
                  <a href={s.profileUrl} target="_blank" className="underline">
                    {s.platform}: {s.handle}
                  </a>
                  <span>claims {s.followersClaimed} followers</span>
                  {s.verified ? (
                    <span className="text-emerald-700">
                      ✓ verified at {s.verifiedFollowers}
                    </span>
                  ) : (
                    <VerifyForm socialId={s.id} claimed={s.followersClaimed} />
                  )}
                </div>
              ))}
            </div>

            {c.status === "pending_review" && (
              <div className="mt-4 flex items-center gap-3">
                <form action={approveCampaign.bind(null, c.id)}>
                  <button className="rounded-full bg-black text-white px-4 py-1.5 text-sm">Approve</button>
                </form>
                <RejectForm campaignId={c.id} />
              </div>
            )}
            {c.status === "rejected" && c.rejectReason && (
              <p className="mt-2 text-xs text-red-600">Rejected: {c.rejectReason}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending_review: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-xs rounded-full px-2 py-1 ${map[status] || "bg-zinc-100"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function RejectForm({ campaignId }: { campaignId: string }) {
  async function action(formData: FormData) {
    "use server";
    const { rejectCampaign: reject } = await import("./actions");
    await reject(campaignId, String(formData.get("reason") || "Needs more info"));
  }
  return (
    <form action={action} className="flex items-center gap-2">
      <input name="reason" placeholder="Reason" className="rounded border px-2 py-1 text-xs" />
      <button className="rounded-full border px-4 py-1.5 text-sm">Reject</button>
    </form>
  );
}

function VerifyForm({ socialId, claimed }: { socialId: string; claimed: number }) {
  async function action(formData: FormData) {
    "use server";
    const { verifySocial: verify } = await import("./actions");
    await verify(socialId, parseInt(String(formData.get("followers") || claimed), 10));
  }
  return (
    <form action={action} className="flex items-center gap-1">
      <input
        name="followers"
        type="number"
        defaultValue={claimed}
        className="w-20 rounded border px-1.5 py-0.5 text-xs"
      />
      <button className="rounded-full border px-2 py-0.5 text-xs">Verify</button>
    </form>
  );
}
