import { NextApiRequest } from 'next';
import { Server as IOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import mongoose from 'mongoose';
import ChatMessage from '../modules/chat.model';
import { User } from '../modules/auth/models/user.model';

// This disables the default body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

let io: IOServer | undefined;

export default function handler(req: any, res: any) {
  if (!res.socket.server.io) {
    const httpServer: HTTPServer = res.socket.server;
    io = new IOServer(httpServer, {
      path: '/api/sockets',
      cors: {
        origin: process.env.SOCKET_CLIENT_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      if (!io) return;
      console.log('A user connected:', socket.id);

      // Join a chat room
      socket.on('joinRoom', async ({ roomId }) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
      });

      // Handle sending a message
      socket.on('sendMessage', async (data) => {
        if (!io) return;
        const { roomId, sender, receiver, product, message } = data;
        // Save message to DB
        try {
          await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/buysell');
          const chatMsg = await ChatMessage.create({
            roomId,
            sender,
            receiver,
            product,
            message,
            read: false,
          });

          // Update chatRooms and recentContacts for both users
          await Promise.all([
            User.updateOne(
              { _id: sender },
              {
                $addToSet: { chatRooms: roomId, recentContacts: receiver },
              }
            ),
            User.updateOne(
              { _id: receiver },
              {
                $addToSet: { chatRooms: roomId, recentContacts: sender },
              }
            ),
          ]);

          // Emit to all in the room
          io.to(roomId).emit('receiveMessage', chatMsg);
        } catch (err) {
          console.error('Error saving chat message:', err);
        }
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
    console.log('Socket.IO server started');
  }
  res.end();
}
