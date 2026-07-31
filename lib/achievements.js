export const ACHIEVEMENT_CATALOG = [
  // ── Streak ──────────────────────────────────────────────────────────
  { key: "streak_3", title: "3 Streak", description: "Play 3 days in a row.", icon: "flame", category: "streak", criteria: { metric: "dailyStreak", threshold: 3 } },
  { key: "streak_7", title: "7 Streak", description: "Play 7 days in a row.", icon: "flame", category: "streak", criteria: { metric: "dailyStreak", threshold: 7 } },
  { key: "streak_14", title: "14 Streak", description: "Play 14 days in a row.", icon: "shield", category: "streak", criteria: { metric: "dailyStreak", threshold: 14 } },
  { key: "streak_30", title: "30 Streak", description: "Play 30 days in a row.", icon: "shield", category: "streak", criteria: { metric: "dailyStreak", threshold: 30 } },
  { key: "streak_50", title: "50 Streak", description: "Play 50 days in a row.", icon: "shield", category: "streak", criteria: { metric: "dailyStreak", threshold: 50 } },
  { key: "streak_100", title: "100 Streak", description: "Play 100 days in a row.", icon: "trophy", category: "streak", criteria: { metric: "dailyStreak", threshold: 100 } },
  { key: "streak_150", title: "150 Streak", description: "Play 150 days in a row.", icon: "trophy", category: "streak", criteria: { metric: "dailyStreak", threshold: 150 } },
  { key: "streak_200", title: "200 Streak", description: "Play 200 days in a row.", icon: "trophy", category: "streak", criteria: { metric: "dailyStreak", threshold: 200 } },
  { key: "streak_300", title: "300 Streak", description: "Play 300 days in a row.", icon: "rocket", category: "streak", criteria: { metric: "dailyStreak", threshold: 300 } },
  { key: "streak_365", title: "365 Streak", description: "Play 365 days in a row.", icon: "rocket", category: "streak", criteria: { metric: "dailyStreak", threshold: 365 } },
  { key: "streak_500", title: "500 Streak", description: "Play 500 days in a row.", icon: "rocket", category: "streak", criteria: { metric: "dailyStreak", threshold: 500 } },
  { key: "streak_700", title: "700 Streak", description: "Play 700 days in a row.", icon: "zap", category: "streak", criteria: { metric: "dailyStreak", threshold: 700 } },

  // ── Victories ───────────────────────────────────────────────────────
  { key: "victory_1", title: "First Victory", description: "Win your first duel.", icon: "trophy", category: "victory", criteria: { metric: "totalWins", threshold: 1 } },
  { key: "victory_5", title: "5 Victories", description: "Win 5 duels.", icon: "star", category: "victory", criteria: { metric: "totalWins", threshold: 5 } },
  { key: "victory_10", title: "10 Victories", description: "Win 10 duels.", icon: "shield", category: "victory", criteria: { metric: "totalWins", threshold: 10 } },
  { key: "victory_25", title: "25 Victories", description: "Win 25 duels.", icon: "award", category: "victory", criteria: { metric: "totalWins", threshold: 25 } },
  { key: "victory_50", title: "50 Victories", description: "Win 50 duels.", icon: "gem", category: "victory", criteria: { metric: "totalWins", threshold: 50 } },
  { key: "victory_100", title: "100 Victories", description: "Win 100 duels.", icon: "crown", category: "victory", criteria: { metric: "totalWins", threshold: 100 } },
  { key: "victory_250", title: "250 Victories", description: "Win 250 duels.", icon: "rocket", category: "victory", criteria: { metric: "totalWins", threshold: 250 } },
  { key: "victory_500", title: "500 Victories", description: "Win 500 duels.", icon: "zap", category: "victory", criteria: { metric: "totalWins", threshold: 500 } },
];

export default ACHIEVEMENT_CATALOG;