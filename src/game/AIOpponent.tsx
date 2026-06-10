import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

const AI_COLORS = ['#ff3333', '#3366ff', '#ff9900'];

interface AIOpponentProps {
  index: number;
  trackPoints: THREE.Vector3[];
  speedFactor: number; // 0.7 - 1.1 (how fast relative to track)
}

/**
 * AI opponent that follows the track path at varying speeds.
 * Uses CatmullRom curve interpolation for smooth movement.
 */
export function AIOpponent({ index, trackPoints, speedFactor }: AIOpponentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(index * 0.25); // Stagger start positions
  const color = AI_COLORS[index % AI_COLORS.length];

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(trackPoints, true, 'catmullrom', 0.5);
  }, [trackPoints]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Advance along track
    const speed = 0.015 * speedFactor * (0.9 + Math.sin(progressRef.current * 10) * 0.1);
    progressRef.current = (progressRef.current + speed * delta * 60) % 1;

    // Get position and direction on curve
    const pos = curve.getPointAt(progressRef.current);
    const tangent = curve.getTangentAt(progressRef.current);

    // Position car on road surface
    groupRef.current.position.set(pos.x, pos.y + 0.5, pos.z);

    // Rotate car to face direction of travel
    const angle = Math.atan2(tangent.x, tangent.z);
    groupRef.current.rotation.set(0, angle, 0);

    // Slight tilt into turns
    const nextT = (progressRef.current + 0.01) % 1;
    const nextTangent = curve.getTangentAt(nextT);
    const turnRate = tangent.cross(nextTangent).y;
    groupRef.current.rotation.z = -turnRate * 2;

    // Share position for minimap
    (global as any)[`__AI_CAR_${index}__`] = {
      x: pos.x,
      z: pos.z,
      progress: progressRef.current,
    };
  });

  return (
    <group ref={groupRef}>
      {/* Simplified car body */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.8, 0.55, 4.2]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.65, -0.2]}>
        <boxGeometry args={[1.4, 0.35, 1.6]} />
        <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Front */}
      <mesh position={[0, 0.15, 2.0]} rotation={[-0.25, 0, 0]}>
        <boxGeometry args={[1.6, 0.2, 1.0]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Rear wing */}
      <mesh position={[0, 0.85, -1.9]}>
        <boxGeometry args={[1.6, 0.04, 0.3]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      {/* Tail lights */}
      <mesh position={[-0.5, 0.35, -2.1]}>
        <boxGeometry args={[0.3, 0.06, 0.05]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.5, 0.35, -2.1]}>
        <boxGeometry args={[0.3, 0.06, 0.05]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
      </mesh>
      {/* Wheels */}
      {[[-0.85, 0, 1.3], [0.85, 0, 1.3], [-0.85, 0, -1.3], [0.85, 0, -1.3]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.32, 0.32, 0.25, 12]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Get track points for AI path (same as track generation).
 */
export function getAITrackPoints(): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const numPoints = 24;

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const rx = 70 + Math.sin(angle * 2) * 20 + Math.cos(angle * 5) * 8;
    const rz = 55 + Math.cos(angle * 3) * 15 + Math.sin(angle * 4) * 5;
    const x = Math.cos(angle) * rx;
    const z = Math.sin(angle) * rz;
    const y = Math.sin(angle * 2) * 3 + Math.cos(angle * 3) * 1.5;
    points.push(new THREE.Vector3(x, y, z));
  }

  return points;
}
