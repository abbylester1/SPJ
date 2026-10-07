"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  ["/admin", "Campaigns"],
  ["/admin/inquiries", "Brand inquiries"],
  ["/admin/sponsorships", "Sponsorships"],
  ["/admin/payments", "Payments"],
  ["/admin/users", "Creators"],
];

export default function AdminNav() {
  const path = usePathname();
  if (path === "/admin/login") return null;
  return (
    <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6">
      {TABS.map(([href, label]) => {
        const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`shrink-0 border-b-2 px-3 py-3 text-sm ${active ? "border-orange-500 text-white" : "border-transparent text-zinc-400 hover:text-white"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
