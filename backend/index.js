const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.get('/', (req, res) => {
  res.json({ message: 'Test' });
});

io.on('connection', (socket) => {
  console.log('A user connected ' + socket.handshake.query.username);
  socket.broadcast.emit('user-connected', {
    username: socket.handshake.query.username,
  });

  socket.on('offer', ({ offer, username }) => {
    socket.broadcast.emit('offer', { offer, username });
  });

  socket.on('answer', ({ answer, username }) => {
    socket.broadcast.emit('answer', { answer, username });
  });

  socket.on('ice-candidate', ({ iceCandidate, username }) => {
    socket.broadcast.emit('ice-candidate', { iceCandidate, username });
  });
});

server.listen(3000, () => console.log('Server running on PORT 3000'));
