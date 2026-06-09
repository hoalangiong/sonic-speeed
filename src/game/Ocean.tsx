import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

/**
 * Realistic ocean surface with layered wave animation.
 * Multiple wave frequencies + physical material for depth.
 */
export function Ocean() {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(800, 800, 100, 100);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;

    const positions = meshRef.current.geometry.attributes.position;
    const time = timeRef.current;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);

      // Layered waves for realistic ocean
      const wave1 = Math.sin(x * 0.02 + time * 0.8) * 0.6;
      const wave2 = Math.cos(z * 0.015 + time * 0.6) * 0.4;
      const wave3 = Math.sin((x + z) * 0.04 + time * 1.2) * 0.2;
      const wave4 = Math.cos(x * 0.08 + z * 0.06 + time * 2) * 0.08;

      positions.setY(i, wave1 + wave2 + wave3 + wave4);
    }
    positions.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, -2, 0]}>
      <meshPhysicalMaterial
        color="#005f80"
        metalness={0.15}
        roughness={0.15}
        transparent
        opacity={0.92}
        envMapIntensity={2}
        clearcoat={0.4}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}
