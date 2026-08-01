import mongoose, { Schema } from "mongoose";

const chatMessageSchema = new Schema(
  {
    conversationId: { type: String, required: true, index: true },
    senderClerkId: { type: String, required: true, index: true },
    recipientClerkId: { type: String, required: true, index: true },
    senderUsername: { type: String, required: true },
    senderAvatarUrl: { type: String, default: null },
    kind: { type: String, enum: ["text", "battle_result"], default: "text", index: true },
    text: { type: String, required: true, maxlength: 1000 },
    resultData: { type: Schema.Types.Mixed, default: null },
    createdAtMs: { type: Number, required: true, index: true },
  },
  { timestamps: true }
);

chatMessageSchema.index({ conversationId: 1, createdAtMs: 1 });

export const ChatMessage = mongoose.models.ChatMessage || mongoose.model("ChatMessage", chatMessageSchema);
export default ChatMessage;
