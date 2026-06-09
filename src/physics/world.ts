import * as CANNON from 'cannon-es';
import { PHYSICS } from '../constants';

let world: CANNON.World | null = null;

export function createWorld(): CANNON.World {
  world = new CANNON.World();
  world.gravity.set(0, PHYSICS.GRAVITY, 0);
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.defaultContactMaterial.friction = 0.3;
  world.defaultContactMaterial.restitution = 0.1;

  // Ground material for road
  const groundMaterial = new CANNON.Material('ground');
  const wheelMaterial = new CANNON.Material('wheel');
  const wheelGroundContact = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
    friction: 0.5,
    restitution: 0,
    contactEquationStiffness: 1000,
  });
  world.addContactMaterial(wheelGroundContact);

  return world;
}

export function stepWorld(dt: number) {
  if (world) {
    world.step(PHYSICS.TIMESTEP, dt, PHYSICS.MAX_SUBSTEPS);
  }
}

export function getWorld(): CANNON.World | null {
  return world;
}

export function destroyWorld() {
  world = null;
}
