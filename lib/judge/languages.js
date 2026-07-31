export const LANGUAGE_IDS = {
  javascript: 63, // Node.js 12.14.0 on Judge0 CE
  python: 71, // Python 3.8.1
};

// Judge0 status.id reference — see https://ce.judge0.com/ "Statuses"
export const JUDGE0_STATUS = {
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_ERROR_START: 7, // 7–12 cover various runtime error subtypes
  RUNTIME_ERROR_END: 12,
};