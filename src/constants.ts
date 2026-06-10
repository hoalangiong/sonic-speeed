// Game configuration constants

export const GAME = {
  MAX_PLAYERS: 4,
  LAPS: 3,
  COUNTDOWN_SECONDS: 3,
} as const;

export const PHYSICS = {
  GRAVITY: -9.82,
  TIMESTEP: 1 / 60,
  MAX_SUBSTEPS: 3,
  // Vehicle
  CHASSIS_MASS: 1500,
  MAX_ENGINE_FORCE: 5000,
  MAX_BRAKE_FORCE: 100,
  MAX_STEER_ANGLE: 0.5,
  // Suspension
  SUSPENSION_STIFFNESS: 30,
  SUSPENSION_DAMPING: 4.4,
  SUSPENSION_COMPRESSION: 2.3,
  SUSPENSION_REST_LENGTH: 0.3,
  ROLL_INFLUENCE: 0.01,
  // Wheels
  WHEEL_RADIUS: 0.35,
  WHEEL_WIDTH: 0.3,
  FRICTION_SLIP: 2,
} as const;

export const NITRO = {
  MAX: 100,
  DRAIN_PER_SEC: 30,          // 30% per second when active
  REFILL_PER_SEC_DRIFT: 15,   // +15% per second while drifting
  FORCE_MULTIPLIER: 2.5,      // Engine force x2.5 when nitro active
  MIN_TO_ACTIVATE: 20,        // Need at least 20% to activate
} as const;

export const DRIFT = {
  MIN_STEER: 0.4,             // Minimum steer angle to count as drift
  MIN_SPEED: 30,              // Minimum speed (km/h) to drift
  POINTS_PER_SEC: 100,        // Base points per second of drift
  MULTIPLIER_INTERVAL: 1.5,   // Seconds between multiplier increases
  MAX_MULTIPLIER: 8,
} as const;

export const CHECKPOINT = {
  TRIGGER_DISTANCE: 15,       // Distance to trigger checkpoint (meters)
} as const;

export const CAMERA = {
  OFFSET_BEHIND: 8,
  OFFSET_ABOVE: 3,
  LOOK_AHEAD: 5,
  DAMPING: 0.05,
} as const;

export const NETWORK = {
  SERVER_URL: __DEV__ ? 'http://localhost:3001' : 'https://sonic-speeed.server.com',
  SEND_RATE_MS: 66, // ~15 FPS
  INTERPOLATION_BUFFER_MS: 100,
} as const;

export const TRACK = {
  WIDTH: 12,
  BARRIER_HEIGHT: 1.5,
  NUM_CHECKPOINTS: 8,
} as const;
