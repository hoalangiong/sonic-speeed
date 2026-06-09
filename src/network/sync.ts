import { getSocket } from './socket';

export interface PlayerState {
  id: string;
  position: { x: number; y: number; z: number };
  quaternion: { x: number; y: number; z: number; w: number };
  velocity: { x: number; y: number; z: number };
  speed: number;
  checkpoint: number;
  lap: number;
}

export interface SyncCallbacks {
  onPlayersUpdate: (players: Map<string, PlayerState>) => void;
  onRaceStart: () => void;
  onRaceEnd: (results: Array<{ id: string; time: number }>) => void;
  onCountdown: (seconds: number) => void;
}

/**
 * Network sync manager.
 * Sends local player state, receives & interpolates opponent states.
 */
export class NetworkSync {
  private sendInterval: ReturnType<typeof setInterval> | null = null;
  private players = new Map<string, PlayerState>();
  private localState: Partial<PlayerState> = {};
  private callbacks: SyncCallbacks;

  constructor(callbacks: SyncCallbacks) {
    this.callbacks = callbacks;
    this.setupListeners();
  }

  private setupListeners() {
    const socket = getSocket();

    socket.on('players-update', (states: PlayerState[]) => {
      for (const state of states) {
        if (state.id !== socket.id) {
          this.players.set(state.id, state);
        }
      }
      this.callbacks.onPlayersUpdate(this.players);
    });

    socket.on('race-countdown', (seconds: number) => {
      this.callbacks.onCountdown(seconds);
    });

    socket.on('race-start', () => {
      this.callbacks.onRaceStart();
    });

    socket.on('race-end', (results) => {
      this.callbacks.onRaceEnd(results);
    });
  }

  /** Start sending local state to server at fixed rate */
  startSending() {
    this.sendInterval = setInterval(() => {
      const socket = getSocket();
      if (socket.connected && this.localState.position) {
        socket.emit('player-update', this.localState);
      }
    }, 66); // ~15 FPS
  }

  /** Update local state (called from game loop) */
  updateLocal(state: Partial<PlayerState>) {
    this.localState = { ...this.localState, ...state };
  }

  /** Stop sending and clean up */
  stop() {
    if (this.sendInterval) {
      clearInterval(this.sendInterval);
      this.sendInterval = null;
    }
    const socket = getSocket();
    socket.off('players-update');
    socket.off('race-countdown');
    socket.off('race-start');
    socket.off('race-end');
  }
}
