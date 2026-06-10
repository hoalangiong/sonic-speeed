import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

/**
 * Snow Mountain Alps — white peaks, icy road, snowfall.
 */
export function SnowEnvironment() {
  return (
    <group>
      <SnowSky />
      <SnowGround />
      <SnowMountains />
      <SnowTrees />
      <Snowfall />
    </group>
  );
}

function SnowSky() {
  const geometry = useMemo(() => new THREE.SphereGeometry(400, 32, 32), []);
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition).y;
        vec3 top = vec3(0.4, 0.5, 0.7);
        vec3 horizon = vec3(0.85, 0.88, 0.92);
        vec3 bottom = vec3(0.9, 0.92, 0.95);
        if (h > 0.0) {
          gl_FragColor = vec4(mix(horizon, top, pow(h, 0.4)), 1.0);
        } else {
          gl_FragColor = vec4(mix(horizon, bottom, pow(-h, 0.3)), 1.0);
        }
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
  }), []);

  return <mesh geometry={geometry} material={material} />;
}

function SnowGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <planeGeometry args={[600, 600, 32, 32]} />
      <meshStandardMaterial color="#e8eef5" roughness={0.6} metalness={0.05} />
    </mesh>
  );
}

function SnowMountains() {
  const peaks = useMemo(() => {
    const items: Array<{ pos: [number, number, number]; scale: [number, number, number]; snow: boolean }> = [];

    // Large snow-capped peaks
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 150 + Math.random() * 80;
      const height = 40 + Math.random() * 50;

      items.push({
        pos: [Math.cos(angle) * radius, height * 0.3, Math.sin(angle) * radius],
        scale: [30 + Math.random() * 20, height, 30 + Math.random() * 20],
        snow: true,
      });
    }

    // Closer rocky hills
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + 0.3;
      const radius = 90 + Math.random() * 30;
      const height = 15 + Math.random() * 20;

      items.push({
        pos: [Math.cos(angle) * radius, height * 0.3, Math.sin(angle) * radius],
        scale: [15 + Math.random() * 10, height, 12 + Math.random() * 8],
        snow: Math.random() > 0.3,
      });
    }

    return items;
  }, []);

  return (
    <group>
      {peaks.map((p, i) => (
        <group key={i}>
          {/* Mountain body */}
          <mesh position={p.pos} scale={p.scale}>
            <coneGeometry args={[0.5, 1, 6]} />
            <meshStandardMaterial
              color={p.snow ? '#8899aa' : '#667788'}
              roughness={0.8}
              flatShading
            />
          </mesh>
          {/* Snow cap */}
          {p.snow && (
            <mesh
              position={[p.pos[0], p.pos[1] + p.scale[1] * 0.35, p.pos[2]]}
              scale={[p.scale[0] * 0.4, p.scale[1] * 0.3, p.scale[2] * 0.4]}
            >
              <coneGeometry args={[0.5, 1, 6]} />
              <meshStandardMaterial color="#ffffff" roughness={0.3} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

function SnowTrees() {
  const trees = useMemo(() => {
    const items: Array<[number, number, number]> = [];
    for (let i = 0; i < 35; i++) {
      const angle = (i / 35) * Math.PI * 2 + Math.random() * 0.3;
      const radius = 75 + Math.random() * 30;
      items.push([Math.cos(angle) * radius, 0, Math.sin(angle) * radius]);
    }
    return items;
  }, []);

  return (
    <group>
      {trees.map((pos, i) => {
        const height = 4 + (i % 3) * 2;
        return (
          <group key={i} position={pos}>
            {/* Pine trunk */}
            <mesh position={[0, height * 0.3, 0]}>
              <cylinderGeometry args={[0.1, 0.15, height * 0.6, 6]} />
              <meshStandardMaterial color="#3d2b1f" roughness={0.9} />
            </mesh>
            {/* Pine layers (snow-covered) */}
            {[0, 1, 2].map(layer => (
              <mesh key={layer} position={[0, height * 0.4 + layer * height * 0.2, 0]}>
                <coneGeometry args={[1.5 - layer * 0.4, height * 0.25, 6]} />
                <meshStandardMaterial
                  color={layer === 0 ? '#f0f5f0' : '#2d4a2d'}
                  roughness={0.8}
                />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

/** Animated snowfall particles */
function Snowfall() {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = Math.random() * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const positions = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < positions.count; i++) {
      let y = positions.getY(i) - delta * 3; // Fall speed
      if (y < 0) y = 50; // Reset to top
      positions.setY(i, y);

      // Slight horizontal drift
      const x = positions.getX(i) + Math.sin(i + y * 0.1) * delta * 0.5;
      positions.setX(i, x);
    }
    positions.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial color="#ffffff" size={0.3} transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

/** Lighting for Snow */
export function SnowLighting() {
  return (
    <group>
      <ambientLight intensity={0.6} color="#ccddef" />
      <directionalLight position={[50, 80, 30]} intensity={1} color="#ffffff" castShadow />
      <hemisphereLight args={['#aabbcc', '#ddeeff', 0.3]} />
      <fog attach="fog" args={['#ccd8e8', 80, 350]} />
    </group>
  );
}
