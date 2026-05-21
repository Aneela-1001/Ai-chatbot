import mongoose, { Schema, type InferSchemaType } from "mongoose";

export const messageSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["system", "user", "assistant"],
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const conversationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: "New chat",
      maxlength: 80
    },
    systemPrompt: {
      type: String,
      trim: true,
      default: "You are a helpful, concise AI assistant."
    },
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 2
    },
    messages: {
      type: [messageSchema],
      default: []
    }
  },
  { timestamps: true }
);

conversationSchema.index({ userId: 1, updatedAt: -1 });

export type ConversationDocument = InferSchemaType<typeof conversationSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Conversation = mongoose.model<ConversationDocument>("Conversation", conversationSchema);
