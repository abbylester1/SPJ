"use client";

import { useMemo, useState } from "react";
import { createCampaign } from "./actions";
import { suggestSlotPrice } from "@/lib/scoring";
import { CATEGORIES } from "@/lib/categories";

type SlotRow = { name: string; whatYouGet: string; price: string; isAuction: boolean };

const PRESETS: Record<string, SlotRow[]> = {
  life: [
    { name: "Stream overlay", whatYouGet: "Logo on screen for the full stream", price: "", isAuction: false },
    { name: "Video integration", whatYouGet: "60s dedicated segment", price: "", isAuction: false },
    { name: "Chat command", whatYouGet: "!sponsor command with your link", price: "", isAuction: false },
  ],
  content: [
    { name: "Pre-roll read", whatYouGet: "30s host read, one episode", price: "", isAuction: false },
    { name: "Newsletter top slot", whatYouGet: "Logo + 80 words, one issue", price: "", isAuction: false },
    { name: "Show notes link", whatYouGet: "Link in show notes", price: "", isAuction: false },
  ],
  events: [
    { name: "Intro slide", whatYouGet: "Your logo on my opening slide", price: "", isAuction: true },
    { name: "Stage screen loop", whatYouGet: "Logo between sets", price: "", isAuction: false },
    { name: "Recap post", whatYouGet: "Tagged post after the event", price: "", isAuction: false },
  ],
  builder: [
    { name: "Pinned post, 24h", whatYouGet: "Your product pinned on launch day", price: "", isAuction: true },
    { name: "Launch video card", whatYouGet: "5s branded card in the demo", price: "", isAuction: false },
  ],
  sports: [
    { name: "Kit / jersey", whatYouGet: "Logo worn all event", price: "", isAuction: false },
    { name: "Equipment decal", whatYouGet: "Decal on bike, board or boat", price: "", isAuction: false },
    { name: "Recap video", whatYouGet: "Credit in the highlights video", price: "", isAuction: false },
  ],
};

export default function CreateForm({ defaultTitle }: { defaultTitle?: string }) {
  const [category, setCategory] = useState("sports");
  const [eventTier, setEventTier] = useState("local");
  const [followers, setFollowers] = useState("");
  const [slots, setSlots] = useState<SlotRow[]>(PRESETS.sports);
  const [preview, setPreview] = useState({ name: "", title: defaultTitle ?? "", date: "", image: "" });

  function changeCategory(value: string) {
    setCategory(value);
    setSlots(PRESETS[value] ?? PRESETS.sports);
  }

  const followersNum = parseInt(followers || "0", 10) || 0;

  const suggestions = useMemo(
    () =>
      slots.map((s) =>
        suggestSlotPrice({ followers: followersNum, eventTier, slotName: s.name || "slot" })
      ),
    [slots, followersNum, eventTier]
  );

  function updateSlot(i: number, field: keyof SlotRow, value: string) {
    setSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }

  function addSlot() {
    if (slots.length >= 10) return;
    setSlots((prev) => [...prev, { name: "", whatYouGet: "", price: "", isAuction: false }]);
  }

  function removeSlot(i: number) {
    if (slots.length <= 1) return;
    setSlots((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(formData: FormData) {
    const slotsPayload = slots
      .filter((s) => s.name.trim())
      .map((s, i) => ({
        name: s.name,
        whatYouGet: s.whatYouGet,
        price: parseInt(s.price || String(suggestions[i]?.mid ?? 100), 10),
        suggestedMin: suggestions[i]?.min,
        suggestedMax: suggestions[i]?.max,
        isAuction: s.isAuction,
      }));
    formData.set("slotsJson", JSON.stringify(slotsPayload));
    formData.set("category", category);
    formData.set("eventTier", eventTier);
    formData.set("followersClaimed", String(followersNum));
    return createCampaign(formData);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
    <form action={handleSubmit} className="space-y-6">
      <section className="rounded-3xl border border-zinc-200 bg-white p-7 space-y-5 shadow-sm">
        <h2 className="font-semibold">1. About you</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Your name" name="creatorName" required onChange={(v) => setPreview((p) => ({ ...p, name: v }))} />
          <Field label="Email" name="creatorEmail" type="email" required />
          <Field
            label="Profile photo URL"
            name="photoUrl"
            placeholder="https://..."
            hint="Paste a link for now — file upload comes later."
          />
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-7 space-y-5 shadow-sm">
        <h2 className="font-semibold">2. Your social reach (self-reported)</h2>
        <p className="text-sm text-zinc-500">
          We&apos;ll ask you to share the link so an admin can verify this before your campaign goes live.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <SelectField
            label="Platform"
            name="platform"
            options={["instagram", "tiktok", "youtube", "twitch", "x (twitter)", "linkedin", "podcast", "newsletter", "other"]}
          />
          <Field label="Handle" name="handle" placeholder="@yourname" />
          <Field label="Followers (approx.)" name="followersClaimed_display" type="number"
            onChange={(v) => setFollowers(v)} />
        </div>
        <Field label="Link to your profile" name="profileUrl" placeholder="https://instagram.com/..." />
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-7 space-y-5 shadow-sm">
        <h2 className="font-semibold">3. What&apos;s your journey?</h2>
        <p className="text-sm text-zinc-500">
          A stream, an episode, a keynote, a launch, a season. Any moment with an audience.
        </p>
        <div>
          <label className="text-xs text-zinc-500">Category</label>
          <div className="mt-1 grid grid-cols-2 sm:grid-cols-5 gap-2">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.value}
                onClick={() => changeCategory(c.value)}
                className={`rounded-lg border px-3 py-2 text-xs text-left ${
                  category === c.value ? "border-orange-600 bg-orange-600 text-white" : "border-zinc-200 hover:border-zinc-400"
                }`}
              >
                <p className="font-medium">{c.label}</p>
                <p className={category === c.value ? "text-orange-100" : "text-zinc-400"}>{c.example}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Title" name="activityTitle" placeholder="Racing HYROX World Championships" required defaultValue={defaultTitle} onChange={(v) => setPreview((p) => ({ ...p, title: v }))} />
          <Field label="Date" name="eventDate" type="date" required onChange={(v) => setPreview((p) => ({ ...p, date: v }))} />
          <SelectField
            label="Scale"
            name="eventTierSelect"
            options={["local", "regional", "major"]}
            value={eventTier}
            onChange={setEventTier}
          />
          <Field label="Cover image URL" name="images" placeholder="https://..." onChange={(v) => setPreview((p) => ({ ...p, image: v.split(",")[0].trim() }))} />
        </div>
        <TextArea label="Short description" name="description" />
        <Field label="Social links (comma separated)" name="socialLinks" />
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-7 space-y-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">4. Sponsorship slots</h2>
          <button
            type="button"
            onClick={addSlot}
            disabled={slots.length >= 10}
            className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm font-medium hover:border-zinc-400 disabled:opacity-40"
          >
            + Add slot
          </button>
        </div>
        <p className="text-sm text-zinc-500">
          Suggested prices are just that — suggestions. You set the final ask.
        </p>
        <div className="space-y-4">
          {slots.map((s, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 p-4 space-y-3">
              <div className="grid sm:grid-cols-[1fr_1.3fr_130px_auto] gap-3 items-start">
                <div>
                  <label className="text-xs text-zinc-500">Slot name</label>
                  <input
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                    value={s.name}
                    onChange={(e) => updateSlot(i, "name", e.target.value)}
                    placeholder="Chest"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500">What they get</label>
                  <input
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                    value={s.whatYouGet}
                    onChange={(e) => updateSlot(i, "whatYouGet", e.target.value)}
                    placeholder="Logo + 8 photos"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500">{s.isAuction ? "Starting bid" : "Price"} ($)</label>
                  <input
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                    type="number"
                    value={s.price}
                    onChange={(e) => updateSlot(i, "price", e.target.value)}
                    placeholder={String(suggestions[i]?.mid ?? "")}
                  />
                  <p className="mt-1 text-[11px] text-orange-600">
                    Suggested ${suggestions[i]?.min}–${suggestions[i]?.max}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeSlot(i)}
                  className="mt-7 text-xs text-zinc-400 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
              <label className="flex items-center gap-2 text-xs text-zinc-600">
                <input
                  type="checkbox"
                  checked={s.isAuction}
                  onChange={(e) =>
                    setSlots((prev) =>
                      prev.map((row, idx) => (idx === i ? { ...row, isAuction: e.target.checked } : row))
                    )
                  }
                />
                Let brands bid instead of a fixed price
              </label>
            </div>
          ))}
        </div>
      </section>

      <button
        type="submit"
        className="w-full rounded-full bg-orange-600 px-6 py-4 text-base font-semibold text-white hover:bg-orange-500"
      >
        Submit for review
      </button>
    </form>

    <aside className="hidden lg:block">
      <div className="sticky top-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">Live preview</p>
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-zinc-200">
          <div className="relative h-40 bg-gradient-to-br from-zinc-800 to-zinc-950">
            {preview.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.image} alt="" className="h-full w-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <p className="text-xs text-zinc-300">{preview.name || "Your name"} is</p>
              <p className="font-display text-2xl leading-tight">{preview.title || "Your journey"}</p>
            </div>
          </div>
          <div className="p-4">
            <p className="text-xs text-zinc-500">
              {preview.date ? new Date(preview.date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "Pick a date"}
              {followersNum > 0 && <span className="ml-2 font-semibold text-orange-600">· {followersNum.toLocaleString()} reach</span>}
            </p>
            <div className="mt-3 space-y-1.5">
              {slots.filter((x) => x.name.trim()).map((x, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-zinc-100 px-3 py-2 text-sm">
                  <span className="truncate">{x.name}</span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    ${(parseInt(x.price || String(suggestions[i]?.mid ?? 0), 10) || 0).toLocaleString()}
                    {x.isAuction && <span className="rounded bg-indigo-100 px-1 text-[9px] text-indigo-700">BID</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-zinc-400">This is roughly what brands will see once you&apos;re approved.</p>
      </div>
    </aside>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  hint,
  onChange,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  onChange?: (v: string) => void;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="text-xs text-zinc-500">{label}</label>
      <input
        defaultValue={defaultValue}
        className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      />
      {hint && <p className="mt-1 text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}

function TextArea({ label, name }: { label: string; name: string }) {
  return (
    <div>
      <label className="text-xs text-zinc-500">{label}</label>
      <textarea className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10" name={name} rows={3} />
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
  value,
  onChange,
}: {
  label: string;
  name: string;
  options: string[];
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-zinc-500">{label}</label>
      <select
        className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 capitalize"
        name={name}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
