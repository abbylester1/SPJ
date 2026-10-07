import Link from "next/link";
import CreateForm from "./CreateForm";

export default async function CreatePage({ searchParams }: { searchParams: Promise<{ title?: string }> }) {
  const { title } = await searchParams;
  return (
    <div className="flex-1">
      <header className="bg-zinc-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <Link href="/" className="font-display text-2xl">
            Sponsor My Journey
          </Link>
        </div>
        <div className="mx-auto max-w-6xl px-6 pb-14 pt-6">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Create your <span className="font-display font-normal italic text-orange-500">campaign.</span>
          </h1>
          <p className="mt-3 max-w-xl text-zinc-400">About 5 minutes. Your page stays private until we&apos;ve reviewed it.</p>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div>
          <CreateForm defaultTitle={title} />
        </div>
      </main>
    </div>
  );
}
