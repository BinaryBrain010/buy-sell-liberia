interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  // message event may carry either a simple string or a full message object with chatId
  message: (data: {
    from: string;
    message: string | any;
    to: string;
    chatId?: string;
  }) => void;
  // Presence events from server
  "presence:update": (data: {
    userId: string;
    status: "online" | "offline";
  }) => void;
  "presence:list": (data: { online: string[] }) => void;
}

interface ClientToServerEvents {
  hello: () => void;
  message: (data: {
    from: string;
    message: string | any;
    to: string;
    chatId?: string;
  }) => void;
  // Presence events from client
  "user:online": (data: { userId: string }) => void;
  "presence:subscribe": () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

export type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
};
