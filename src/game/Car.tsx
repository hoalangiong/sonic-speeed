import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber/native';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { createWorld, stepWorld, destroyWorld } from '../physics/world';
import { createVehicle, applyInput, getVehicleState, VehicleInput } from '../physics/vehicle';
import { createTrackColliders } from '../physics/track-collider';

interface CarProps {
  input: VehicleInput;
  onStateUpdate?: (state: { speed: number; position: any; steer: number; gas: number }) => void;
}

/**
 * Player car component.
 * Low-poly Lamborghini geometry + Cannon-ES physics.
 */
export function Car({ input, onStateUpdate }: CarProps) {
  const meshRef = useRef<THREE.Group>(null);
  const vehicleRef = useRef<CANNON.RaycastVehicle | null>(null);
  const wheelMeshes = useRef<THREE.Mesh[]>([]);

  // Initialize physics on mount
  useEffect(() => {
    const world = createWorld();
    createTrackColliders(world);
    vehicleRef.current = createVehicle(world);

    return () => {
      vehicleRef.current = null;
      destroyWorld();
    };
  }, []);

  // Game loop: step physics, sync visuals
  useFrame((_, delta) => {
    const vehicle = vehicleRef.current;
    if (!vehicle || !meshRef.current) return;

    // Apply player input to vehicle
    applyInput(vehicle, input);

    // Step physics
    stepWorld(delta);

    // Sync chassis mesh to physics body
    const { position, quaternion, speed } = getVehicleState(vehicle);
    meshRef.current.position.set(position.x, position.y, position.z);
    meshRef.current.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);

    // Share state for camera and HUD
    (global as any).__SONIC_CAR_STATE__ = { position, quaternion, speed };

    // Notify parent for HUD + particles + audio
    if (onStateUpdate) {
      onStateUpdate({ speed, position, steer: input.steer, gas: input.gas });
    }

    // Sync wheel meshes
    for (let i = 0; i < 4; i++) {
      const wheelInfo = vehicle.wheelInfos[i];
      const wheelMesh = wheelMeshes.current[i];
      if (wheelMesh && wheelInfo) {
        vehicle.updateWheelTransform(i);
        const t = wheelInfo.worldTransform;
        wheelMesh.position.set(t.position.x, t.position.y, t.position.z);
        wheelMesh.quaternion.set(t.quaternion.x, t.quaternion.y, t.quaternion.z, t.quaternion.w);
      }
    }
  });

  return (
    <group>
      {/* Chassis — Low-poly Lamborghini */}
      <group ref={meshRef}>
        <LamborghiniBody />
      </group>

      {/* Wheels (independent meshes synced to physics) */}
      {[0, 1, 2, 3].map((i) => (
        <group
          key={i}
          ref={(el: any) => { if (el) wheelMeshes.current[i] = el; }}
        >
          <WheelMesh />
        </group>
      ))}
    </group>
  );
}

/**
 * Low-poly Lamborghini Aventador-inspired body.
 * Wedge shape, angular fenders, aggressive stance.
 */
function LamborghiniBody() {
  return (
    <group>
      {/* === MAIN BODY === */}
      {/* Lower body — wide wedge shape */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1.95, 0.35, 4.4]} />
        <meshStandardMaterial color="#ffcc00" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Upper body — tapered toward front (wedge) */}
      <mesh position={[0, 0.4, 0.3]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[1.85, 0.25, 3.6]} />
        <meshStandardMaterial color="#ffcc00" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Front nose — angular slope down */}
      <mesh position={[0, 0.2, 2.0]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[1.7, 0.2, 1.2]} />
        <meshStandardMaterial color="#ffcc00" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* === CABIN / WINDSHIELD === */}
      {/* Windshield — angled glass */}
      <mesh position={[0, 0.6, 0.6]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[1.4, 0.02, 1.2]} />
        <meshStandardMaterial color="#111122" metalness={1} roughness={0} transparent opacity={0.85} />
      </mesh>

      {/* Roof — low and flat */}
      <mesh position={[0, 0.65, -0.2]}>
        <boxGeometry args={[1.35, 0.08, 1.0]} />
        <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Rear window */}
      <mesh position={[0, 0.55, -0.9]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[1.3, 0.02, 0.8]} />
        <meshStandardMaterial color="#111122" metalness={1} roughness={0} transparent opacity={0.8} />
      </mesh>

      {/* === SIDE DETAILS === */}
      {/* Side air intakes (left) */}
      <mesh position={[-0.98, 0.25, -0.5]}>
        <boxGeometry args={[0.05, 0.2, 0.8]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Side air intakes (right) */}
      <mesh position={[0.98, 0.25, -0.5]}>
        <boxGeometry args={[0.05, 0.2, 0.8]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* Side skirts (left) */}
      <mesh position={[-0.95, 0.05, 0]}>
        <boxGeometry args={[0.1, 0.12, 3.8]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      {/* Side skirts (right) */}
      <mesh position={[0.95, 0.05, 0]}>
        <boxGeometry args={[0.1, 0.12, 3.8]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* === FRONT === */}
      {/* Front splitter */}
      <mesh position={[0, -0.02, 2.3]}>
        <boxGeometry args={[2.0, 0.06, 0.3]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* Front grille */}
      <mesh position={[0, 0.15, 2.2]}>
        <boxGeometry args={[1.2, 0.15, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} />
      </mesh>

      {/* Headlights — angular LED strips */}
      <mesh position={[-0.7, 0.3, 2.15]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.35, 0.06, 0.08]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
      </mesh>
      <mesh position={[0.7, 0.3, 2.15]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.35, 0.06, 0.08]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
      </mesh>

      {/* DRL accent lights */}
      <mesh position={[-0.55, 0.22, 2.2]}>
        <boxGeometry args={[0.15, 0.03, 0.05]} />
        <meshStandardMaterial color="#ffdd00" emissive="#ffdd00" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.55, 0.22, 2.2]}>
        <boxGeometry args={[0.15, 0.03, 0.05]} />
        <meshStandardMaterial color="#ffdd00" emissive="#ffdd00" emissiveIntensity={0.5} />
      </mesh>

      {/* === REAR === */}
      {/* Rear diffuser */}
      <mesh position={[0, 0.05, -2.2]}>
        <boxGeometry args={[1.8, 0.15, 0.3]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Exhaust pipes */}
      <mesh position={[-0.4, 0.08, -2.3]}>
        <cylinderGeometry args={[0.06, 0.06, 0.15, 8]} />
        <meshStandardMaterial color="#444444" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0.4, 0.08, -2.3]}>
        <cylinderGeometry args={[0.06, 0.06, 0.15, 8]} />
        <meshStandardMaterial color="#444444" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Tail lights — Y-shaped Lamborghini signature */}
      <mesh position={[-0.6, 0.35, -2.18]}>
        <boxGeometry args={[0.4, 0.08, 0.05]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.6, 0.35, -2.18]}>
        <boxGeometry args={[0.4, 0.08, 0.05]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
      </mesh>

      {/* Center brake light */}
      <mesh position={[0, 0.45, -2.15]}>
        <boxGeometry args={[0.3, 0.04, 0.04]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff2200" emissiveIntensity={0.6} />
      </mesh>

      {/* === REAR WING === */}
      {/* Wing pillars */}
      <mesh position={[-0.6, 0.7, -1.9]}>
        <boxGeometry args={[0.06, 0.4, 0.06]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      <mesh position={[0.6, 0.7, -1.9]}>
        <boxGeometry args={[0.06, 0.4, 0.06]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      {/* Wing blade */}
      <mesh position={[0, 0.92, -1.9]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[1.8, 0.04, 0.35]} />
        <meshStandardMaterial color="#111111" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* === ENGINE COVER === */}
      {/* Rear engine vents (hexagonal pattern simulated) */}
      <mesh position={[0, 0.5, -1.3]}>
        <boxGeometry args={[1.0, 0.02, 0.6]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Glass engine cover */}
      <mesh position={[0, 0.48, -1.3]}>
        <boxGeometry args={[0.8, 0.01, 0.5]} />
        <meshStandardMaterial color="#223344" metalness={1} roughness={0} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

/** Detailed wheel with rim and tire */
function WheelMesh() {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* Tire */}
      <mesh>
        <cylinderGeometry args={[0.35, 0.35, 0.28, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Rim */}
      <mesh>
        <cylinderGeometry args={[0.22, 0.22, 0.29, 8]} />
        <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Hub cap */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 6]} />
        <meshStandardMaterial color="#ffcc00" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}
