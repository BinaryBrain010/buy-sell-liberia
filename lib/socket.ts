"use client";

import { io, Socket } from 'socket.io-client';

import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../types/socket-io.types';

// Connect to the socket server running on port 3001
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  process.env.NEXT_PUBLIC_SOCKET_URL || 'https://chats.buysellliberia.com',
  {
    transports: ['polling', 'websocket'],
    timeout: 20000,
    forceNew: true,
  }
);

// Add connection event listeners for debugging
socket.on('connect', () => {
  console.log('🔌 Socket.IO connected:', socket.id);
});

socket.on('disconnect', (reason: string) => {
  console.log('🔌 Socket.IO disconnected:', reason);
});

socket.on('connect_error', (error: Error) => {
  console.error('🔌 Socket.IO connection error:', error);
});

// Use any type for reconnect events since they're not in the typed interface
(socket as any).on('reconnect', (attemptNumber: number) => {
  console.log('🔌 Socket.IO reconnected after', attemptNumber, 'attempts');
});

(socket as any).on('reconnect_attempt', (attemptNumber: number) => {
  console.log('🔌 Socket.IO reconnection attempt:', attemptNumber);
});

(socket as any).on('reconnect_error', (error: Error) => {
  console.error('🔌 Socket.IO reconnection error:', error);
});

(socket as any).on('reconnect_failed', () => {
  console.error('🔌 Socket.IO reconnection failed');
});
