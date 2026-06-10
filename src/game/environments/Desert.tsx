import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Desert Highway — endless sandy desert, cacti, red sunset sky.
 */
export function DesertEnvironment() {
  return (
    <group>
      <DesertSky />
      <DesertGround />
      <DesertScenery />
    </group>
  );
}

function DesertSky() {
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
        vec3 top = vec3(0.1, 0.3, 0.6);
        vec3 horizon = vec3(0.95, 0.5, 0.2);
        vec3 bottom = vec3(0.8, 0.6, 0.3);
        if (h > 0.0) {
          gl_FragColor = vec4(mix(horizon, top, pow(h, 0.5)), 1.0);
        } else {
          gl_FragColor = vec4(mix(horizon, bottom, pow(-h, 0.3)), 1.0);
        }
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
  }), []);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      {/* Hot sun */}
      <mesh position={[150, 60, -200]}>
        <sphereGeometry args={[20, 16, 16]} />
        <meshBasicMaterial color="#ffaa22" />
      </mesh>
    </group>
  );
}

function DesertGround() {
  return (
    <group>
      {/* Sand ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[600, 600, 32, 32]} />
        <meshStandardMaterial color="#d4a055" roughness={1} metalness={0} />
      </mesh>
      {/* Sand dunes — gentle hills */}
      {[0, 1, 2, 3, 4, 5].map(i => {
        const angle = (i / 6) * Math.PI * 2;
        const r = 120 + i * 20;
        return (
          <mesh key={i} position={[Math.cos(angle) * r, 2, Math.sin(angle) * r]} scale={[30, 5, 20]}>
            <sphereGeometry args={[1, 12, 8]} />
            <meshStandardMaterial color="#c89040" roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
}

function DesertScenery() {
  const cacti = useMemo(() => {
    const items: Array<{ pos: [number, number, number]; height: number }> = [];
    for (let i = 0; i < 25; i++) {
      const angle = (i / 25) * Math.PI * 2 + Math.random();
      const radius = 80 + Math.random() * 50;
      items.push({
        pos: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
        height: 2 + Math.random() * 4,
      });
    }
    return items;
  }, []);

  return (
    <group>
      {/* Cacti */}
      {cacti.map((c, i) => (
        <group key={i} position={c.pos}>
          {/* Main trunk */}
          <mesh position={[0, c.height / 2, 0]}>
            <cylinderGeometry args={[0.2, 0.3, c.height, 8]} />
            <meshStandardMaterial color="#2d5a1e" roughness={0.8} />
          </mesh>
          {/* Arms */}
          <mesh position={[0.4, c.height * 0.6, 0]} rotation={[0, 0, -0.5]}>
            <cylinderGeometry args={[0.12, 0.15, c.height * 0.4, 6]} />
            <meshStandardMaterial color="#2d5a1e" roughness={0.8} />
          </mesh>
          <mesh position={[-0.3, c.height * 0.4, 0]} rotation={[0, 0, 0.6]}>
            <cylinderGeometry args={[0.1, 0.12, c.height * 0.3, 6]} />
            <meshStandardMaterial color="#2d5a1e" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Distant mesas/buttes */}
      {[0, 1, 2].map(i => {
        const angle = (i / 3) * Math.PI * 2 + 0.5;
        return (
          <mesh key={`mesa-${i}`} position={[Math.cos(angle) * 250, 15, Math.sin(angle) * 250]}>
            <cylinderGeometry args={[15, 20, 30 + i * 10, 6]} />
            <meshStandardMaterial color="#8b4513" roughness={0.95} flatShading />
          </mesh>
        );
      })}

      {/* Tumbleweeds (small spheres) */}
      {Array.from({ length: 10 }, (_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const r = 60 + Math.random() * 40;
        return (
          <mesh key={`tw-${i}`} position={[Math.cos(angle) * r, 0.3, Math.sin(angle) * r]}>
            <sphereGeometry args={[0.4 + Math.random() * 0.3, 6, 6]} />
            <meshStandardMaterial color="#8b7355" roughness={1} wireframe />
          </mesh>
        );
      })}
    </group>
  );
}

/** Lighting for Desert */
export function DesertLighting() {
  return (
    <group>
      <ambientLight intensity={0.5} color="#ffd4a0" />
      <directionalLight position={[150, 80, -100]} intensity={2} color="#ffaa44" castShadow />
      <hemisphereLight args={['#87ceeb', '#d4a055', 0.4]} />
    </group>
  );
}
