const http = require("http");
const { createServer } = http;
const { Server } = require("socket.io");

const hostname = "localhost";
const port = 3001;

// Express app will be used as the request handler for the HTTP server
const express = require("express");
const app = express();

// Add CORS headers for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json()); // For JSON body parsing

// Create HTTP server with the express app as handler
const httpServer = createServer(app);

// Attach Socket.IO to the HTTP server (no CORS restrictions)
const io = new Server(httpServer, {
  allowEIO3: true
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

  // Optionally, allow clients to broadcast (for demo/testing only, not for production)
  socket.on("announcement:broadcast", (announcement) => {
    // In production, authenticate/authorize here!
    io.emit("announcement:new", announcement);
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

// Swagger UI setup
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BuySell Liberia API",
      version: "1.0.0",
      description: "API documentation for BuySell Liberia (Admin & Main Site)",
    },
    servers: [
      { url: "http://localhost:3001", description: "Socket/Express server" },
      { url: "http://localhost:3000", description: "Next.js frontend" },
      { url: "http://localhost:5173", description: "Vite dev server" },
    ],
  },
  apis: ["./app/api/**/*.ts", "./server/index.js"], // Adjust as needed
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Add this route to handle announcement broadcasts
app.post("/broadcast-announcement", (req, res) => {
  const announcement = req.body;
  io.emit("announcement:new", announcement);
  res.json({ success: true });
});

// Server status endpoint
app.get("/request", (req, res) => {
  const status = {
    server: "online",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: port,
    hostname: hostname,
    socketConnections: io.engine.clientsCount,
    onlineUsers: userSockets.size,
    memoryUsage: process.memoryUsage(),
    nodeVersion: process.version,
    platform: process.platform,
    pid: process.pid
  };
  
  res.json({
    success: true,
    status: status
  });
});

// Export a helper to emit announcements from other modules
function emitAnnouncement(announcement) {
  io.emit("announcement:new", announcement);
}
module.exports.emitAnnouncement = emitAnnouncement;

httpServer
  .once("error", (err) => {
    console.error(err);
    process.exit(1);
  })
  .listen(port, () => {
    console.log(`Socket.io server running on http://${hostname}:${port}`);
  });
