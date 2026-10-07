import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const creators = await prisma.creator.findMany({
    include: { campaigns: true, socials: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-bold">Users (creators)</h1>
      <table className="mt-6 w-full text-sm bg-white rounded-xl border overflow-hidden">
        <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Campaigns</th>
            <th className="px-4 py-2">Verified socials</th>
          </tr>
        </thead>
        <tbody>
          {creators.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="px-4 py-2">{c.name}</td>
              <td className="px-4 py-2">{c.email}</td>
              <td className="px-4 py-2">{c.campaigns.length}</td>
              <td className="px-4 py-2">{c.socials.filter((s) => s.verified).length}</td>
            </tr>
          ))}
          {creators.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-zinc-400">
                No creators yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
