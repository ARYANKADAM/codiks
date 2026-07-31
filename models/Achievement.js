import mongoose, { Schema } from "mongoose";

const achievementSchema = new Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g. "first_win", "10_win_streak"
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: "trophy" }, // lucide-react icon name

    // Flexible criteria the achievement-check job evaluates against user.stats
    criteria: {
      metric: { type: String, required: true }, // e.g. "wins", "winStreak", "totalBattles"
      threshold: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

export const Achievement =
  mongoose.models.Achievement || mongoose.model("Achievement", achievementSchema);
export default Achievement;