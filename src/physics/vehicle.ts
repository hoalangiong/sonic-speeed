import * as CANNON from 'cannon-es';
import { PHYSICS, NITRO } from '../constants';

export interface VehicleState {
  position: { x: number; y: number; z: number };
  quaternion: { x: number; y: number; z: number; w: number };
  velocity: { x: number; y: number; z: number };
  speed: number; // km/h
}

export interface VehicleInput {
  steer: number;    // -1 (left) to 1 (right)
  gas: number;      // 0 to 1
  brake: number;    // 0 to 1
  nitro?: boolean;  // nitro boost active
}

export function createVehicle(world: CANNON.World): CANNON.RaycastVehicle {
  // Chassis body — roughly Lamborghini proportions
  const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2.2));
  const chassisBody = new CANNON.Body({ mass: PHYSICS.CHASSIS_MASS });
  chassisBody.addShape(chassisShape);
  chassisBody.position.set(0, 1.5, 0);

  // Create vehicle
  const vehicle = new CANNON.RaycastVehicle({
    chassisBody,
    indexRightAxis: 0,
    indexUpAxis: 1,
    indexForwardAxis: 2,
  });

  // Wheel options
  const wheelOptions = {
    radius: PHYSICS.WHEEL_RADIUS,
    directionLocal: new CANNON.Vec3(0, -1, 0),
    suspensionStiffness: PHYSICS.SUSPENSION_STIFFNESS,
    suspensionRestLength: PHYSICS.SUSPENSION_REST_LENGTH,
    frictionSlip: PHYSICS.FRICTION_SLIP,
    dampingRelaxation: PHYSICS.SUSPENSION_DAMPING,
    dampingCompression: PHYSICS.SUSPENSION_COMPRESSION,
    maxSuspensionForce: 100000,
    rollInfluence: PHYSICS.ROLL_INFLUENCE,
    axleLocal: new CANNON.Vec3(-1, 0, 0),
    chassisConnectionPointLocal: new CANNON.Vec3(0, 0, 0),
    maxSuspensionTravel: 0.3,
    customSlidingRotationalSpeed: -30,
    useCustomSlidingRotationalSpeed: true,
  };

  // Front left
  wheelOptions.chassisConnectionPointLocal.set(-0.85, 0, 1.4);
  vehicle.addWheel(wheelOptions);

  // Front right
  wheelOptions.chassisConnectionPointLocal.set(0.85, 0, 1.4);
  vehicle.addWheel(wheelOptions);

  // Rear left
  wheelOptions.chassisConnectionPointLocal.set(-0.85, 0, -1.4);
  vehicle.addWheel(wheelOptions);

  // Rear right
  wheelOptions.chassisConnectionPointLocal.set(0.85, 0, -1.4);
  vehicle.addWheel(wheelOptions);

  vehicle.addToWorld(world);

  return vehicle;
}

export function applyInput(vehicle: CANNON.RaycastVehicle, input: VehicleInput) {
  const forceMultiplier = input.nitro ? NITRO.FORCE_MULTIPLIER : 1;
  const steerAngle = input.steer * PHYSICS.MAX_STEER_ANGLE;

  // Determine if reversing: brake pressed and car is slow/stopped
  const vel = vehicle.chassisBody.velocity;
  const speed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
  const isReversing = input.brake > 0 && speed < 3;

  let engineForce = 0;
  let brakeForce = 0;

  if (input.gas > 0) {
    // Forward — negative force because Cannon-ES RaycastVehicle forward is -Z
    engineForce = -input.gas * PHYSICS.MAX_ENGINE_FORCE * forceMultiplier;
    brakeForce = 0;
  } else if (input.brake > 0) {
    if (isReversing) {
      // Reverse
      engineForce = input.brake * PHYSICS.MAX_ENGINE_FORCE * 0.4;
      brakeForce = 0;
    } else {
      // Braking while moving forward
      engineForce = 0;
      brakeForce = input.brake * PHYSICS.MAX_BRAKE_FORCE;
    }
  }

  // Apply engine force to ALL wheels (AWD for better traction)
  vehicle.applyEngineForce(engineForce, 0);
  vehicle.applyEngineForce(engineForce, 1);
  vehicle.applyEngineForce(engineForce, 2);
  vehicle.applyEngineForce(engineForce, 3);

  // Apply steering to front wheels
  vehicle.setSteeringValue(steerAngle, 0);
  vehicle.setSteeringValue(steerAngle, 1);

  // Apply brakes to all wheels
  vehicle.setBrake(brakeForce, 0);
  vehicle.setBrake(brakeForce, 1);
  vehicle.setBrake(brakeForce, 2);
  vehicle.setBrake(brakeForce, 3);
}

export function getVehicleState(vehicle: CANNON.RaycastVehicle): VehicleState {
  const body = vehicle.chassisBody;
  const vel = body.velocity;
  const speedMs = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);

  return {
    position: { x: body.position.x, y: body.position.y, z: body.position.z },
    quaternion: { x: body.quaternion.x, y: body.quaternion.y, z: body.quaternion.z, w: body.quaternion.w },
    velocity: { x: vel.x, y: vel.y, z: vel.z },
    speed: speedMs * 3.6, // m/s → km/h
  };
}
