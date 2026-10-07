"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteFooter() {
  if (usePathname().startsWith("/admin")) return null;
  return (
    <footer className="bg-zinc-950 text-zinc-400">
      <div className="mx-auto grid max-w-6xl gap-10 border-t border-white/10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl text-white">Sponsor My Journey</p>
          <p className="mt-3 max-w-xs text-sm">Turn race days, stages and streams into sponsorships brands can buy.</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">For athletes & creators</p>
          <ul className="mt-3 space-y-2">
            <li><Link href="/creators" className="hover:text-white">How it works</Link></li>
            <li><Link href="/create" className="hover:text-white">Create your page</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">For brands</p>
          <ul className="mt-3 space-y-2">
            <li><Link href="/brands" className="hover:text-white">Why sponsor here</Link></li>
            <li><Link href="/#campaigns" className="hover:text-white">Live campaigns</Link></li>
            <li><Link href="/brands#brief" className="hover:text-white">Send a brief</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Company</p>
          <ul className="mt-3 space-y-2">
            <li><Link href="/admin/login" className="hover:text-white">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 pb-10 text-xs text-zinc-500">© 2026 Sponsor My Journey</div>
    </footer>
  );
}
