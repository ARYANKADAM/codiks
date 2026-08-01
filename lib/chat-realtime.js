export function buildConversationId(clerkIdA, clerkIdB) {
  const a = String(clerkIdA || "").trim();
  const b = String(clerkIdB || "").trim();
  if (!a || !b) return "";
  return [a, b].sort().join("__");
}

export default buildConversationId;
