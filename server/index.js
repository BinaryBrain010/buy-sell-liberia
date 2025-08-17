const http = require("http");
const { createServer } = http;
const { Server } = require("socket.io");

const hostname = "localhost";
const port = 3001;

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// In-memory presence tracking
// Map userId -> Set of socketIds
const userSockets = new Map();
// Map socketId -> userId
const socketUser = new Map();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Presence: client announces online with its userId
  socket.on("user:online", ({ userId }) => {
    if (!userId) return;
    socketUser.set(socket.id, userId);
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    const set = userSockets.get(userId);
    set.add(socket.id);

    // Notify all clients this user is online
    io.emit("presence:update", { userId, status: "online" });
  });

  // Client can request current presence list
  socket.on("presence:subscribe", () => {
    const online = Array.from(userSockets.entries())
      .filter(([, sockets]) => sockets && sockets.size > 0)
      .map(([uid]) => uid);
    socket.emit("presence:list", { online });
  });

  // Basic message broadcast (demo/test).
  socket.on("message", (message) => {
    console.log("Received message:", message);
    // Broadcast the message to all connected clients
    io.emit("message", message);
  });

  socket.on("disconnect", () => {
    const userId = socketUser.get(socket.id);
    if (userId) {
      const set = userSockets.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) {
          userSockets.delete(userId);
          // Notify all clients this user went offline
          io.emit("presence:update", { userId, status: "offline" });
        }
      }
      socketUser.delete(socket.id);
    }
    console.log("Client disconnected:", socket.id);
  });
});

httpServer
  .once("error", (err) => {
    console.error(err);
    process.exit(1);
  })
  .listen(port, () => {
    console.log(`Socket.io server running on http://${hostname}:${port}`);
  });
