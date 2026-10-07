import Link from "next/link";

export default async function SubmittedPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; campaign?: string }>;
}) {
  const { campaign } = await searchParams;
  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold">Submitted for review</h1>
        <p className="mt-3 text-zinc-600">
          We&apos;ll verify your social reach and review the campaign. You&apos;ll get an email once
          it&apos;s approved and live. This usually takes under a day.
        </p>
        {campaign && (
          <p className="mt-6 text-sm text-zinc-500">
            Your page will be at{" "}
            <span className="font-mono">/c/{campaign}</span> once approved.
          </p>
        )}
        <Link href="/" className="mt-8 inline-block rounded-full border px-5 py-2 text-sm">
          Back to home
        </Link>
      </div>
    </div>
  );
}
