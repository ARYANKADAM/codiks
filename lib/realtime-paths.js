/**
 * Canonical Firebase Realtime Database path builders. Every feature that
 * touches Firebase must read/write through these helpers instead of
 * hand-writing path strings.
 *
 * /rooms/{roomId}/players/{uid}      → in-room presence (per-battle)
 * /matchmaking/queue/{uid}           → queue entry while searching
 * /matchmaking/assignments/{uid}     → written when a match/challenge is accepted
 * /battles/{battleId}/state          → timer + live battle status
 * /battles/{battleId}/answers/{uid}  → live per-player answer progress
 * /quizSessions/{roomId}             → quiz mode session state
 * /notifications/{uid}               → live notification push
 * /presence/{uid}                    → app-wide (not room-scoped) online status
 * /challenges/{uid}/{challengeId}    → incoming direct-duel challenges
 * /chats/{conversationId}/messages    → direct-message history stream
 * /chatInbox/{uid}/{conversationId}   → per-user conversation preview (last msg)
 */
export const realtimePaths = {
  room: (roomId) => `rooms/${roomId}`,
  roomPlayers: (roomId) => `rooms/${roomId}/players`,
  roomPlayer: (roomId, userId) => `rooms/${roomId}/players/${userId}`,

  matchmakingQueue: () => `matchmaking/queue`,
  matchmakingEntry: (userId) => `matchmaking/queue/${userId}`,
  matchmakingAssignment: (userId) => `matchmaking/assignments/${userId}`,

  battleState: (battleId) => `battles/${battleId}/state`,
  battleAnswers: (battleId) => `battles/${battleId}/answers`,
  battleAnswer: (battleId, userId) => `battles/${battleId}/answers/${userId}`,

  liveLeaderboard: (battleId) => `leaderboards/${battleId}`,

  quizSession: (roomId) => `quizSessions/${roomId}`,
  quizAnswers: (roomId, questionIndex) => `quizSessions/${roomId}/answers/${questionIndex}`,
  quizPlayerAnswer: (roomId, questionIndex, userId) =>
    `quizSessions/${roomId}/answers/${questionIndex}/${userId}`,

  userNotifications: (clerkId) => `notifications/${clerkId}`,
  

  presence: (clerkId) => `presence/${clerkId}`,
  challenges: (clerkId) => `challenges/${clerkId}`,
  challenge: (clerkId, challengeId) => `challenges/${clerkId}/${challengeId}`,
  challengeResponse: (clerkId, responseId) => `challengeResponses/${clerkId}/${responseId}`,

  chatConversation: (conversationId) => `chats/${conversationId}`,
  chatMessagesByConversation: (conversationId) => `chats/${conversationId}/messages`,
  chatInbox: (clerkId) => `chatInbox/${clerkId}`,
  chatInboxThread: (clerkId, conversationId) => `chatInbox/${clerkId}/${conversationId}`,
};

export default realtimePaths;