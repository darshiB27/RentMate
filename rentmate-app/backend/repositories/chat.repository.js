// Chat Repository Layer
// Purpose: Handles Mongoose queries for conversations, messages log retrieval, and status saves.
import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';

export const findConversationsByUserId = async (userId) => {
  const conversations = await Conversation.find({ participants: userId })
    .populate({
      path: 'participants',
      select: 'name email role phoneNumber',
    })
    .populate({
      path: 'inquiryId',
      populate: {
        path: 'propertyId',
        select: 'title images price location address',
      },
    })
    .sort({ lastMessageAt: -1 })
    .lean();

  return await Promise.all(
    conversations.map(async (convo) => {
      const unreadCount = await Message.countDocuments({
        conversationId: convo._id,
        receiver: userId,
        read: false,
      });
      return {
        ...convo,
        unreadCount,
      };
    })
  );
};

export const findConversationById = async (id) => {
  return await Conversation.findById(id)
    .populate({
      path: 'participants',
      select: 'name email role phoneNumber',
    })
    .populate({
      path: 'inquiryId',
      populate: {
        path: 'propertyId',
        select: 'title images price location address',
      },
    });
};

export const findConversationByInquiryId = async (inquiryId) => {
  return await Conversation.findOne({ inquiryId })
    .populate({
      path: 'participants',
      select: 'name email role phoneNumber',
    });
};

export const createConversation = async (data) => {
  const newConvo = await Conversation.create(data);
  return await findConversationById(newConvo._id);
};

export const updateConversationLastMessage = async (id, text) => {
  return await Conversation.findByIdAndUpdate(
    id,
    {
      lastMessage: text,
      lastMessageAt: new Date(),
    },
    { new: true }
  );
};

export const findMessagesByConversationId = async (conversationId) => {
  return await Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .lean();
};

export const createMessage = async (data) => {
  const newMsg = await Message.create(data);
  return await Message.findById(newMsg._id).lean();
};

export const markMessagesAsRead = async (conversationId, userId) => {
  return await Message.updateMany(
    { conversationId, receiver: userId, read: false },
    { $set: { read: true } }
  );
};

export default {
  findConversationsByUserId,
  findConversationById,
  findConversationByInquiryId,
  createConversation,
  updateConversationLastMessage,
  findMessagesByConversationId,
  createMessage,
  markMessagesAsRead,
};
