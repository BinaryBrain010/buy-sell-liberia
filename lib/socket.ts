"use client";

import { io, Socket } from 'socket.io-client';

import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../types/socket-io.types';

// Connect to the socket server running on port 3001
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
