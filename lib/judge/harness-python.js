import "server-only";

export function buildPythonHarness({ userCode, functionName, testCases }) {
  const payload = Buffer.from(JSON.stringify(testCases)).toString("base64");

  return `${userCode}

import json, time, base64

__payload = json.loads(base64.b64decode("${payload}").decode("utf-8"))
__results = []
for tc in __payload:
    __start = time.time()
    try:
        args = json.loads(tc["input"])
        expected = json.loads(tc["expectedOutput"])
        actual = ${functionName}(*args)
        __results.append({
            "passed": actual == expected,
            "actual": actual,
            "expected": expected,
            "timeMs": int((time.time() - __start) * 1000),
        })
    except Exception as e:
        __results.append({"passed": False, "error": str(e), "timeMs": int((time.time() - __start) * 1000)})

print("###CODEARENA_RESULT###" + json.dumps(__results))
`;
}

export default buildPythonHarness;