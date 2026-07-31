import "server-only";

const RAPIDAPI_HOST = "judge0-ce.p.rapidapi.com";
const BASE_URL = `https://${RAPIDAPI_HOST}`;

export async function runOnJudge0({ sourceCode, languageId, stdin = "" }) {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error("RAPIDAPI_KEY is not configured");

  const res = await fetch(`${BASE_URL}/submissions?base64_encoded=false&wait=true`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": RAPIDAPI_HOST,
    },
    body: JSON.stringify({ source_code: sourceCode, language_id: languageId, stdin }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Judge0 request failed (${res.status}): ${text}`);
  }

  return res.json();
}

export default runOnJudge0;