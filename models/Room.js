import mongoose, { Schema } from "mongoose";

const roomPlayerSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isReady: { type: Boolean, default: false },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const roomSchema = new Schema(
  {
    roomCode: { type: String, required: true, unique: true, index: true },
    host: { type: Schema.Types.ObjectId, ref: "User", required: true },
    players: { type: [roomPlayerSchema], default: [] },

    mode: { type: String, enum: ["1v1", "quiz", "math", "ffa"], default: "1v1" },
    status: {
      type: String,
      enum: ["waiting", "starting", "in_progress", "completed", "cancelled"],
      default: "waiting",
      index: true,
    },
    quiz: { type: Schema.Types.ObjectId, ref: "Quiz", default: null },
    maxPlayers: { type: Number, default: 2, min: 2, max: 50 },
    isPrivate: { type: Boolean, default: false },

    battle: { type: Schema.Types.ObjectId, ref: "Battle", default: null },
  },
  { timestamps: true }
);

export const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);
export default Room;