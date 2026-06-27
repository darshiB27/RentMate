// Conversation Mongoose Model Schema
// Purpose: Models chat metadata channels between tenants and owners.
import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    inquiryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inquiry',
      required: false,
    },
    lastMessage: {
      type: String,
      trim: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes to speed up conversation lookups for users
conversationSchema.index({ participants: 1 });
conversationSchema.index({ inquiryId: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
