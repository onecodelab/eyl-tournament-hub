export const NEWS_CATEGORIES = [
  "All",
  "Breakthrough",
  "Match Report",
  "League Update",
  "Transfer News",
  "General",
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

// Categories for admin (without "All" filter option)
export const ADMIN_NEWS_CATEGORIES = NEWS_CATEGORIES.filter(
  (cat) => cat !== "All"
);
