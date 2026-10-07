"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startCheckout, placeBid } from "./actions";

type Slot = {
  id: string;
  name: string;
  whatYouGet: string | null;
  price: number;
  status: string;
  isAuction: boolean;
  bids: { amount: number }[];
};

export default function SlotList({ slots }: { slots: Slot[]; campaignId: string }) {
  const [active, setActive] = useState<Slot | null>(null);

  return (
    <>
      <div className="space-y-2">
        {slots.map((slot) => {
          const highBid = slot.bids[0]?.amount;
          const isSold = slot.status === "sold";
          return (
            <button
              key={slot.id}
              disabled={slot.status !== "available"}
              onClick={() => setActive(slot)}
              className={`relative w-full flex items-center justify-between overflow-hidden rounded-lg border px-4 py-3 text-left transition-colors ${
                isSold
                  ? "bg-zinc-50 border-zinc-200"
                  : slot.status === "pending"
                  ? "bg-amber-50 border-amber-200 opacity-70"
                  : "bg-white enabled:hover:border-orange-500"
              }`}
            >
              <div className={isSold ? "opacity-50" : ""}>
                <p className={`font-medium ${isSold ? "line-through decoration-2" : ""}`}>
                  {slot.name}
                  {slot.isAuction && (
                    <span className="ml-2 rounded-full bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 align-middle">
                      AUCTION
                    </span>
                  )}
                </p>
                {slot.whatYouGet && <p className="text-xs text-zinc-500">{slot.whatYouGet}</p>}
              </div>
              <div className={`flex items-center gap-3 ${isSold ? "opacity-50" : ""}`}>
                <span className="font-semibold">
                  {slot.isAuction ? (
                    <>
                      ${(highBid ?? slot.price).toLocaleString()}
                      <span className="text-xs font-normal text-zinc-400 ml-1">
                        {highBid ? "current bid" : "starting bid"}
                      </span>
                    </>
                  ) : (
                    `$${slot.price.toLocaleString()}`
                  )}
                </span>
                {!isSold && (
                  <span
                    className={`text-xs rounded-full px-2 py-1 font-medium ${
                      slot.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {slot.status === "pending" ? "HOLD" : "Available"}
                  </span>
                )}
              </div>
              {isSold && (
                <span className="absolute -right-9 -top-1 rotate-12 rounded bg-zinc-900 px-10 py-1 text-xs font-bold tracking-widest text-white shadow">
                  SOLD
                </span>
              )}
            </button>
          );
        })}
      </div>

      {active && (active.isAuction ? (
        <BidModal slot={active} onClose={() => setActive(null)} />
      ) : (
        <SponsorModal slot={active} onClose={() => setActive(null)} />
      ))}
    </>
  );
}

function SponsorModal({ slot, onClose }: { slot: Slot; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      const { checkoutUrl } = await startCheckout({
        slotId: slot.id,
        sponsorName: String(formData.get("sponsorName")),
        company: String(formData.get("company")),
        email: String(formData.get("email")),
        logoUrl: String(formData.get("logoUrl") || ""),
      });
      window.location.href = checkoutUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <Modal title={`Sponsor the ${slot.name} — $${slot.price.toLocaleString()}`} onClose={onClose}>
      <form action={handleSubmit} className="mt-4 space-y-3">
        <input required name="sponsorName" placeholder="Your name" className="w-full rounded border px-3 py-2 text-sm" />
        <input required name="company" placeholder="Company" className="w-full rounded border px-3 py-2 text-sm" />
        <input required name="email" type="email" placeholder="Email" className="w-full rounded border px-3 py-2 text-sm" />
        <input name="logoUrl" placeholder="Logo URL (optional for now)" className="w-full rounded border px-3 py-2 text-sm" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-orange-600 text-white py-2 font-medium hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? "Redirecting to payment…" : "Continue to payment"}
        </button>
      </form>
    </Modal>
  );
}

function BidModal({ slot, onClose }: { slot: Slot; onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const minBid = (slot.bids[0]?.amount ?? slot.price - 1) + 1;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      await placeBid({
        slotId: slot.id,
        bidderName: String(formData.get("bidderName")),
        company: String(formData.get("company")),
        email: String(formData.get("email")),
        amount: parseInt(String(formData.get("amount")), 10),
      });
      setSent(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={`Bid on ${slot.name}`} onClose={onClose}>
      {sent ? (
        <p className="mt-4 text-sm text-emerald-700">
          Bid placed. You&apos;re the highest bidder. We&apos;ll email you if you win when the auction closes.
        </p>
      ) : (
        <form action={handleSubmit} className="mt-4 space-y-3">
          <p className="text-xs text-zinc-500">Minimum bid: ${minBid.toLocaleString()}</p>
          <input required name="bidderName" placeholder="Your name" className="w-full rounded border px-3 py-2 text-sm" />
          <input required name="company" placeholder="Company" className="w-full rounded border px-3 py-2 text-sm" />
          <input required name="email" type="email" placeholder="Email" className="w-full rounded border px-3 py-2 text-sm" />
          <input
            required
            name="amount"
            type="number"
            min={minBid}
            placeholder={`$${minBid}`}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-orange-600 text-white py-2 font-medium hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? "Placing bid…" : "Place bid"}
          </button>
        </form>
      )}
    </Modal>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
