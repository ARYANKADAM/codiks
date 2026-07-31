import mongoose, { Schema } from "mongoose";

const participantSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ratingBefore: { type: Number, required: true },
    ratingAfter: { type: Number, default: null },
  },
  { _id: false }
);

const battleSchema = new Schema(
  {
    room: { type: Schema.Types.ObjectId, ref: "Room", default: null },
    participants: { type: [participantSchema], required: true },

    mode: { type: String, enum: ["1v1", "ranked", "quiz", "math", "cs_quiz"], default: "1v1" },
    questions: { type: [{ type: Schema.Types.ObjectId, ref: "Question" }], default: [] },

    status: {
      type: String,
      enum: ["pending", "active", "completed", "aborted"],
      default: "pending",
      index: true,
    },

    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    winner: { type: Schema.Types.ObjectId, ref: "User", default: null }, // null = draw/in progress
  },
  { timestamps: true }
);

battleSchema.index({ "participants.user": 1 });

export const Battle = mongoose.models.Battle || mongoose.model("Battle", battleSchema);
export default Battle;