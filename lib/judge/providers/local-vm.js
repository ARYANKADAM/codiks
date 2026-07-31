import "server-only";
import vm from "node:vm";

const TIMEOUT_MS = 3000;

/**
 * Executes JavaScript submissions inside a fresh V8 context using Node's
 * built-in `vm` module. Zero external dependencies, no API key needed —
 * but this is NOT a true security sandbox (vm contexts are escapable by
 * a determined attacker). Good enough for local dev and demos; swap for
 * runOnJudge0() or runOnGlot() before this is ever exposed to the public
 * internet with untrusted users.
 */
export async function runLocalJavaScript({ code, functionName, testCases }) {
  const wrapped = `
    (function () {
      ${code}

      const __payload = ${JSON.stringify(testCases)};
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
          __results.push({ passed: false, error: String((err && err.message) || err), timeMs: Date.now() - __start });
        }
      }
      return __results;
    })()
  `;

  const sandbox = { Date, JSON, Math, Array, Object, String, Number, Boolean, RegExp, Map, Set };
  vm.createContext(sandbox);

  try {
    const start = Date.now();
    const results = vm.runInContext(wrapped, sandbox, { timeout: TIMEOUT_MS });
    const runtimeMs = Date.now() - start;

    const allPassed = results.length > 0 && results.every((r) => r.passed);
    return { verdict: allPassed ? "accepted" : "wrong_answer", error: null, results, runtimeMs, memoryKb: null };
  } catch (err) {
    if (err.message?.includes("Script execution timed out")) {
      return { verdict: "time_limit_exceeded", error: null, results: [], runtimeMs: TIMEOUT_MS };
    }
    return { verdict: "compile_error", error: err.message, results: [], runtimeMs: null };
  }
}

export default runLocalJavaScript;