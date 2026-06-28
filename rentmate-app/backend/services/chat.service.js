// Chat Service Layer
// Purpose: Handles chat business logic, participants ownership verification, and payload formatting matching frontend.
import chatRepository from '../repositories/chat.repository.js';
import Inquiry from '../models/inquiry.model.js';
import ApiError from '../utils/ApiError.js';
import STATUS_CODES from '../constants/statusCodes.js';

// Helper mapper to format conversation payload exactly how frontend expects
const mapConversation = (convo, currentUserId) => {
  const tenant = convo.participants.find((p) => p.role === 'tenant') || convo.participants[0] || {};
  const owner = convo.participants.find((p) => p.role === 'owner') || convo.participants[1] || {};
  const property = convo.inquiryId?.propertyId || null;

  return {
    _id: convo._id,
    inquiryId: convo.inquiryId?._id || convo.inquiryId,
    tenantId: tenant,
    ownerId: owner,
    propertyId: property,
    lastMessage: {
      text: convo.lastMessage || '',
      senderId: convo.lastMessage ? (convo.participants.find((p) => p.role === 'tenant')?._id) : null,
      createdAt: convo.lastMessageAt || convo.updatedAt,
    },
    unreadCount: convo.unreadCount || 0,
  };
};

// Helper mapper to format message payload exactly how frontend expects
const mapMessage = (msg) => ({
  _id: msg._id,
  conversationId: msg.conversationId,
  senderId: msg.sender,
  receiverId: msg.receiver,
  text: msg.text,
  createdAt: msg.createdAt,
  isRead: msg.read,
});

export const getConversations = async (userId) => {
  const convos = await chatRepository.findConversationsByUserId(userId);
  return convos.map((c) => mapConversation(c, userId));
};

export const getMessages = async (conversationId, userId) => {
  const convo = await chatRepository.findConversationById(conversationId);
  if (!convo) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Chat conversation not found.');
  }

  // Authorize participant
  const isParticipant = convo.participants.some((p) => p._id.toString() === userId.toString());
  if (!isParticipant) {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'Access denied. You are not a participant in this conversation.');
  }

  const messages = await chatRepository.findMessagesByConversationId(conversationId);
  return messages.map(mapMessage);
};

export const sendMessage = async (senderId, payload) => {
  let { conversationId, text, inquiryId } = payload;
  let convo = null;

  if (!conversationId && inquiryId) {
    // Check if conversation already exists for this inquiry
    convo = await chatRepository.findConversationByInquiryId(inquiryId);
    if (!convo) {
      // Create new conversation after validating inquiry ownership
      const inquiry = await Inquiry.findById(inquiryId).populate('propertyId');
      if (!inquiry) {
        throw new ApiError(STATUS_CODES.NOT_FOUND, 'Referenced inquiry record not found.');
      }

      // Assert that sender is either tenant or owner of this inquiry
      const isTenant = inquiry.tenantId.toString() === senderId.toString();
      const isOwner = inquiry.ownerId.toString() === senderId.toString();

      if (!isTenant && !isOwner) {
        throw new ApiError(STATUS_CODES.FORBIDDEN, 'Access denied. You do not own this inquiry.');
      }

      convo = await chatRepository.createConversation({
        participants: [inquiry.tenantId, inquiry.ownerId],
        inquiryId: inquiry._id,
        lastMessage: text,
        lastMessageAt: new Date(),
      });
    }
    conversationId = convo._id;
  } else {
    convo = await chatRepository.findConversationById(conversationId);
    if (!convo) {
      // Fallback: If conversationId is treated as an inquiry ID by the frontend fallback
      const inquiry = await Inquiry.findById(conversationId);
      if (inquiry) {
        return await sendMessage(senderId, { inquiryId: conversationId, text });
      }
      throw new ApiError(STATUS_CODES.NOT_FOUND, 'Chat conversation not found.');
    }
  }

  // Authorize participant
  const isParticipant = convo.participants.some((p) => p._id.toString() === senderId.toString());
  if (!isParticipant) {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'Access denied. You cannot send messages in this chat.');
  }

  // Get recipient
  const recipient = convo.participants.find((p) => p._id.toString() !== senderId.toString());
  if (!recipient) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Conversation participant is missing.');
  }

  // Create message in DB
  const newMsg = await chatRepository.createMessage({
    conversationId,
    sender: senderId,
    receiver: recipient._id,
    text,
    read: false,
  });

  // Update conversation last message summary
  await chatRepository.updateConversationLastMessage(conversationId, text);

  return mapMessage(newMsg);
};

export const markRead = async (conversationId, userId) => {
  const convo = await chatRepository.findConversationById(conversationId);
  if (!convo) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Conversation not found.');
  }

  const isParticipant = convo.participants.some((p) => p._id.toString() === userId.toString());
  if (!isParticipant) {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'Access denied.');
  }

  await chatRepository.markMessagesAsRead(conversationId, userId);
  return { success: true };
};

export default {
  getConversations,
  getMessages,
  sendMessage,
  markRead,
};
