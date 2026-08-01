import mongoose, { Schema } from "mongoose";

const dailyChallengeProgressSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true }, // "YYYY-MM-DD" (UTC)
    counters: { type: Map, of: Number, default: () => ({}) },
  },
  { timestamps: true }
);

dailyChallengeProgressSchema.index({ user: 1, date: 1 }, { unique: true });

export const DailyChallengeProgress =
  mongoose.models.DailyChallengeProgress || mongoose.model("DailyChallengeProgress", dailyChallengeProgressSchema);
export default DailyChallengeProgress;