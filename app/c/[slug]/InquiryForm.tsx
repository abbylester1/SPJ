"use client";

import { useState } from "react";
import { submitInquiry } from "./actions";

export default function InquiryForm({ campaignId, dark = false }: { campaignId?: string; dark?: boolean }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (sent) {
    return (
      <div className={`rounded-2xl border px-5 py-6 text-sm ${dark ? "border-white/15 bg-white/5 text-emerald-300" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
        Thanks — we&apos;ll follow up by email shortly.
      </div>
    );
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await submitInquiry({
      campaignId,
      brandName: String(formData.get("brandName")),
      company: String(formData.get("company")),
      email: String(formData.get("email")),
      objective: String(formData.get("objective")),
      budgetRange: String(formData.get("budgetRange") || ""),
    });
    setLoading(false);
    setSent(true);
  }

  const field = dark
    ? "w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-orange-500 focus:bg-white/10 focus:ring-4 focus:ring-orange-500/10"
    : "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10";
  const label = `mb-1.5 block text-xs font-medium ${dark ? "text-zinc-400" : "text-zinc-500"}`;

  return (
    <form action={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className={label}>Your name</label>
        <input required name="brandName" placeholder="Jane Doe" className={field} />
      </div>
      <div>
        <label className={label}>Company</label>
        <input required name="company" placeholder="Acme Inc." className={field} />
      </div>
      <div>
        <label className={label}>Email</label>
        <input required name="email" type="email" placeholder="jane@acme.com" className={field} />
      </div>
      <div>
        <label className={label}>Budget range (optional)</label>
        <input name="budgetRange" placeholder="$1,000–$5,000" className={field} />
      </div>
      <div className="sm:col-span-2">
        <label className={label}>What are you trying to achieve?</label>
        <textarea
          required
          name="objective"
          placeholder="Reach a specific audience, launch a product, build awareness…"
          className={field}
          rows={3}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="sm:col-span-2 rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}
