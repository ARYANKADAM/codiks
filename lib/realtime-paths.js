/**
 * Canonical Firebase Realtime Database path builders.
 *
 * Every feature that touches Firebase (matchmaking, presence, live battle
 * state, timers, leaderboards) must read/write through these helpers
 * instead of hand-writing path strings. This keeps the RTDB schema
 * documented in one place and prevents silent path typos.
 *
 * RTDB shape (Day 1 draft — extended in later days):
 * /rooms/{roomId}                 → room metadata + status
 * /rooms/{roomId}/players/{uid}   → per-player live state
 * /matchmaking/queue/{uid}        → queue entry while searching for a match
 * /presence/{uid}                 → online/offline/lastSeen
 * /battles/{battleId}/state       → current question index, timer, phase
 * /battles/{battleId}/answers/{uid} → live answer submissions
 * /leaderboards/{battleId}        → live score updates during a battle
 * /matchmaking/assignments/{uid}  → written by the server the instant a match is made
 */
export const realtimePaths = {
  room: (roomId) => `rooms/${roomId}`,
  roomPlayers: (roomId) => `rooms/${roomId}/players`,
  roomPlayer: (roomId, userId) => `rooms/${roomId}/players/${userId}`,

  matchmakingQueue: () => `matchmaking/queue`,
  matchmakingEntry: (userId) => `matchmaking/queue/${userId}`,
  matchmakingAssignment: (userId) => `matchmaking/assignments/${userId}`,
  userNotifications: (clerkId) => `notifications/${clerkId}`,

  quizSession: (roomId) => `quizSessions/${roomId}`,
  quizAnswers: (roomId, questionIndex) => `quizSessions/${roomId}/answers/${questionIndex}`,
  quizPlayerAnswer: (roomId, questionIndex, userId) =>
    `quizSessions/${roomId}/answers/${questionIndex}/${userId}`,

  presence: (userId) => `presence/${userId}`,

  battleState: (battleId) => `battles/${battleId}/state`,
  battleAnswers: (battleId) => `battles/${battleId}/answers`,
  battleAnswer: (battleId, userId) => `battles/${battleId}/answers/${userId}`,

  liveLeaderboard: (battleId) => `leaderboards/${battleId}`,
};

export default realtimePaths;
