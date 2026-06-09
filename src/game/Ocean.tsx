import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

/**
 * Animated ocean surface with simple wave shader.
 * Uses a large plane with vertex displacement for wave effect.
 */
export function Ocean() {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1000, 1000, 64, 64);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;

    // Animate vertices for wave effect
    const positions = meshRef.current.geometry.attributes.position;
    const time = timeRef.current;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const y = Math.sin(x * 0.05 + time) * 0.3 +
                Math.cos(z * 0.03 + time * 0.7) * 0.2;
      positions.setY(i, y);
    }
    positions.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, -1, 0]}>
      <meshStandardMaterial
        color="#0077be"
        transparent
        opacity={0.8}
        metalness={0.1}
        roughness={0.3}
      />
    </mesh>
  );
}
