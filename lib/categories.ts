export const CATEGORIES = [
  { value: "sports", label: "Sports & Expeditions", example: "A pro season or expedition" },
  { value: "life", label: "Creators & Streams", example: "A 24-hour livestream" },
  { value: "content", label: "Podcasts & Newsletters", example: "Season 2 of my podcast" },
  { value: "events", label: "Events & Stages", example: "My keynote or festival set" },
  { value: "builder", label: "Launches & Products", example: "Launch day on Product Hunt" },
] as const;
export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
