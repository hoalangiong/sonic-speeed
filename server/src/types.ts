export interface PlayerState {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  quaternion: { x: number; y: number; z: number; w: number };
  velocity: { x: number; y: number; z: number };
  speed: number;
  checkpoint: number;
  lap: number;
  ready: boolean;
  finishTime: number | null;
}

export interface Room {
  id: string;
  players: Map<string, PlayerState>;
  maxPlayers: number;
  state: 'waiting' | 'countdown' | 'racing' | 'finished';
  raceStartTime: number | null;
  laps: number;
}

export interface RoomInfo {
  id: string;
  players: Array<{ id: string; name: string; ready: boolean }>;
  maxPlayers: number;
  state: Room['state'];
}
