// Suggested price engine: advisory only. The creator always sets the final ask.

const EVENT_WEIGHT: Record<string, number> = {
  local: 1.0,
  regional: 1.5,
  major: 2.0,
};

const SLOT_PROMINENCE: Record<string, number> = {
  chest: 1.0,
  back: 0.7,
  arm: 0.4,
  sleeve: 0.4,
  shorts: 0.35,
  cap: 0.3,
  bib: 0.25,
  "instagram post": 0.5,
  "instagram story": 0.25,
  reel: 0.6,
};

const DEFAULT_PROMINENCE = 0.4;
const BASE_RATE = 9; // tuned so ~5k verified followers + chest + local ≈ $450
const DEFAULT_ENGAGEMENT = 0.03;

function slugKeyFor(slotName: string): number {
  const key = slotName.trim().toLowerCase();
  if (key in SLOT_PROMINENCE) return SLOT_PROMINENCE[key];
  for (const k of Object.keys(SLOT_PROMINENCE)) {
    if (key.includes(k)) return SLOT_PROMINENCE[k];
  }
  return DEFAULT_PROMINENCE;
}

export function effectiveReach(followers: number, engagementRate?: number | null) {
  const engagement = Math.min(Math.max(engagementRate ?? DEFAULT_ENGAGEMENT, 0.005), 0.08);
  return followers * engagement * 10; // scale so numbers land in a usable range
}

export function suggestSlotPrice(params: {
  followers: number;
  engagementRate?: number | null;
  eventTier: string;
  slotName: string;
}): { min: number; max: number; mid: number } {
  const reach = effectiveReach(params.followers, params.engagementRate);
  const eventWeight = EVENT_WEIGHT[params.eventTier] ?? 1.0;
  const prominence = slugKeyFor(params.slotName);

  const raw = BASE_RATE * Math.pow(Math.max(reach, 1), 0.7) * eventWeight * prominence;
  const floor = 50;
  const mid = Math.max(Math.round(raw / 10) * 10, floor);
  const min = Math.max(Math.round((mid * 0.8) / 10) * 10, floor);
  const max = Math.round((mid * 1.4) / 10) * 10;

  return { min, max, mid };
}
