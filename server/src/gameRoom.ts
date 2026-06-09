import { Room, PlayerState, RoomInfo } from './types';

const rooms = new Map<string, Room>();

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function findOrCreateRoom(maxPlayers: number): Room {
  // Find a room that's waiting and has space
  for (const room of rooms.values()) {
    if (room.state === 'waiting' && room.players.size < room.maxPlayers) {
      return room;
    }
  }

  // Create new room
  const room: Room = {
    id: generateId(),
    players: new Map(),
    maxPlayers,
    state: 'waiting',
    raceStartTime: null,
    laps: 3,
  };
  rooms.set(room.id, room);
  return room;
}

export function addPlayer(room: Room, id: string, name: string): PlayerState {
  const player: PlayerState = {
    id,
    name,
    position: { x: 0, y: 1.5, z: 0 },
    quaternion: { x: 0, y: 0, z: 0, w: 1 },
    velocity: { x: 0, y: 0, z: 0 },
    speed: 0,
    checkpoint: 0,
    lap: 0,
    ready: false,
    finishTime: null,
  };

  // Offset start position based on player count
  const index = room.players.size;
  player.position.x = (index % 2 === 0 ? -3 : 3);
  player.position.z = -index * 5;

  room.players.set(id, player);
  return player;
}

export function removePlayer(room: Room, id: string): boolean {
  room.players.delete(id);

  // Clean up empty rooms
  if (room.players.size === 0) {
    rooms.delete(room.id);
    return true; // room deleted
  }
  return false;
}

export function setPlayerReady(room: Room, id: string) {
  const player = room.players.get(id);
  if (player) {
    player.ready = true;
  }
}

export function allPlayersReady(room: Room): boolean {
  if (room.players.size < 2) return false; // Need at least 2 players
  for (const player of room.players.values()) {
    if (!player.ready) return false;
  }
  return true;
}

export function startCountdown(room: Room) {
  room.state = 'countdown';
}

export function startRace(room: Room) {
  room.state = 'racing';
  room.raceStartTime = Date.now();
}

export function updatePlayerState(room: Room, id: string, state: Partial<PlayerState>) {
  const player = room.players.get(id);
  if (player) {
    Object.assign(player, state);
  }
}

export function checkRaceComplete(room: Room): boolean {
  for (const player of room.players.values()) {
    if (player.lap >= room.laps && player.finishTime === null) {
      player.finishTime = Date.now() - (room.raceStartTime || 0);
    }
  }

  // Race ends when all players finish or after timeout (3 minutes)
  const allFinished = Array.from(room.players.values()).every(p => p.finishTime !== null);
  const timeout = room.raceStartTime && (Date.now() - room.raceStartTime) > 180000;

  if (allFinished || timeout) {
    room.state = 'finished';
    return true;
  }
  return false;
}

export function getRaceResults(room: Room): Array<{ id: string; time: number }> {
  return Array.from(room.players.values())
    .map(p => ({ id: p.id, time: p.finishTime || 999999 }))
    .sort((a, b) => a.time - b.time);
}

export function getRoomInfo(room: Room): RoomInfo {
  return {
    id: room.id,
    players: Array.from(room.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      ready: p.ready,
    })),
    maxPlayers: room.maxPlayers,
    state: room.state,
  };
}

export function getRoomByPlayerId(playerId: string): Room | undefined {
  for (const room of rooms.values()) {
    if (room.players.has(playerId)) {
      return room;
    }
  }
  return undefined;
}
