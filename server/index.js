// server.js
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('createRoom', ({ roomId, playerName }) => {
    console.log(`Attempting to create room: ${roomId} for player: ${playerName}`);
    if (rooms.has(roomId)) {
      console.log(`Room ${roomId} already exists`);
      socket.emit('createRoomError', 'Room already exists');
    } else {
      rooms.set(roomId, {
        players: [{ id: socket.id, name: playerName, score: 0, choice: null }],
        round: 1,
        gameHistory: []
      });
      socket.join(roomId);
      console.log(`Room ${roomId} created successfully`);
      socket.emit('roomCreated', roomId);
    }
  });

  socket.on('joinRoom', ({ roomId, playerName }) => {
    console.log(`Attempting to join room: ${roomId} for player: ${playerName}`);
    const room = rooms.get(roomId);
    if (room && room.players.length < 2) {
      room.players.push({ id: socket.id, name: playerName, score: 0, choice: null });
      socket.join(roomId);
      console.log(`Player ${playerName} joined room ${roomId} successfully`);
      io.to(roomId).emit('gameStart', room);
    } else {
      console.log(`Failed to join room ${roomId}: Room not found or full`);
      socket.emit('joinError', 'Room not found or full');
    }
  });

  socket.on('makeChoice', ({ roomId, choice }) => {
    console.log(`Player ${socket.id} made choice ${choice} in room ${roomId}`);
    const room = rooms.get(roomId);
    if (room) {
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        player.choice = choice;
        if (room.players.every(p => p.choice !== null)) {
          calculateScores(room);
          console.log(`Round ended in room ${roomId}`);
          io.to(roomId).emit('roundEnd', room);
        }
      }
    }
  });

  socket.on('nextRound', (roomId) => {
    console.log(`Starting next round in room ${roomId}`);
    const room = rooms.get(roomId);
    if (room) {
      room.round++;
      room.players.forEach(p => p.choice = null);
      io.to(roomId).emit('newRound', room);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const [roomId, room] of rooms.entries()) {
      const index = room.players.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        room.players.splice(index, 1);
        if (room.players.length === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted as all players left`);
        } else {
          console.log(`Player left room ${roomId}, notifying other player`);
          io.to(roomId).emit('playerLeft', room);
        }
        break;
      }
    }
  });
});

function calculateScores(room) {
  const [player1, player2] = room.players;
  const scores = calculateScore(player1.choice, player2.choice);
  player1.score += scores[0];
  player2.score += scores[1];
  room.gameHistory.push({ [player1.id]: player1.choice, [player2.id]: player2.choice });
}

function calculateScore(choice1, choice2) {
  if (choice1 === 'cooperate' && choice2 === 'cooperate') return [3, 3];
  if (choice1 === 'cooperate' && choice2 === 'steal') return [0, 5];
  if (choice1 === 'steal' && choice2 === 'cooperate') return [5, 0];
  return [1, 1];
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});