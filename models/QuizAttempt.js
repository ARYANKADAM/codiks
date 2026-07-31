import mongoose, { Schema } from "mongoose";

const quizAnswerSchema = new Schema(
  {
    question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    selectedOptionIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
    pointsEarned: { type: Number, default: 0 },
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const quizAttemptSchema = new Schema(
  {
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    quiz: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    answers: { type: [quizAnswerSchema], default: [] },
    totalScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

quizAttemptSchema.index({ room: 1, user: 1 }, { unique: true });

export const QuizAttempt = mongoose.models.QuizAttempt || mongoose.model("QuizAttempt", quizAttemptSchema);
export default QuizAttempt;