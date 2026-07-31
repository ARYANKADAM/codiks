import mongoose, { Schema } from "mongoose";

const mcqOptionSchema = new Schema(
  {
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
);

const testCaseSchema = new Schema(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
  },
  { _id: false }
);

const questionSchema = new Schema(
  {
    type: { type: String, enum: ["mcq", "coding"], required: true, index: true },
    title: { type: String, required: true, trim: true },
    prompt: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
      index: true,
    },
    tags: { type: [String], default: [], index: true },
    points: { type: Number, default: 100 },

    // MCQ-only
    options: { type: [mcqOptionSchema], default: undefined },

    // Coding-only
    starterCode: { type: Map, of: String, default: undefined }, // { javascript: "...", python: "..." }
    functionName: { type: String, trim: true }, // e.g. "twoSum" — the function the judge invokes
    testCases: { type: [testCaseSchema], default: undefined },
    constraints: { type: String },
    timeLimitMs: { type: Number, default: 2000 },
    memoryLimitMb: { type: Number, default: 128 },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);
export default Question;