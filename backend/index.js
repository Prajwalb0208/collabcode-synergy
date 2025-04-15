
// Backend server for CollabCode
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
}));

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join a room
  socket.on('join-room', (data) => {
    const { roomId, userId, userName, userAvatar } = data;
    
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);
    
    // Notify others in the room about the new user
    socket.to(roomId).emit('user-joined', { userId, userName, userAvatar });
    
    // Send current state to the new user
    // In a real app, you'd fetch state from a database
  });
  
  // Handle various events
  socket.on('user-joined', (data) => {
    socket.to(data.roomId).emit('user-joined', data);
  });
  
  socket.on('user-left', (data) => {
    socket.to(data.roomId).emit('user-left', data);
  });
  
  socket.on('file-update', (data) => {
    socket.to(data.roomId).emit('file-update', data);
  });
  
  socket.on('file-selected', (data) => {
    socket.to(data.roomId).emit('file-selected', data);
  });
  
  socket.on('folder-update', (data) => {
    socket.to(data.roomId).emit('folder-update', data);
  });
  
  socket.on('cursor-move', (data) => {
    socket.to(data.roomId).emit('cursor-move', data);
  });
  
  socket.on('code-change', (data) => {
    socket.to(data.roomId).emit('code-change', data);
  });
  
  socket.on('access-request', (data) => {
    socket.to(data.roomId).emit('access-request', data);
  });
  
  socket.on('access-response', (data) => {
    // Broadcast to specific user using a room with their ID
    io.to(data.userId).emit('access-response', data);
  });
  
  socket.on('session-update', (data) => {
    socket.to(data.roomId).emit('session-update', data);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // In a real app, notify rooms the user was in
  });
});

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
