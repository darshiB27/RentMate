// Chat Routes Collection
// Purpose: Maps chat paths to controllers and secures them with verifyJWT middleware.
import express from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import {
  getConversations,
  getMessages,
  sendMessage,
  markRead,
} from '../controllers/chat.controller.js';

const router = express.Router();

// Enforce JWT verification on all chat endpoints
router.use(verifyJWT);

// GET /conversations - Retrieve active conversation channels
router.get('/conversations', getConversations);

// GET /messages/:conversationId - Fetch chat history
router.get('/messages/:conversationId', getMessages);

// POST /messages - Send a new text message
router.post('/messages', sendMessage);

// Double-mapped read status to satisfy both requirements and frontend REST calls:
// 1. Backend requirement: PATCH /read/:conversationId
router.patch('/read/:conversationId', markRead);

// 2. Frontend client: POST /messages/:conversationId/read
router.post('/messages/:conversationId/read', markRead);

export default router;
