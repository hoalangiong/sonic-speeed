import React from 'react';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

interface OpponentCarProps {
  position: { x: number; y: number; z: number };
  quaternion: { x: number; y: number; z: number; w: number };
  color?: string;
}

/**
 * Renders a networked opponent car at interpolated position.
 * Smoothly lerps to target transform each frame.
 */
export function OpponentCar({ position, quaternion, color = '#ff3333' }: OpponentCarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3(position.x, position.y, position.z));
  const targetQuat = useRef(new THREE.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));

  // Update targets when props change
  targetPos.current.set(position.x, position.y, position.z);
  targetQuat.current.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);

  useFrame(() => {
    if (!groupRef.current) return;

    // Smooth interpolation
    groupRef.current.position.lerp(targetPos.current, 0.15);
    groupRef.current.quaternion.slerp(targetQuat.current, 0.15);
  });

  return (
    <group ref={groupRef}>
      {/* Same shape as player car but different color */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.8, 0.6, 4.2]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.7, -0.3]}>
        <boxGeometry args={[1.5, 0.4, 1.8]} />
        <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.05, 2.2]}>
        <boxGeometry args={[1.9, 0.15, 0.5]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      {/* Wheels */}
      {[[-0.85, 0, 1.4], [0.85, 0, 1.4], [-0.85, 0, -1.4], [0.85, 0, -1.4]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.35, 0.35, 0.3, 16]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
      ))}
    </group>
  );
}
