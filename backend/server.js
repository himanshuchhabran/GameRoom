require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const roomHandler = require('./socket/roomHandler');

const app = express();
const server = http.createServer(app);

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Allow React Frontend
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    roomHandler(io, socket);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));