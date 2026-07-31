// Deterministic seeded PRNG (mulberry32) — same battleId + index always
// produces the exact same question on both the client and the server,
// with zero storage needed for the question sequence.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringToSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

const OPERATORS = ["+", "-", "×", "÷"];

function buildQuestion(rand, index) {
  const op = OPERATORS[Math.floor(rand() * OPERATORS.length)];
  let a, b, answer;

  switch (op) {
    case "+":
      a = 1 + Math.floor(rand() * 50);
      b = 1 + Math.floor(rand() * 50);
      answer = a + b;
      break;
    case "-":
      a = 10 + Math.floor(rand() * 90);
      b = 1 + Math.floor(rand() * a);
      answer = a - b;
      break;
    case "×":
      a = 2 + Math.floor(rand() * 12);
      b = 2 + Math.floor(rand() * 12);
      answer = a * b;
      break;
    case "÷":
      b = 2 + Math.floor(rand() * 12);
      answer = 2 + Math.floor(rand() * 12);
      a = b * answer; // guarantees a clean division
      break;
  }

  return { index, expression: `${a} ${op} ${b}`, answer };
}

/**
 * Returns the exact same question for a given (battleId, index) pair no
 * matter who calls it or when — the client renders it, and the server
 * independently regenerates it to validate an answer, never trusting a
 * client-submitted "correct" flag.
 */
export function getMathQuestion(battleId, index) {
  const seed = hashStringToSeed(battleId) + index * 7919;
  const rand = mulberry32(seed);
  return buildQuestion(rand, index);
}

export default getMathQuestion;