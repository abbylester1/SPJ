import Link from "next/link";
import AdminNav from "./AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 bg-zinc-50">
      <header className="bg-zinc-950 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-5">
          <Link href="/admin" className="font-display text-xl">
            Sponsor My Journey <span className="ml-2 rounded bg-white/10 px-2 py-0.5 font-sans text-xs text-zinc-300">Admin</span>
          </Link>
          <Link href="/" className="text-sm text-zinc-400 hover:text-white">
            View site →
          </Link>
        </div>
        <AdminNav />
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
