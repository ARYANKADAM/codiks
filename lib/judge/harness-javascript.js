import "server-only";

export function buildJavaScriptHarness({ userCode, functionName, testCases }) {
  const payload = Buffer.from(JSON.stringify(testCases)).toString("base64");

  return `${userCode}

const __payload = JSON.parse(Buffer.from("${payload}", "base64").toString("utf-8"));
const __results = [];
for (const tc of __payload) {
  const __start = Date.now();
  try {
    const args = JSON.parse(tc.input);
    const expected = JSON.parse(tc.expectedOutput);
    const actual = ${functionName}(...args);
    __results.push({
      passed: JSON.stringify(actual) === JSON.stringify(expected),
      actual,
      expected,
      timeMs: Date.now() - __start,
    });
  } catch (err) {
    __results.push({ passed: false, error: String(err && err.message || err), timeMs: Date.now() - __start });
  }
}
console.log("###CODEARENA_RESULT###" + JSON.stringify(__results));
`;
}

export default buildJavaScriptHarness;