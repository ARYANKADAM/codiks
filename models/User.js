import mongoose, { Schema } from "mongoose";

const userStatsSchema = new Schema(
  {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    totalBattles: { type: Number, default: 0 },
    totalQuizzes: { type: Number, default: 0 },
    winStreak: { type: Number, default: 0 },
    bestWinStreak: { type: Number, default: 0 },
    
  },
  { _id: false }
);

const unlockedAchievementSchema = new Schema(
  {
    achievement: { type: Schema.Types.ObjectId, ref: "Achievement", required: true },
    unlockedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ratingHistoryEntrySchema = new Schema(
  {
    rating: { type: Number, required: true },
    recordedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, trim: true },
    avatarUrl: { type: String },
    bio: { type: String, maxlength: 280 },

    rating: { type: Number, default: 1200, index: true },
    tier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum", "diamond", "master"],
      default: "bronze",
    },

    stats: { type: userStatsSchema, default: () => ({}) },
    mathRating: { type: Number, default: 1200, index: true },
    mathStats: { type: userStatsSchema, default: () => ({}) },
    csQuizRating: { type: Number, default: 1200, index: true },
    dailyStreak: { type: Number, default: 0 },
    bestDailyStreak: { type: Number, default: 0 },
    lastStreakDate: { type: String, default: null }, // "YYYY-MM-DD" (UTC)
    bannerUrl: { type: String, default: null }, // base64 data URI, client-compressed
    csQuizStats: { type: userStatsSchema, default: () => ({}) },
    unlockedAchievements: { type: [unlockedAchievementSchema], default: [] },
    showcasedAchievements: { type: [Schema.Types.ObjectId], ref: "Achievement", default: [] }, // max 8, enforced in the API route
    ratingHistory: { type: [ratingHistoryEntrySchema], default: [] },

    preferredLanguages: {
      type: [String],
      enum: ["javascript", "python", "cpp", "java", "go", "rust"],
      default: ["javascript"],
    },

    role: { type: String, enum: ["user", "moderator", "admin"], default: "user" },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.index({ rating: -1 });

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;