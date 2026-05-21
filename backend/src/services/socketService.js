import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// In-memory mapping: boardId -> { userId -> { user: {...}, sockets: Set(socketIds) } }
const boardOnlineUsers = {};

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // JWT auth middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name email avatar');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error('Socket authentication error:', err.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    let activeBoardId = null;

    console.log(`User connected to Socket.io: ${user.name} (${socket.id})`);

    // Join board room
    socket.on('board:join', ({ boardId }) => {
      // Leave previous board room if any
      if (activeBoardId) {
        socket.leave(activeBoardId);
        removeUserFromBoard(activeBoardId, user._id.toString(), socket.id, io);
      }

      activeBoardId = boardId;
      socket.join(boardId);
      console.log(`User ${user.name} joined room: ${boardId}`);

      // Track online status
      addUserToBoard(boardId, user, socket.id, io);
    });

    // Leave board room
    socket.on('board:leave', () => {
      if (activeBoardId) {
        socket.leave(activeBoardId);
        removeUserFromBoard(activeBoardId, user._id.toString(), socket.id, io);
        activeBoardId = null;
      }
    });

    // Handle typing start
    socket.on('typing:start', ({ boardId, taskId }) => {
      socket.to(boardId).emit('typing:start', {
        userId: user._id,
        userName: user.name,
        taskId,
      });
    });

    // Handle typing stop
    socket.on('typing:stop', ({ boardId, taskId }) => {
      socket.to(boardId).emit('typing:stop', {
        userId: user._id,
        taskId,
      });
    });

    // Manual sync request (e.g. on client reconnect)
    socket.on('board:sync', ({ boardId }) => {
      socket.emit('board:sync', {
        onlineMembers: getOnlineMembers(boardId),
      });
    });

    // Disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected from Socket.io: ${user.name} (${socket.id})`);
      if (activeBoardId) {
        removeUserFromBoard(activeBoardId, user._id.toString(), socket.id, io);
      }
    });
  });

  return io;
};

// Helper: Track user join
const addUserToBoard = (boardId, user, socketId, io) => {
  if (!boardOnlineUsers[boardId]) {
    boardOnlineUsers[boardId] = {};
  }

  const userId = user._id.toString();
  if (!boardOnlineUsers[boardId][userId]) {
    boardOnlineUsers[boardId][userId] = {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      sockets: new Set(),
    };
  }

  boardOnlineUsers[boardId][userId].sockets.add(socketId);

  // Broadcast membership online update
  io.to(boardId).emit('member:online', {
    userId,
    user: boardOnlineUsers[boardId][userId].user,
    onlineMembers: getOnlineMembers(boardId),
  });
};

// Helper: Track user leave
const removeUserFromBoard = (boardId, userId, socketId, io) => {
  if (!boardOnlineUsers[boardId] || !boardOnlineUsers[boardId][userId]) return;

  boardOnlineUsers[boardId][userId].sockets.delete(socketId);

  if (boardOnlineUsers[boardId][userId].sockets.size === 0) {
    delete boardOnlineUsers[boardId][userId];

    // Broadcast user offline
    io.to(boardId).emit('member:offline', {
      userId,
      onlineMembers: getOnlineMembers(boardId),
    });
  }

  if (Object.keys(boardOnlineUsers[boardId]).length === 0) {
    delete boardOnlineUsers[boardId];
  }
};

// Helper: Get list of active online users in a board
const getOnlineMembers = (boardId) => {
  if (!boardOnlineUsers[boardId]) return [];
  return Object.values(boardOnlineUsers[boardId]).map((item) => item.user);
};
