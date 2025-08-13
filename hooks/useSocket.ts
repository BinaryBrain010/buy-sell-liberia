import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export interface SocketOptions {
  token: string;
  onConnect?: (data: any) => void;
  onError?: (err: any) => void;
}

export function useSocket({ token, onConnect, onError }: SocketOptions) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;
    if (!socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
        path: "/api/socket",
        auth: { token },
        transports: ["websocket"],
        withCredentials: true,
      });

      socketRef.current.on("connected", (data) => {
        onConnect && onConnect(data);
      });
      socketRef.current.on("error", (err) => {
        onError && onError(err);
      });
    }
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [token, onConnect, onError]);

  // Helper to emit events
  const emit = useCallback((event: string, data?: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  // Helper to listen to events
  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  }, []);

  return { socket: socketRef.current, emit, on };
}

// Utility to generate roomId (must match backend logic)
export function generateRoomId(productId: string, user1: string, user2: string) {
  const ids = [user1, user2].sort();
  return `${productId}_${ids[0]}_${ids[1]}`;
}
