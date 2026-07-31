import mongoose, { Schema } from "mongoose";

const leaderboardEntrySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rank: { type: Number, required: true },
    score: { type: Number, required: true },
    rating: { type: Number, required: true },
  },
  { _id: false }
);

const leaderboardSchema = new Schema(
  {
    scope: { type: String, enum: ["global", "weekly", "monthly", "battle"], required: true },
    battle: { type: Schema.Types.ObjectId, ref: "Battle", default: null },

    periodStart: { type: Date, default: null },
    periodEnd: { type: Date, default: null },

    entries: { type: [leaderboardEntrySchema], default: [] },
  },
  { timestamps: true }
);

leaderboardSchema.index({ scope: 1, periodStart: -1 });

export const Leaderboard =
  mongoose.models.Leaderboard || mongoose.model("Leaderboard", leaderboardSchema);
export default Leaderboard;