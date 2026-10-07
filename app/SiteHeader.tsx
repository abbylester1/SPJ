import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-white">
      <Link href="/" className="font-display text-2xl">
        Sponsor My Journey
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        <Link href="/creators" className="hidden text-zinc-300 hover:text-white md:inline">
          For athletes & creators
        </Link>
        <Link href="/brands" className="hidden text-zinc-300 hover:text-white md:inline">
          For brands
        </Link>
        <Link href="/#campaigns" className="hidden text-zinc-300 hover:text-white md:inline">
          Live campaigns
        </Link>
        <Link href="/create" className="rounded-full bg-white px-4 py-2 font-medium text-zinc-900 hover:bg-zinc-200">
          Start a campaign
        </Link>
      </nav>
    </header>
  );
}
