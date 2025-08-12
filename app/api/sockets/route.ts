import { NextApiRequest, NextApiResponse } from 'next';
import { Server as IOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import mongoose from 'mongoose';
import ChatMessage from './chat.model';
import { Product } from '../modules/products/models/product.model';
import { User } from '../modules/auth/models/user.model';
import { verifyToken } from '../modules/auth/utils/jwt';
import { setupSocketHandlers } from './socketHandlers';

export const config = {
  api: {
    bodyParser: false,
  },
};

let io: IOServer | undefined;

interface SocketData {
  roomId: string;
  sender: string;
  receiver: string;
  product: string;
  message: string;
}

interface UserPayload {
  userId: string;
}

// Connect to MongoDB once
async function connectToMongoDB() {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/buysell');
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
}

// Generate unique room ID
function generateRoomId(productId: string, user1: string, user2: string): string {
  const ids = [user1, user2].sort();
  return `${productId}_${ids[0]}_${ids[1]}`;
}

// Validate user access to chat
async function canAccessChat(userId: string, productId: string, receiverId: string): Promise<boolean> {
  try {
    const product = await Product.findById(productId);
    if (!product || !product.isListed) return false;
    return product.owner.toString() === userId || receiverId === userId;
  } catch (error) {
    console.error('Error checking chat access:', error);
    return false;
  }
}

// Fetch previous messages
async function fetchPreviousMessages(roomId: string) {
  try {
    return await ChatMessage.find({ roomId })
      .populate('sender', 'username')
      .populate('receiver', 'username')
      .sort({ createdAt: 1 })
      .lean();
  } catch (error) {
    console.error('Error fetching previous messages:', error);
    return [];
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS for initial HTTP request
  res.setHeader('Access-Control-Allow-Origin', process.env.SOCKET_CLIENT_ORIGIN || 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Type guard for Next.js custom server
    const anyRes = res as any;
    
    if (!anyRes.socket?.server?.io) {
      console.log('Initializing Socket.IO server...');
      
      const httpServer: HTTPServer = anyRes.socket.server as HTTPServer;
      
      io = new IOServer(httpServer, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
          origin: process.env.SOCKET_CLIENT_ORIGIN || 'http://localhost:3000',
          methods: ['GET', 'POST'],
          credentials: true,
        },
        transports: ['websocket', 'polling'],
        allowEIO3: true,
      });

      anyRes.socket.server.io = io;

      // Connect to MongoDB
      await connectToMongoDB();

      // Authentication middleware
      io.use(async (socket, next) => {
        try {
          const token = socket.handshake.auth.token || socket.handshake.query.token;
          
          if (!token) {
            console.log('No token provided');
            return next(new Error('Authentication required'));
          }

          const payload = await verifyToken(token as string) as UserPayload;
          socket.data.userId = payload.userId;
          
          console.log('User authenticated:', payload.userId);
          next();
        } catch (err) {
          console.error('Authentication error:', err);
          next(new Error('Invalid token'));
        }
      });

      // Connection handler
      io.on('connection', (socket) => {
        console.log('A user connected:', socket.id, 'User ID:', socket.data.userId);
        
        if (!io) {
          console.error('IO server not available');
          return;
        }
        
        setupSocketHandlers(io, socket);
        
        // Send connection confirmation
        socket.emit('connected', { 
          message: 'Connected successfully',
          socketId: socket.id,
          userId: socket.data.userId 
        });
      });

      // Error handling
      io.on('error', (error) => {
        console.error('Socket.IO server error:', error);
      });

      console.log('Socket.IO server initialized successfully');
    }

    res.status(200).json({ message: 'Socket.IO server is running' });
  } catch (error) {
    console.error('Error initializing Socket.IO:', error);
    res.status(500).json({ error: 'Failed to initialize Socket.IO server' });
  }
}

// Export functions for use in socketHandlers
export { generateRoomId, canAccessChat, fetchPreviousMessages };