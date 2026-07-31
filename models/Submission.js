import mongoose, { Schema } from "mongoose";

const submissionSchema = new Schema(
  {
    battle: { type: Schema.Types.ObjectId, ref: "Battle", default: null }, // null = practice submission
    question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    language: {
      type: String,
      enum: ["javascript", "python", "cpp", "java", "go", "rust"],
      required: true,
    },
    code: { type: String, required: true },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "wrong_answer",
        "runtime_error",
        "time_limit_exceeded",
        "compile_error",
      ],
      default: "pending",
      index: true,
    },

    runtimeMs: { type: Number, default: null },
    memoryKb: { type: Number, default: null },
    testCasesPassed: { type: Number, default: 0 },
    testCasesTotal: { type: Number, default: 0 },

    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

submissionSchema.index({ battle: 1, user: 1 });

export const Submission =
  mongoose.models.Submission || mongoose.model("Submission", submissionSchema);
export default Submission;