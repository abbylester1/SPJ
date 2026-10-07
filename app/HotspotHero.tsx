"use client";

import { useEffect, useState } from "react";

type Hotspot = { x: number; y: number; label: string; price: string; sold?: boolean };
type Scene = { image: string; journey: string; hotspots: Hotspot[] };

const SCENES: Scene[] = [
  {
    image: "/scenes/athlete.jpg",
    journey: "Racing HYROX World Championships",
    hotspots: [
      { x: 51.6, y: 37, label: "Chest logo", price: "$3,000", sold: true },
      { x: 60, y: 31, label: "Arm patch", price: "$1,200" },
      { x: 50, y: 72, label: "Shorts logo", price: "$1,500" },
    ],
  },
  {
    image: "/scenes/stream.jpg",
    journey: "A 24-hour charity livestream",
    hotspots: [
      { x: 24, y: 47, label: "Stream overlay, 24h", price: "$2,500" },
      { x: 57, y: 35, label: "Chat command", price: "$600", sold: true },
      { x: 44, y: 72, label: "Desk product spot", price: "$900" },
    ],
  },
  {
    image: "/scenes/stage.jpg",
    journey: "Keynote at a 2,000-seat conference",
    hotspots: [
      { x: 50, y: 14, label: "Intro slide", price: "$3,000", sold: true },
      { x: 51, y: 57, label: "Podium front", price: "$1,500" },
      { x: 29, y: 80, label: "Talk recap post", price: "$800" },
    ],
  },
  {
    image: "/scenes/festival.jpg",
    journey: "Headlining a summer festival set",
    hotspots: [
      { x: 83, y: 29, label: "Screen loop", price: "$5,000" },
      { x: 54, y: 65, label: "Booth banner", price: "$2,000", sold: true },
      { x: 24, y: 77, label: "Aftermovie credit", price: "$1,200" },
    ],
  },
  {
    image: "/scenes/podcast.jpg",
    journey: "Season 2 of a top-50 podcast",
    hotspots: [
      { x: 63, y: 40, label: "Pre-roll, 10 episodes", price: "$4,000" },
      { x: 55, y: 89, label: "Episode sponsor", price: "$900", sold: true },
      { x: 89, y: 31, label: "Show notes link", price: "$250" },
    ],
  },
  {
    image: "/scenes/vlog.jpg",
    journey: "A 6-part Southeast Asia travel series",
    hotspots: [
      { x: 36, y: 42, label: "Video integration", price: "$3,500" },
      { x: 60, y: 57, label: "Gear shoutout", price: "$700", sold: true },
      { x: 14, y: 50, label: "Series title sponsor", price: "$6,000" },
    ],
  },
  {
    image: "/scenes/laptop.jpg",
    journey: "Launch day on Product Hunt",
    hotspots: [
      { x: 65, y: 55, label: "Launch video card", price: "$800" },
      { x: 86, y: 59, label: "Pinned post, 24h", price: "$1,200", sold: true },
      { x: 51, y: 21, label: "Launch thread", price: "$400" },
    ],
  },
  {
    image: "/scenes/van.jpg",
    journey: "A 3-month overland road trip",
    hotspots: [
      { x: 65, y: 71, label: "Van wrap", price: "$4,500" },
      { x: 74, y: 45, label: "Roof gear", price: "$900", sold: true },
      { x: 88, y: 60, label: "Weekly vlog mention", price: "$600" },
    ],
  },
  {
    image: "/scenes/helmet.jpg",
    journey: "A pro cycling season",
    hotspots: [
      { x: 68, y: 37, label: "Helmet side", price: "$2,000" },
      { x: 43, y: 72, label: "Eyewear", price: "$1,200", sold: true },
      { x: 85, y: 86, label: "Jersey shoulder", price: "$2,500" },
    ],
  },
  {
    image: "/scenes/kayak.jpg",
    journey: "A 500 km sea-kayak expedition",
    hotspots: [
      { x: 74, y: 50, label: "Bow decal", price: "$2,500" },
      { x: 47, y: 32, label: "Paddle blade", price: "$800", sold: true },
      { x: 25, y: 50, label: "Expedition film credit", price: "$4,000" },
    ],
  },
  {
    image: "/scenes/newsletter.jpg",
    journey: "A 40k-subscriber weekly newsletter",
    hotspots: [
      { x: 25, y: 57, label: "Top slot, 4 issues", price: "$3,200" },
      { x: 16, y: 93, label: "Classified ad", price: "$300", sold: true },
      { x: 33, y: 73, label: "Dedicated send", price: "$2,000" },
    ],
  },
];

const BUYERS = ["Peak Fuel", "Orbit AI", "Lumen Labs", "Fable Drinks", "Northwind Audio", "Driftwood Travel", "Orbit AI", "Atlas Outdoor", "Tidal Sports", "Atlas Outdoor", "Lumen Labs"];

// Each scene plays a short story: dots appear, the card steps through the slots,
// then an open slot gets bought. One card, one place, no clutter.
export default function HotspotHero() {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);

  const scene = SCENES[index];
  const total = scene.hotspots.length;
  const buyIndex = scene.hotspots.findIndex((h) => !h.sold);
  const isBuying = step === total;
  const active = isBuying ? buyIndex : step;
  const h = scene.hotspots[active];

  useEffect(() => {
    const id = setTimeout(() => {
      if (step < total) setStep(step + 1);
      else {
        setIndex((index + 1) % SCENES.length);
        setStep(0);
      }
    }, step === total ? 2600 : 1700);
    return () => clearTimeout(id);
  }, [step, index, total]);

  return (
    <div className="relative min-w-0">
      <div key={`t-${index}`} className="mb-4 flex items-baseline gap-3 animate-[rise_0.7s_ease_both]">
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.2em] text-orange-400">Example</span>
        <p className="font-display text-2xl leading-tight text-white sm:text-3xl">{scene.journey}</p>
      </div>
      <div className="relative aspect-[1264/848] w-full overflow-hidden rounded-[2rem] bg-zinc-900 shadow-2xl shadow-black/60 ring-1 ring-white/10">
        {SCENES.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.image}
            src={s.image}
            alt={s.journey}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-[1400ms] ease-out ${
              i === index ? "scale-100 opacity-100" : "scale-110 opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/30" />

        {scene.hotspots.map((spot, i) => {
          const sold = spot.sold || (isBuying && i === buyIndex);
          return (
            <button
              key={`${index}-${i}`}
              type="button"
              onClick={() => setStep(i)}
              aria-label={spot.label}
              className="absolute -translate-x-1/2 -translate-y-1/2 animate-[fadein_0.5s_ease_both]"
              style={{ left: `${spot.x}%`, top: `${spot.y}%`, animationDelay: `${150 + i * 120}ms` }}
            >
              <span className="relative flex h-6 w-6 items-center justify-center">
                {i === active && <span className="absolute h-full w-full animate-ping rounded-full bg-white/70" />}
                <span
                  className={`relative h-3.5 w-3.5 rounded-full ring-[3px] transition-all duration-500 ${
                    i === active ? "scale-125 ring-white" : "ring-white/60"
                  } ${sold ? "bg-zinc-900" : "bg-orange-500"}`}
                />
              </span>
            </button>
          );
        })}


        {/* The single floating slot card */}
        <div className="absolute bottom-3 right-3 w-44 sm:bottom-5 sm:right-5 sm:w-60">
          <div
            key={`${index}-${active}-${isBuying}`}
            className="animate-[rise_0.45s_cubic-bezier(0.23,1,0.32,1)_both] overflow-hidden rounded-2xl border border-white/15 bg-zinc-950/55 p-3 text-white sm:p-4 shadow-2xl backdrop-blur-xl"
          >
            <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-white/60"><span className="h-1.5 w-1.5 rounded-full bg-orange-500" />{h.label}</p>
            <div className="mt-1 flex items-end justify-between">
              <p className={`text-xl font-semibold tracking-tight sm:text-3xl ${h.sold && !isBuying ? "text-white/40 line-through" : ""}`}>{h.price}</p>
              {isBuying || h.sold ? (
                <span className="animate-[stamp_0.4s_cubic-bezier(0.34,1.56,0.64,1)_both] rounded-md bg-white px-2 py-1 text-[11px] font-bold tracking-widest text-zinc-900">
                  SOLD
                </span>
              ) : (
                <span className="rounded-md bg-orange-500 px-2 py-1 text-[11px] font-semibold text-white">OPEN</span>
              )}
            </div>
            {isBuying && (
              <p className="mt-2 animate-[rise_0.4s_ease_0.25s_both] text-xs text-white/60">
                Bought by <span className="font-semibold text-white">{BUYERS[index % BUYERS.length]}</span> · just now
              </p>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            key={`p-${index}`}
            className="h-full animate-[grow_linear_both] bg-orange-500"
            style={{ animationDuration: `${total * 1700 + 2600}ms` }}
          />
        </div>
      </div>
    </div>
  );
}
