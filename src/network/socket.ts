import { io, Socket } from 'socket.io-client';
import { NETWORK } from '../constants';

let socket: Socket | null = null;

/**
 * Socket.io client singleton.
 * Manages connection to game server.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(NETWORK.SERVER_URL, {
      transports: ['websocket'],
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = getSocket();
    if (s.connected) {
      resolve();
      return;
    }

    s.connect();
    s.once('connect', () => resolve());
    s.once('connect_error', (err) => reject(err));
  });
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
