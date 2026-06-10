import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

interface SpeedLinesProps {
  speed: number;
  nitroActive: boolean;
}

const LINE_COUNT = 40;

/**
 * Speed lines — streaks that fly past camera when going fast.
 * More intense during nitro boost.
 */
export function SpeedLines({ speed, nitroActive }: SpeedLinesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(LINE_COUNT * 3);
    const colors = new Float32Array(LINE_COUNT * 3);

    for (let i = 0; i < LINE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;     // X spread
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4; // Y spread
      positions[i * 3 + 2] = -Math.random() * 30;       // Z behind camera
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 1;
      colors[i * 3 + 2] = 1;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;

    // Only show lines above 150 km/h (or always during nitro)
    const threshold = nitroActive ? 50 : 150;
    const visible = speed > threshold;
    pointsRef.current.visible = visible;
    if (!visible) return;

    // Attach lines to camera-relative position
    const carState = (global as any).__SONIC_CAR_STATE__;
    if (!carState) return;

    pointsRef.current.position.set(
      carState.position.x,
      carState.position.y + 1.5,
      carState.position.z
    );

    // Animate lines flying backward
    const positions = geometry.attributes.position as THREE.BufferAttribute;
    const colors = geometry.attributes.color as THREE.BufferAttribute;
    const intensity = Math.min(1, (speed - threshold) / 150);

    for (let i = 0; i < LINE_COUNT; i++) {
      let z = positions.getZ(i) - 0.5 * (1 + intensity);

      // Reset line when it passes behind
      if (z < -30) {
        z = Math.random() * 5;
        positions.setX(i, (Math.random() - 0.5) * (6 + intensity * 4));
        positions.setY(i, (Math.random() - 0.5) * (3 + intensity * 2));
      }
      positions.setZ(i, z);

      // Color: white normally, cyan during nitro
      if (nitroActive) {
        colors.setXYZ(i, 0.3, 0.8 + Math.random() * 0.2, 1);
      } else {
        const alpha = 0.5 + intensity * 0.5;
        colors.setXYZ(i, alpha, alpha, alpha);
      }
    }

    positions.needsUpdate = true;
    colors.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        vertexColors
        size={nitroActive ? 0.15 : 0.08}
        sizeAttenuation
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </points>
  );
}
