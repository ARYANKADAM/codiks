import mongoose, { Schema } from "mongoose";

const battleResultSchema = new Schema(
  {
    battle: { type: Schema.Types.ObjectId, ref: "Battle", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    questionsSolved: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    timeTakenMs: { type: Number, default: 0 },

    ratingChange: { type: Number, default: 0 },
    placement: { type: Number, default: null }, // 1 = winner, 2 = runner-up, etc.

    submissions: { type: [{ type: Schema.Types.ObjectId, ref: "Submission" }], default: [] },
  },
  { timestamps: true }
);

battleResultSchema.index({ battle: 1, user: 1 }, { unique: true });

export const BattleResult =
  mongoose.models.BattleResult || mongoose.model("BattleResult", battleResultSchema);
export default BattleResult;