// Custom Socket.io Client hook
// Purpose: Establishes a shared authenticated Socket.io client connection synchronized with user authentication status.
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

let socket = null;

export default function useSocket() {
  const { token, user } = useSelector((state) => state.auth);
  const [isConnected, setIsConnected] = useState(socket?.connected || false);

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        socket = null;
        setIsConnected(false);
      }
      return;
    }

    if (!socket) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      socket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
      });

      socket.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected successfully');
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });
    } else {
      setIsConnected(socket.connected);

      // In case token refreshed, sync socket authorization headers
      if (socket.auth?.token !== token) {
        socket.auth = { token };
        socket.disconnect().connect();
      }
    }

    return () => {
      // Maintain connection globally to preserve callbacks across page changes
    };
  }, [token, user]);

  return { socket, isConnected };
}
