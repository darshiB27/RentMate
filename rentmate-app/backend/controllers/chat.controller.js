// Chat Controller Layer
// Purpose: Exposes HTTP endpoints handlers for conversations lookup and messages logging.
import asyncHandler from '../utils/asyncHandler.js';
import chatService from '../services/chat.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import STATUS_CODES from '../constants/statusCodes.js';

export const getConversations = asyncHandler(async (req, res) => {
  const result = await chatService.getConversations(req.user.id);
  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, result, 'Conversations retrieved successfully.')
  );
});

export const getMessages = asyncHandler(async (req, res) => {
  const result = await chatService.getMessages(req.params.conversationId, req.user.id);
  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, result, 'Messages log history retrieved successfully.')
  );
});

export const sendMessage = asyncHandler(async (req, res) => {
  const result = await chatService.sendMessage(req.user.id, req.body);
  return res.status(STATUS_CODES.CREATED).json(
    new ApiResponse(STATUS_CODES.CREATED, result, 'Message sent successfully.')
  );
});

export const markRead = asyncHandler(async (req, res) => {
  const result = await chatService.markRead(req.params.conversationId, req.user.id);
  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, result, 'Messages marked as read.')
  );
});

export default {
  getConversations,
  getMessages,
  sendMessage,
  markRead,
};
