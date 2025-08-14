const http = require("http");
const { createServer } = http;
const { Server } = require("socket.io");

const hostname = "localhost";
const port = 3001;

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  
  socket.on("message", (message) => {
    console.log("Received message:", message);
    // Broadcast the message to all connected clients
    io.emit("message", message);
  });

  socket.on("disconnect", () => {
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
