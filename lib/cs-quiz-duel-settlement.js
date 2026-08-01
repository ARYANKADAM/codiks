import "server-only";
import { connectDB } from "@/lib/db";
import { Battle } from "@/models/Battle";
import { BattleResult } from "@/models/BattleResult";
import { CsQuizAttempt } from "@/models/CsQuizAttempt";
import { User } from "@/models/User";
import { calculateEloChange } from "@/lib/elo";
import { adminDB } from "@/lib/firebase-admin";
import { realtimePaths } from "@/lib/realtime-paths";
import { createNotification } from "@/lib/notification-service";
import { updateDailyStreak } from "@/lib/daily-streak";
import { checkAndUnlockAchievements } from "@/lib/achievement-service";
import { recordDuelForDailyChallenges } from "@/lib/daily-challenge-service";
import { ChatMessage } from "@/models/ChatMessage";
import { buildConversationId } from "@/lib/chat-realtime";

export async function settleCsQuizDuel(battleId, { forcedWinnerId, reason = "solved" } = {}) {
  await connectDB();

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
    const attempts = await CsQuizAttempt.find({ battle: battleId });
    const attemptByUser = new Map(attempts.map((a) => [String(a.user), a]));

    const participants = battle.participants.map((p) => {
      const a = attemptByUser.get(String(p.user._id));
      return {
        user: p.user,
        ratingBefore: p.ratingBefore,
        correctCount: a?.correctCount ?? 0,
        totalAnswered: a?.totalAnswered ?? 0,
      };
    });

    let winnerIndex = -1;
    if (forcedWinnerId) {
      winnerIndex = participants.findIndex((p) => String(p.user._id) === String(forcedWinnerId));
    } else {
      const [a, b] = participants;
      if (a.correctCount !== b.correctCount) {
        winnerIndex = a.correctCount > b.correctCount ? 0 : 1;
      }
    }

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
        questionsSolved: me.correctCount,
        totalQuestions: me.totalAnswered,
        score: me.correctCount,
        timeTakenMs: null,
        ratingChange,
        placement: winnerIndex === -1 ? null : winnerIndex === i ? 1 : 2,
        submissions: [],
      });

     plan.push({ userId: me.user._id, clerkId: me.user.clerkId, score, ratingChange, newRating, resultId: result._id, correctCount: me.correctCount });
    }

    for (const p of plan) {
      const user = await User.findById(p.userId);
      const nextWinStreak = p.score === 1 ? user.csQuizStats.winStreak + 1 : 0;

      user.csQuizRating = p.newRating;
      user.csQuizStats.totalBattles += 1;
      user.csQuizStats.wins += p.score === 1 ? 1 : 0;
      user.csQuizStats.losses += p.score === 0 ? 1 : 0;
      user.csQuizStats.draws += p.score === 0.5 ? 1 : 0;
      user.csQuizStats.winStreak = nextWinStreak;
      user.csQuizStats.bestWinStreak = Math.max(user.csQuizStats.bestWinStreak, nextWinStreak);
      await user.save();

      const resultLabel = p.score === 1 ? "Victory!" : p.score === 0 ? "Defeat" : "Draw";
      const resultMessage =
        p.score === 1
          ? `You won the CS quiz duel and gained ${p.ratingChange} rating.`
          : p.score === 0
          ? `You lost the CS quiz duel and dropped ${Math.abs(p.ratingChange)} rating.`
          : "The CS quiz duel ended in a draw.";

      await createNotification({
        userId: p.userId,
        clerkId: p.clerkId,
        type: "battle_result",
        title: resultLabel,
        message: resultMessage,
        link: "/dashboard",
      });

      const streakResult = await updateDailyStreak(p.userId);
      if (streakResult.streakChanged) {
        await createNotification({
          userId: p.userId,
          clerkId: p.clerkId,
          type: "streak_updated",
          title: `🔥 Daily streak: ${streakResult.newStreak}`,
          message:
            streakResult.newStreak === 1
              ? "You started a new streak today!"
              : `You're on a ${streakResult.newStreak}-day streak!`,
          link: "/dashboard/profile",
        });
        await checkAndUnlockAchievements(p.userId);
        await recordDuelForDailyChallenges(p.userId, { mode: "cs_quiz", won: p.score === 1, correctCount: p.correctCount });
      }
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
        score: p.correctCount,
        ratingChange: plan[i].ratingChange,
        ratingAfter: plan[i].newRating,
        placement: winnerIndex === -1 ? null : winnerIndex === i ? 1 : 2,
        questionsSolved: p.correctCount,
        totalQuestions: p.totalAnswered,
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
    await Battle.findByIdAndUpdate(battleId, { $set: { status: "active" } });
    throw err;
  }
}

export default settleCsQuizDuel;