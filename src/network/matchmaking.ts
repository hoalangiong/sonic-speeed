import { getSocket, connectSocket } from './socket';
import { GAME } from '../constants';

export interface RoomInfo {
  id: string;
  players: Array<{ id: string; name: string; ready: boolean }>;
  maxPlayers: number;
  state: 'waiting' | 'countdown' | 'racing' | 'finished';
}

/**
 * Matchmaking: join or create a game room.
 */
export async function joinRoom(playerName: string): Promise<RoomInfo> {
  await connectSocket();
  const socket = getSocket();

  return new Promise((resolve, reject) => {
    socket.emit('join-room', { name: playerName, maxPlayers: GAME.MAX_PLAYERS });

    socket.once('room-joined', (room: RoomInfo) => {
      resolve(room);
    });

    socket.once('join-error', (error: string) => {
      reject(new Error(error));
    });
  });
}

export function setReady() {
  const socket = getSocket();
  socket.emit('player-ready');
}

export function leaveRoom() {
  const socket = getSocket();
  socket.emit('leave-room');
}

export function onRoomUpdate(callback: (room: RoomInfo) => void) {
  const socket = getSocket();
  socket.on('room-update', callback);
  return () => { socket.off('room-update', callback); };
}
