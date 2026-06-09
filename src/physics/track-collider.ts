import * as CANNON from 'cannon-es';
import { TRACK } from '../constants';

/**
 * Creates physics collision bodies for the track.
 * Uses a flat ground plane + barriers for the MVP.
 * Later: use heightfield or trimesh for curved terrain.
 */
export function createTrackColliders(world: CANNON.World) {
  const groundMaterial = new CANNON.Material('ground');

  // Ground plane
  const groundBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: new CANNON.Plane(),
    material: groundMaterial,
  });
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(groundBody);

  return { groundBody };
}

/**
 * Creates invisible checkpoint triggers along the track.
 * Returns array of checkpoint positions for race progress tracking.
 */
export function createCheckpoints(trackPoints: Array<{ x: number; z: number }>): Array<{ x: number; z: number; index: number }> {
  const totalPoints = trackPoints.length;
  const step = Math.floor(totalPoints / TRACK.NUM_CHECKPOINTS);

  return Array.from({ length: TRACK.NUM_CHECKPOINTS }, (_, i) => {
    const point = trackPoints[i * step];
    return { x: point.x, z: point.z, index: i };
  });
}
