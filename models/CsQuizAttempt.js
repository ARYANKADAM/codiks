import mongoose, { Schema } from "mongoose";

const csQuizAttemptSchema = new Schema(
  {
    battle: { type: Schema.Types.ObjectId, ref: "Battle", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    correctCount: { type: Number, default: 0 },
    totalAnswered: { type: Number, default: 0 },
    lastQuestionIndex: { type: Number, default: -1 },
  },
  { timestamps: true }
);

csQuizAttemptSchema.index({ battle: 1, user: 1 }, { unique: true });

export const CsQuizAttempt = mongoose.models.CsQuizAttempt || mongoose.model("CsQuizAttempt", csQuizAttemptSchema);
export default CsQuizAttempt;