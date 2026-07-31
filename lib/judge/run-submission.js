import "server-only";
import { runOnJudge0 } from "@/lib/judge/judge0-client";
import { LANGUAGE_IDS, JUDGE0_STATUS } from "@/lib/judge/languages";
import { buildJavaScriptHarness } from "@/lib/judge/harness-javascript";
import { buildPythonHarness } from "@/lib/judge/harness-python";
import { runLocalJavaScript } from "@/lib/judge/providers/local-vm";

const RESULT_MARKER = "###CODEARENA_RESULT###";
const HARNESS_BUILDERS = { javascript: buildJavaScriptHarness, python: buildPythonHarness };

async function runViaRapidApi({ language, code, functionName, testCases }) {
  const buildHarness = HARNESS_BUILDERS[language];
  const languageId = LANGUAGE_IDS[language];

  if (!buildHarness || !languageId) {
    return { verdict: "compile_error", error: `Unsupported language: ${language}`, results: [] };
  }

  const sourceCode = buildHarness({ userCode: code, functionName, testCases });
  const judge0Result = await runOnJudge0({ sourceCode, languageId });
  const statusId = judge0Result.status?.id;

  if (statusId === JUDGE0_STATUS.COMPILATION_ERROR) {
    return { verdict: "compile_error", error: judge0Result.compile_output, results: [], runtimeMs: null };
  }
  if (statusId >= JUDGE0_STATUS.RUNTIME_ERROR_START && statusId <= JUDGE0_STATUS.RUNTIME_ERROR_END) {
    return { verdict: "runtime_error", error: judge0Result.stderr, results: [], runtimeMs: null };
  }
  if (statusId === JUDGE0_STATUS.TIME_LIMIT_EXCEEDED) {
    return { verdict: "time_limit_exceeded", error: null, results: [], runtimeMs: null };
  }

  const stdout = judge0Result.stdout ?? "";
  const markerIndex = stdout.indexOf(RESULT_MARKER);
  if (markerIndex === -1) {
    return {
      verdict: "runtime_error",
      error: "Could not parse test results — check the function name matches the problem.",
      results: [],
      runtimeMs: null,
    };
  }

  let results;
  try {
    results = JSON.parse(stdout.slice(markerIndex + RESULT_MARKER.length).trim());
  } catch {
    return { verdict: "runtime_error", error: "Malformed test result output.", results: [], runtimeMs: null };
  }

  const allPassed = results.length > 0 && results.every((r) => r.passed);
  return {
    verdict: allPassed ? "accepted" : "wrong_answer",
    error: null,
    results,
    runtimeMs: Math.round(parseFloat(judge0Result.time ?? "0") * 1000),
    memoryKb: judge0Result.memory ?? null,
  };
}

/**
 * Single entry point the rest of the app calls. Which engine actually
 * runs the code is controlled by JUDGE_PROVIDER, so swapping providers
 * later never requires touching the API route or any UI component.
 */
export async function runSubmission({ language, code, functionName, testCases }) {
  const provider = process.env.JUDGE_PROVIDER || "local";

  if (provider === "local") {
    if (language !== "javascript") {
      return {
        verdict: "compile_error",
        error: "The local judge only supports JavaScript right now — try again with JavaScript selected.",
        results: [],
      };
    }
    return runLocalJavaScript({ code, functionName, testCases });
  }

  return runViaRapidApi({ language, code, functionName, testCases });
}

export default runSubmission;