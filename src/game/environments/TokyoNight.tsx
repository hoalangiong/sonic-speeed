import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Tokyo Night City — neon-lit streets, buildings, night sky.
 */
export function TokyoNightEnvironment() {
  return (
    <group>
      <TokyoSky />
      <TokyoRoad />
      <TokyoBuildings />
      <TokyoNeonLights />
    </group>
  );
}

function TokyoSky() {
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
        vec3 nightTop = vec3(0.02, 0.02, 0.08);
        vec3 cityGlow = vec3(0.15, 0.05, 0.2);
        gl_FragColor = vec4(mix(cityGlow, nightTop, max(h, 0.0)), 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
  }), []);

  return <mesh geometry={geometry} material={material} />;
}

function TokyoRoad() {
  return (
    <group>
      {/* Dark asphalt ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  );
}

function TokyoBuildings() {
  const buildings = useMemo(() => {
    const items: Array<{ pos: [number, number, number]; size: [number, number, number]; color: string }> = [];

    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 2;
      const radius = 85 + Math.random() * 60;
      const height = 10 + Math.random() * 40;
      const width = 5 + Math.random() * 8;

      items.push({
        pos: [Math.cos(angle) * radius, height / 2, Math.sin(angle) * radius],
        size: [width, height, width],
        color: `hsl(${220 + Math.random() * 40}, 10%, ${8 + Math.random() * 12}%)`,
      });
    }
    return items;
  }, []);

  return (
    <group>
      {buildings.map((b, i) => (
        <group key={i}>
          {/* Building body */}
          <mesh position={b.pos}>
            <boxGeometry args={b.size} />
            <meshStandardMaterial color={b.color} roughness={0.4} metalness={0.3} />
          </mesh>
          {/* Window lights — random lit windows */}
          {Math.random() > 0.5 && (
            <mesh position={[b.pos[0], b.pos[1] + b.size[1] * 0.3, b.pos[2] + b.size[2] / 2 + 0.1]}>
              <planeGeometry args={[b.size[0] * 0.8, b.size[1] * 0.4]} />
              <meshStandardMaterial
                color="#ffdd88"
                emissive="#ffdd88"
                emissiveIntensity={0.3}
                transparent
                opacity={0.6}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

function TokyoNeonLights() {
  const neons = useMemo(() => {
    const colors = ['#ff0066', '#00ffff', '#ff6600', '#ff00ff', '#00ff66', '#ffff00'];
    const items: Array<{ pos: [number, number, number]; color: string }> = [];

    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const radius = 70 + Math.random() * 20;
      items.push({
        pos: [Math.cos(angle) * radius, 3 + Math.random() * 8, Math.sin(angle) * radius],
        color: colors[i % colors.length],
      });
    }
    return items;
  }, []);

  return (
    <group>
      {neons.map((n, i) => (
        <pointLight key={i} position={n.pos} color={n.color} intensity={2} distance={20} />
      ))}
    </group>
  );
}

/** Lighting for Tokyo Night — brighter so road is visible */
export function TokyoLighting() {
  return (
    <group>
      <ambientLight intensity={0.4} color="#4455aa" />
      <directionalLight position={[0, 50, 0]} intensity={0.5} color="#8888cc" />
      {/* Street lights along road — illuminate the road surface */}
      <pointLight position={[0, 12, 0]} intensity={1.5} color="#ffaa66" distance={80} />
      <pointLight position={[50, 12, 30]} intensity={1} color="#ffaa66" distance={60} />
      <pointLight position={[-50, 12, -30]} intensity={1} color="#ffaa66" distance={60} />
      <pointLight position={[80, 12, -50]} intensity={1} color="#ffaa66" distance={60} />
      <pointLight position={[-80, 12, 50]} intensity={1} color="#ffaa66" distance={60} />
      {/* Moon */}
      <directionalLight position={[100, 80, -50]} intensity={0.3} color="#aabbff" />
    </group>
  );
}
