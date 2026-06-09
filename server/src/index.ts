import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import {
  findOrCreateRoom,
  addPlayer,
  removePlayer,
  setPlayerReady,
  allPlayersReady,
  startCountdown,
  startRace,
  updatePlayerState,
  checkRaceComplete,
  getRaceResults,
  getRoomInfo,
  getRoomByPlayerId,
} from './gameRoom';
import { Room } from './types';

const PORT = 3001;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: '*' },
  transports: ['websocket'],
});

console.log(`🏎️  Sonic Speeed Server starting on port ${PORT}...`);

// Broadcast room updates at fixed rate
const BROADCAST_INTERVAL = 66; // ~15 FPS

io.on('connection', (socket: Socket) => {
  console.log(`Player connected: ${socket.id}`);
  let currentRoom: Room | null = null;

  // Join a room
  socket.on('join-room', ({ name, maxPlayers }: { name: string; maxPlayers: number }) => {
    const room = findOrCreateRoom(maxPlayers || 4);
    addPlayer(room, socket.id, name || 'Player');
    currentRoom = room;

    socket.join(room.id);
    socket.emit('room-joined', getRoomInfo(room));
    io.to(room.id).emit('room-update', getRoomInfo(room));

    console.log(`${name} joined room ${room.id} (${room.players.size}/${room.maxPlayers})`);
  });

  // Player ready
  socket.on('player-ready', () => {
    if (!currentRoom) return;

    setPlayerReady(currentRoom, socket.id);
    io.to(currentRoom.id).emit('room-update', getRoomInfo(currentRoom));

    // Check if all ready → start countdown
    if (allPlayersReady(currentRoom)) {
      startCountdown(currentRoom);
      io.to(currentRoom.id).emit('room-update', getRoomInfo(currentRoom));

      // Countdown: 3, 2, 1, GO!
      let count = 3;
      const countdownInterval = setInterval(() => {
        if (!currentRoom) {
          clearInterval(countdownInterval);
          return;
        }

        io.to(currentRoom.id).emit('race-countdown', count);
        count--;

        if (count < 0) {
          clearInterval(countdownInterval);
          startRace(currentRoom);
          io.to(currentRoom.id).emit('race-start');
          console.log(`Race started in room ${currentRoom.id}`);
        }
      }, 1000);
    }
  });

  // Player position update
  socket.on('player-update', (state) => {
    if (!currentRoom || currentRoom.state !== 'racing') return;

    updatePlayerState(currentRoom, socket.id, state);

    // Check if race is complete
    if (checkRaceComplete(currentRoom)) {
      const results = getRaceResults(currentRoom);
      io.to(currentRoom.id).emit('race-end', results);
      console.log(`Race ended in room ${currentRoom.id}`);
    }
  });

  // Leave room
  socket.on('leave-room', () => {
    if (!currentRoom) return;
    handleLeave(socket, currentRoom);
    currentRoom = null;
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    if (currentRoom) {
      handleLeave(socket, currentRoom);
      currentRoom = null;
    }
  });
});

function handleLeave(socket: Socket, room: Room) {
  const deleted = removePlayer(room, socket.id);
  socket.leave(room.id);
  if (!deleted) {
    io.to(room.id).emit('room-update', getRoomInfo(room));
  }
}

// Broadcast player states to all rooms at fixed rate
setInterval(() => {
  for (const [roomId, sockets] of io.sockets.adapter.rooms) {
    // Skip socket-id rooms (each socket has its own "room")
    if (sockets.size <= 1) continue;

    // Find room for this roomId
    const firstSocketId = sockets.values().next().value;
    if (!firstSocketId) continue;
    const room = getRoomByPlayerId(firstSocketId);
    if (!room || room.state !== 'racing') continue;

    // Broadcast all player states
    const states = Array.from(room.players.values()).map(p => ({
      id: p.id,
      position: p.position,
      quaternion: p.quaternion,
      velocity: p.velocity,
      speed: p.speed,
      checkpoint: p.checkpoint,
      lap: p.lap,
    }));

    io.to(room.id).emit('players-update', states);
  }
}, BROADCAST_INTERVAL);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
