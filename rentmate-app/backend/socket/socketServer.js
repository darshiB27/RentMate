// Socket.io Server Setup
// Purpose: Handles real-time messaging connections, joins conversation rooms, broadcasts typing status, and persists socket-sent messages to MongoDB.
import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/tokenUtils.js';
import logger from '../config/logger.js';
import env from '../config/env.js';
import chatRepository from '../repositories/chat.repository.js';

let io = null;

export const initSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
  });

  // JWT Authentication Middleware for Socket.io Connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        logger.warn('Socket connection rejected: No authentication token provided.');
        return next(new Error('Authentication failed. Token is missing.'));
      }

      // Verify JWT
      const decoded = verifyAccessToken(token);
      
      // Attach user details to socket object
      socket.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      logger.error(`Socket authorization error: ${error.message}`);
      return next(new Error('Authentication failed. Invalid or expired token.'));
    }
  });

  // Handle Client Connections
  io.on('connection', (socket) => {
    const userId = socket.user.id;
    const email = socket.user.email;

    logger.info(`Socket client connected: User ID ${userId} (${email}), Socket ID: ${socket.id}`);

    // Join user-specific private room
    const userRoom = `user:${userId}`;
    socket.join(userRoom);
    logger.debug(`Socket ${socket.id} joined room: ${userRoom}`);

    // Inform other participants that this user is online
    socket.broadcast.emit('user_status', { userId, isOnline: true });

    // 1. Join Conversation Room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`convo:${conversationId}`);
      logger.debug(`Socket ${socket.id} joined room convo:${conversationId}`);
    });

    // 2. Leave Conversation Room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`convo:${conversationId}`);
      logger.debug(`Socket ${socket.id} left room convo:${conversationId}`);
    });

    // 3. Handle Send Message Events (from Socket fallbacks)
    const handleNewMessage = async (payload) => {
      const { conversationId, text, receiverId } = payload;
      if (!conversationId || !text || !receiverId) return;

      try {
        // Save message to database
        const newMsg = await chatRepository.createMessage({
          conversationId,
          sender: userId,
          receiver: receiverId,
          text,
          read: false,
        });

        // Update conversation summary reference
        await chatRepository.updateConversationLastMessage(conversationId, text);

        const formattedMsg = {
          _id: newMsg._id,
          conversationId: newMsg.conversationId,
          senderId: newMsg.sender,
          receiverId: newMsg.receiver,
          text: newMsg.text,
          createdAt: newMsg.createdAt,
          isRead: newMsg.read,
        };

        // Broadcast to conversation room members
        io.to(`convo:${conversationId}`).emit('receive_message', formattedMsg);
        io.to(`convo:${conversationId}`).emit('message:new', formattedMsg);

        // Direct private room emission backups
        emitToUser(receiverId, 'receive_message', formattedMsg);
        emitToUser(receiverId, 'message:new', formattedMsg);
      } catch (err) {
        logger.error(`Failed to save and broadcast socket message: ${err.message}`);
      }
    };
    socket.on('send_message', handleNewMessage);
    socket.on('message:new', handleNewMessage);

    // 4. Handle Typing Indicators
    const handleTyping = ({ conversationId, isTyping }) => {
      socket.to(`convo:${conversationId}`).emit('typing_status', {
        conversationId,
        userId,
        isTyping,
      });
      socket.to(`convo:${conversationId}`).emit('message:typing', {
        conversationId,
        userId,
        isTyping,
      });
    };
    socket.on('typing', handleTyping);
    socket.on('message:typing', handleTyping);

    // 5. Handle Read Status
    const handleRead = async ({ conversationId }) => {
      try {
        await chatRepository.markMessagesAsRead(conversationId, userId);
        socket.to(`convo:${conversationId}`).emit('message:read', {
          conversationId,
          userId,
        });
      } catch (err) {
        logger.error(`Failed to update read states over socket: ${err.message}`);
      }
    };
    socket.on('read_messages', handleRead);
    socket.on('message:read', handleRead);

    // Clean up on disconnect
    socket.on('disconnect', (reason) => {
      logger.info(`Socket client disconnected: Socket ID ${socket.id}, User ID: ${userId}. Reason: ${reason}`);
      socket.broadcast.emit('user_status', { userId, isOnline: false });
    });

    // Error handling
    socket.on('error', (err) => {
      logger.error(`Socket error for client ${socket.id} (User ID ${userId}): ${err.message}`);
    });
  });

  return io;
};

export const emitToUser = (userId, event, payload) => {
  if (!io) {
    logger.warn('Socket.io server has not been initialized. Event emission bypassed.');
    return false;
  }

  const userRoom = `user:${userId}`;
  logger.info(`Dispatching real-time event "${event}" to room "${userRoom}"`);
  io.to(userRoom).emit(event, payload);
  return true;
};

export default {
  initSocketServer,
  emitToUser,
};
