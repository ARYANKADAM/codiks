import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Battle } from "@/models/Battle";
import { User } from "@/models/User";
import { Submission } from "@/models/Submission";
import { runSubmission } from "@/lib/judge/run-submission";
import { adminDB } from "@/lib/firebase-admin";
import { realtimePaths } from "@/lib/realtime-paths";
import { settleBattle } from "@/lib/battle-settlement";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = rateLimit(`submit:${userId}`, { limit: 10, windowMs: 60_000 });
  if (!limit.success) {
    return NextResponse.json(
      { error: `Too many submissions — try again in ${Math.ceil(limit.retryAfterMs / 1000)}s` },
      { status: 429 }
    );
  }

  const { battleId } = await params;
  const { language, code, isRun = false } = await req.json();

  if (!language || !code) {
    return NextResponse.json({ error: "language and code are required" }, { status: 400 });
  }

  await connectDB();

  const [battle, me] = await Promise.all([
    Battle.findById(battleId).populate("questions").lean(),
    User.findOne({ clerkId: userId }).lean(),
  ]);

  if (!battle || !me) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParticipant = battle.participants.some((p) => String(p.user) === String(me._id));
  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const question = battle.questions?.[0];
  if (!question) return NextResponse.json({ error: "No question on this battle" }, { status: 400 });

  const testCases = isRun ? question.testCases.filter((tc) => !tc.isHidden) : question.testCases;

  const outcome = await runSubmission({
    language,
    code,
    functionName: question.functionName,
    testCases,
  });

  if (isRun) {
    // Dry run against sample cases — no persistence, no effect on the live battle.
    return NextResponse.json(outcome);
  }

  const submission = await Submission.create({
    battle: battle._id,
    question: question._id,
    user: me._id,
    language,
    code,
    status: outcome.verdict,
    runtimeMs: outcome.runtimeMs,
    memoryKb: outcome.memoryKb,
    testCasesPassed: outcome.results.filter((r) => r.passed).length,
    testCasesTotal: outcome.results.length,
  });

  // Push to Firebase so the opponent's screen updates instantly.
  await adminDB.ref(realtimePaths.battleAnswer(battleId, userId)).set({
    status: outcome.verdict,
    testCasesPassed: submission.testCasesPassed,
    testCasesTotal: submission.testCasesTotal,
    submittedAt: Date.now(),
  });
  // First player to solve it wins outright — settle immediately.
  if (outcome.verdict === "accepted") {
    await settleBattle(battleId).catch((err) => console.error("Settlement failed:", err));
  }

  return NextResponse.json({ ...outcome, submissionId: String(submission._id) });
}