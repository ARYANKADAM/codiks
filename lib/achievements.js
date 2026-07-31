export const ACHIEVEMENT_CATALOG = [
  { key: "first_battle", title: "First Blood", description: "Complete your first battle.", icon: "swords", criteria: { metric: "totalBattles", threshold: 1 } },
  { key: "first_win", title: "First Victory", description: "Win your first battle.", icon: "trophy", criteria: { metric: "wins", threshold: 1 } },
  { key: "five_wins", title: "Rising Star", description: "Win 5 battles.", icon: "star", criteria: { metric: "wins", threshold: 5 } },
  { key: "ten_wins", title: "Veteran", description: "Win 10 battles.", icon: "shield", criteria: { metric: "wins", threshold: 10 } },
  { key: "win_streak_3", title: "On Fire", description: "Win 3 battles in a row.", icon: "flame", criteria: { metric: "winStreak", threshold: 3 } },
  { key: "win_streak_5", title: "Unstoppable", description: "Win 5 battles in a row.", icon: "flame", criteria: { metric: "winStreak", threshold: 5 } },
  { key: "silver_tier", title: "Silver Tier", description: "Reach Silver rank.", icon: "award", criteria: { metric: "rating", threshold: 1300 } },
  { key: "gold_tier", title: "Gold Tier", description: "Reach Gold rank.", icon: "trophy", criteria: { metric: "rating", threshold: 1500 } },
];

export default ACHIEVEMENT_CATALOG;