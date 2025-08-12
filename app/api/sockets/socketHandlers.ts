import { Server as IOServer, Socket } from 'socket.io';
import mongoose from 'mongoose';
import ChatMessage from './chat.model';
import { Product } from '../modules/products/models/product.model';
import { User } from '../modules/auth/models/user.model';

interface SocketData {
  roomId: string;
  sender: string;
  receiver: string;
  product: string;
  message: string;
}

interface JoinRoomData {
  roomId: string;
  productId: string;
  receiverId?: string;
}

interface MarkAsReadData {
  roomId: string;
  messageIds: string[];
}

interface TypingData {
  roomId: string;
  isTyping: boolean;
}

interface LeaveRoomData {
  roomId: string;
}

// Define user interface with proper typing
interface IUser {
  _id: mongoose.Types.ObjectId;
  chatRooms?: string[];
  recentContacts?: mongoose.Types.ObjectId[];
  [key: string]: any;
}

// Validate user access to chat
async function canAccessChat(userId: string, productId: string, receiverId: string): Promise<boolean> {
  try {
    const product = await Product.findById(productId);
    if (!product || !product.isListed) {
      console.log('Product not found or not listed');
      return false;
    }
    
    const hasAccess = product.owner.toString() === userId || receiverId === userId;
    console.log('Access check:', { userId, productOwnerId: product.owner.toString(), receiverId, hasAccess });
    return hasAccess;
  } catch (error) {
    console.error('Error checking chat access:', error);
    return false;
  }
}

// Fetch previous messages for a room
async function fetchPreviousMessages(roomId: string) {
  try {
    const messages = await ChatMessage.find({ roomId })
      .populate('sender', 'username')
      .populate('receiver', 'username')
      .sort({ createdAt: 1 })
      .lean();
    
    console.log(`Fetched ${messages.length} previous messages for room ${roomId}`);
    return messages;
  } catch (error) {
    console.error('Error fetching previous messages:', error);
    return [];
  }
}

// Generate unique room ID
function generateRoomId(productId: string, user1: string, user2: string): string {
  const ids = [user1, user2].sort();
  return `${productId}_${ids[0]}_${ids[1]}`;
}

// Validate MongoDB ObjectId format
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export function setupSocketHandlers(io: IOServer, socket: Socket) {
  
  // Join room handler
  socket.on('joinRoom', async (data: JoinRoomData) => {
    try {
      console.log('Join room request:', data);
      
      const { roomId, productId, receiverId } = data;
      
      if (!roomId || !productId) {
        socket.emit('error', { message: 'Missing roomId or productId' });
        return;
      }

      // Validate ObjectId format
      if (!isValidObjectId(productId)) {
        socket.emit('error', { message: 'Invalid productId format' });
        return;
      }

      // Fetch product and user
      const [product, user] = await Promise.all([
        Product.findById(productId),
        User.findById(socket.data.userId),
      ]);

      if (!product || !user) {
        socket.emit('error', { message: 'Invalid product or user' });
        return;
      }

      // Determine receiver ID if not provided
      const actualReceiverId = receiverId || (
        product.owner.toString() === socket.data.userId 
          ? null // Product owner needs to specify receiver
          : product.owner.toString()
      );

      if (!actualReceiverId) {
        socket.emit('error', { message: 'Receiver ID required' });
        return;
      }

      // Validate receiver ObjectId format
      if (!isValidObjectId(actualReceiverId)) {
        socket.emit('error', { message: 'Invalid receiverId format' });
        return;
      }

      // Check authorization
      const isAuthorized = await canAccessChat(socket.data.userId, productId, actualReceiverId);
      if (!isAuthorized) {
        socket.emit('error', { message: 'Unauthorized access to chat' });
        return;
      }

      // Join the room
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);

      // Fetch and send previous messages
      const messages = await fetchPreviousMessages(roomId);
      socket.emit('previousMessages', messages);
      
      // Confirm room join
      socket.emit('roomJoined', { 
        roomId, 
        productId, 
        receiverId: actualReceiverId,
        productTitle: product.title 
      });
      
    } catch (err) {
      console.error('Error joining room:', err);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Send message handler
  socket.on('sendMessage', async (data: SocketData) => {
    try {
      console.log('Send message request:', data);
      
      const { roomId, sender, receiver, product, message } = data;
      
      // Validate required fields
      if (!roomId || !sender || !receiver || !product || !message) {
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }

      // Verify sender is the authenticated user
      if (sender !== socket.data.userId) {
        socket.emit('error', { message: 'Unauthorized sender' });
        return;
      }

      // Validate MongoDB ObjectIds
      if (!isValidObjectId(sender) || !isValidObjectId(receiver) || !isValidObjectId(product)) {
        socket.emit('error', { message: 'Invalid ID format' });
        return;
      }

      // Validate message length
      if (message.trim().length === 0) {
        socket.emit('error', { message: 'Message cannot be empty' });
        return;
      }

      if (message.length > 1000) {
        socket.emit('error', { message: 'Message too long (max 1000 characters)' });
        return;
      }

      // Check authorization
      const isAuthorized = await canAccessChat(sender, product, receiver);
      if (!isAuthorized) {
        socket.emit('error', { message: 'Unauthorized access to chat' });
        return;
      }

      // Create chat message
      const chatMsg = await ChatMessage.create({
        roomId,
        sender: new mongoose.Types.ObjectId(sender),
        receiver: new mongoose.Types.ObjectId(receiver),
        product: new mongoose.Types.ObjectId(product),
        message: message.trim(),
        read: false,
      });

      // Update user chat rooms and recent contacts
      await Promise.all([
        User.updateOne(
          { _id: sender },
          { $addToSet: { chatRooms: roomId, recentContacts: receiver } }
        ),
        User.updateOne(
          { _id: receiver },
          { $addToSet: { chatRooms: roomId, recentContacts: sender } }
        ),
      ]);

      // Get populated message
      const populatedMsg = await ChatMessage.findById(chatMsg._id)
        .populate('sender', 'username')
        .populate('receiver', 'username')
        .lean();

      if (!populatedMsg) {
        socket.emit('error', { message: 'Failed to retrieve sent message' });
        return;
      }

      // Use type assertion to avoid TS error
      const msgObj = populatedMsg as { _id: string };
      console.log('Message sent successfully:', msgObj._id);
      // Emit to all users in the room
      io.to(roomId).emit('receiveMessage', populatedMsg);
      // Send confirmation to sender
      socket.emit('messageSent', { messageId: msgObj._id });
      
    } catch (err) {
      console.error('Error saving chat message:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Mark messages as read
  socket.on('markAsRead', async (data: MarkAsReadData) => {
    try {
      console.log('Mark as read request:', data);
      
      const { roomId, messageIds } = data;
      
      if (!roomId || !messageIds || messageIds.length === 0) {
        socket.emit('error', { message: 'Missing roomId or messageIds' });
        return;
      }

      // Validate ObjectIds
      const validMessageIds = messageIds.filter(id => isValidObjectId(id));
      if (validMessageIds.length === 0) {
        socket.emit('error', { message: 'No valid message IDs provided' });
        return;
      }

      const result = await ChatMessage.updateMany(
        { 
          _id: { $in: validMessageIds },
          receiver: socket.data.userId,
          roomId 
        },
        { read: true }
      );
      
      console.log(`Marked ${result.modifiedCount} messages as read`);
      
      // Notify other users in the room
      socket.to(roomId).emit('messagesRead', { 
        messageIds: validMessageIds, 
        readBy: socket.data.userId 
      });
      
      socket.emit('messagesMarkedAsRead', { 
        count: result.modifiedCount,
        messageIds: validMessageIds 
      });
      
    } catch (error) {
      console.error('Error marking messages as read:', error);
      socket.emit('error', { message: 'Failed to mark messages as read' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data: TypingData) => {
    try {
      const { roomId, isTyping } = data;
      
      if (!roomId) {
        socket.emit('error', { message: 'Missing roomId for typing indicator' });
        return;
      }

      console.log(`User ${socket.data.userId} typing in room ${roomId}: ${isTyping}`);
      
      socket.to(roomId).emit('userTyping', {
        userId: socket.data.userId,
        isTyping
      });
    } catch (error) {
      console.error('Error handling typing indicator:', error);
    }
  });

  // Leave room handler
  socket.on('leaveRoom', (data: LeaveRoomData) => {
    try {
      const { roomId } = data;
      
      if (!roomId) {
        socket.emit('error', { message: 'Missing roomId' });
        return;
      }

      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room ${roomId}`);
      
      // Notify others in the room that user left
      socket.to(roomId).emit('userLeftRoom', { userId: socket.data.userId });
      
      socket.emit('roomLeft', { roomId });
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  });

  // Get user's chat rooms
  socket.on('getChatRooms', async () => {
    try {
      const user = await User.findById(socket.data.userId)
        .populate('recentContacts', 'username')
        .lean() as IUser | null;
      
      if (!user) {
        socket.emit('error', { message: 'User not found' });
        return;
      }

      // Get recent messages for each chat room
      const chatRoomsData = await Promise.all(
        (user.chatRooms || []).map(async (roomId: string) => {
          const lastMessage = await ChatMessage.findOne({ roomId })
            .sort({ createdAt: -1 })
            .populate('sender', 'username')
            .populate('receiver', 'username')
            .lean();
          
          const unreadCount = await ChatMessage.countDocuments({
            roomId,
            receiver: socket.data.userId,
            read: false
          });

          return {
            roomId,
            lastMessage,
            unreadCount
          };
        })
      );

      socket.emit('chatRooms', {
        chatRooms: chatRoomsData,
        recentContacts: user.recentContacts
      });

    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      socket.emit('error', { message: 'Failed to fetch chat rooms' });
    }
  });

  // Disconnect handler
  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, 'User ID:', socket.data.userId, 'Reason:', reason);
    
    // Leave all rooms
    socket.rooms.forEach(roomId => {
      if (roomId !== socket.id) {
        socket.to(roomId).emit('userDisconnected', { userId: socket.data.userId });
      }
    });
  });

  // Error handler
  socket.on('error', (error) => {
    console.error('Socket error for', socket.id, ':', error);
  });
}