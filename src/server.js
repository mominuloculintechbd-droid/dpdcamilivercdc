const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const jobManager = require('./services/queryJobManager');

const port = process.env.PORT || 3001;

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Configure job manager with Socket.IO
jobManager.setSocketIO(io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`WebSocket server is ready`);
});