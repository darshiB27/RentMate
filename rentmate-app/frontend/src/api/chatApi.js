// Chat API integration
// Purpose: Handles chat conversations lookup, previous messages logs, and read markers updates.
import apiClient from '../config/axios.js';

export const getConversations = () => apiClient.get('/chat/conversations');
export const getMessages = (conversationId) => apiClient.get(`/chat/messages/${conversationId}`);
export const markRead = (conversationId) => apiClient.post(`/chat/messages/${conversationId}/read`);
export const sendMessage = (conversationId, text) => apiClient.post('/chat/messages', { conversationId, text });

