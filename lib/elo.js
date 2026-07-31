import "server-only";

const K_FACTOR = 32;

/**
 * Standard ELO update. `score` is 1 for a win, 0 for a loss, 0.5 for a draw.
 * Returns the signed rating delta to apply to this player.
 */
export function calculateEloChange(playerRating, opponentRating, score) {
  const expectedScore = 1 / (1 + 10 ** ((opponentRating - playerRating) / 400));
  return Math.round(K_FACTOR * (score - expectedScore));
}

export default calculateEloChange;