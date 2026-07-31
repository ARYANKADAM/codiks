import mongoose, { Schema } from "mongoose";

const quizSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    category: { type: String, trim: true, index: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard", "mixed"], default: "mixed" },

    questions: { type: [{ type: Schema.Types.ObjectId, ref: "Question" }], default: [] },
    timePerQuestionSec: { type: Number, default: 30 },

    isPublished: { type: Boolean, default: false, index: true },
    playCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
export default Quiz;