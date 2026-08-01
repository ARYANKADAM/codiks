import "server-only";
import { connectDB } from "@/lib/db";
import { Battle } from "@/models/Battle";
import { BattleResult } from "@/models/BattleResult";
import { Submission } from "@/models/Submission";
import { User } from "@/models/User";
import { calculateEloChange } from "@/lib/elo";
import { adminDB } from "@/lib/firebase-admin";
import { realtimePaths } from "@/lib/realtime-paths";
import { createNotification } from "@/lib/notification-service";
import { checkAndUnlockAchievements } from "@/lib/achievement-service";
import { ChatMessage } from "@/models/ChatMessage";
import { buildConversationId } from "@/lib/chat-realtime";

export async function settleBattle(battleId, { forcedWinnerId, reason = "solved" } = {}) {
  await connectDB();

  // Atomically claim this battle for settlement. If another call already
  // claimed or completed it, this returns null and we bail immediately —
  // no retry can ever re-run the stat mutations below more than once.
  const claimed = await Battle.findOneAndUpdate(
    { _id: battleId, status: { $in: ["pending", "active"] } },
    { $set: { status: "settling" } },
    { new: true }
  ).populate("participants.user");

  if (!claimed) {
    const existing = await Battle.findById(battleId);
    return existing?.status === "completed" ? { alreadySettled: true } : null;
  }

  const battle = claimed;

  try {
    const submissions = await Submission.find({ battle: battleId }).sort({ submittedAt: 1 });

    const bestByUser = new Map();
    for (const sub of submissions) {
      const key = String(sub.user);
      const current = bestByUser.get(key);
      const isBetter =
        !current ||
        (sub.status === "accepted" && current.status !== "accepted") ||
        (sub.status === current.status && sub.testCasesPassed > current.testCasesPassed);
      if (isBetter) bestByUser.set(key, sub);
    }

    const participants = battle.participants.map((p) => {
      const best = bestByUser.get(String(p.user._id));
      return {
        user: p.user,
        ratingBefore: p.ratingBefore,
        solved: best?.status === "accepted",
        testCasesPassed: best?.testCasesPassed ?? 0,
        testCasesTotal: best?.testCasesTotal ?? 0,
        submittedAt: best?.submittedAt ?? null,
        submissionId: best?._id ?? null,
      };
    });

   let winnerIndex = -1;

    if (forcedWinnerId) {
      winnerIndex = participants.findIndex((p) => String(p.user._id) === String(forcedWinnerId));
    } else {
      const solvedParticipants = participants.filter((p) => p.solved);
      if (solvedParticipants.length > 0) {
        const earliestSolve = solvedParticipants.reduce((a, b) => (a.submittedAt < b.submittedAt ? a : b));
        winnerIndex = participants.indexOf(earliestSolve);
      } else {
        const [a, b] = participants;
        if (a.testCasesPassed !== b.testCasesPassed) {
          winnerIndex = a.testCasesPassed > b.testCasesPassed ? 0 : 1;
        }
      }
    }

    // Compute everything and create BattleResult docs FIRST. Nothing on
    // the User documents is touched yet — if this fails, we've written
    // nothing, so a retry starts clean instead of duplicating anything.
    const plan = [];
    for (let i = 0; i < participants.length; i++) {
      const me = participants[i];
      const opponent = participants[1 - i];
      const score = winnerIndex === -1 ? 0.5 : winnerIndex === i ? 1 : 0;
      const ratingChange = calculateEloChange(me.ratingBefore, opponent.ratingBefore, score);
      const newRating = me.ratingBefore + ratingChange;

      const result = await BattleResult.create({
        battle: battle._id,
        user: me.user._id,
        questionsSolved: me.solved ? 1 : 0,
        totalQuestions: 1,
        score: me.testCasesPassed,
        timeTakenMs:
          me.submittedAt && battle.startedAt
            ? me.submittedAt.getTime() - battle.startedAt.getTime()
            : null,
        ratingChange,
        placement: winnerIndex === -1 ? null : winnerIndex === i ? 1 : 2,
        submissions: me.submissionId ? [me.submissionId] : [],
      });

      plan.push({ userId: me.user._id, clerkId: me.user.clerkId, score, ratingChange, newRating, resultId: result._id });
    }

    // Only now, after every BattleResult exists, do we touch User stats.
    for (const p of plan) {
      const user = await User.findById(p.userId);
      const nextWinStreak = p.score === 1 ? user.stats.winStreak + 1 : 0;

      user.rating = p.newRating;
      user.stats.totalBattles += 1;
      user.stats.wins += p.score === 1 ? 1 : 0;
      user.stats.losses += p.score === 0 ? 1 : 0;
      user.stats.draws += p.score === 0.5 ? 1 : 0;
      user.stats.winStreak = nextWinStreak;
      user.stats.bestWinStreak = Math.max(user.stats.bestWinStreak, nextWinStreak);
      user.ratingHistory.push({ rating: p.newRating, recordedAt: new Date() });

      await user.save();
      const resultLabel = p.score === 1 ? "Victory!" : p.score === 0 ? "Defeat" : "Draw";
      const resultMessage =
        p.score === 1
          ? `You won and gained ${p.ratingChange} rating.`
          : p.score === 0
          ? `You lost and dropped ${Math.abs(p.ratingChange)} rating.`
          : "The match ended in a draw.";

      await createNotification({
        userId: p.userId,
        clerkId: p.clerkId,
        type: "battle_result",
        title: resultLabel,
        message: resultMessage,
        link: "/dashboard",
      });

      await checkAndUnlockAchievements(p.userId);
    }

    battle.status = "completed";
    battle.endedAt = new Date();
    battle.winner = winnerIndex === -1 ? null : participants[winnerIndex].user._id;
    battle.participants.forEach((p, i) => {
      p.ratingAfter = plan[i].newRating;
    });
    await battle.save();

    const [playerA, playerB] = participants;
    const conversationId = buildConversationId(playerA.user.clerkId, playerB.user.clerkId);
    const resultData = {
      battleId: String(battle._id),
      roomId: battle.room ? String(battle.room) : null,
      mode: battle.mode,
      reason,
      winnerClerkId: winnerIndex === -1 ? null : participants[winnerIndex].user.clerkId,
      participants: participants.map((p, i) => ({
        clerkId: p.user.clerkId,
        username: p.user.username,
        avatarUrl: p.user.avatarUrl || null,
        score: plan[i].score,
        ratingChange: plan[i].ratingChange,
        ratingAfter: plan[i].newRating,
        placement: winnerIndex === -1 ? null : winnerIndex === i ? 1 : 2,
        questionsSolved: p.solved ? 1 : 0,
        totalQuestions: 1,
      })),
    };

    await ChatMessage.create({
      conversationId,
      senderClerkId: "system",
      recipientClerkId: playerA.user.clerkId,
      senderUsername: "CodeArena",
      senderAvatarUrl: null,
      kind: "battle_result",
      text: "Challenge result",
      resultData,
      createdAtMs: Date.now(),
    });

    await Promise.all(
      participants.map((p) =>
        createNotification({
          userId: p.user._id,
          clerkId: p.user.clerkId,
          type: "system",
          title: "Challenge result",
          message: resultData.winnerClerkId
            ? resultData.winnerClerkId === p.user.clerkId
              ? "You got the battle result."
              : `${participants.find((x) => x.user.clerkId === resultData.winnerClerkId)?.user.username || "Your opponent"} won the challenge.`
            : "Your challenge ended in a draw.",
          link: `/chat?with=${participants.find((x) => x.user.clerkId !== p.user.clerkId)?.user.clerkId}`,
          metadata: {
            category: "chat_message",
            messageKind: "battle_result",
            battleId: String(battle._id),
            conversationId,
          },
        })
      )
    );

   await adminDB.ref(realtimePaths.battleState(String(battle._id))).update({
    completedAt: Date.now(),
    winnerId: winnerIndex === -1 ? null : participants[winnerIndex].user.clerkId,
    reason,
  });

    return { alreadySettled: false, winnerIndex, participants, battleResults: plan };
  } catch (err) {
    // Something failed mid-settlement. Release the claim back to "active"
    // so a future call can retry cleanly, instead of leaving it stuck.
    await Battle.findByIdAndUpdate(battleId, { $set: { status: "active" } });
    throw err;
  }
}

export default settleBattle;