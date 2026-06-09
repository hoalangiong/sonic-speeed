import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

const DUST_COUNT = 60;
const SPARK_COUNT = 30;
const PARTICLE_SIZE = 0.15;

interface ParticlesProps {
  speed: number;
  gas: number;
  steer: number;
}

/**
 * Particle effects system.
 * - Dust: emitted from rear wheels when driving
 * - Sparks: emitted when drifting (high steer + speed)
 */
export function Particles({ speed, gas, steer }: ParticlesProps) {
  return (
    <group>
      <DustParticles speed={speed} gas={gas} />
      <SparkParticles speed={speed} steer={steer} />
    </group>
  );
}

/** Dust trail behind car when accelerating */
function DustParticles({ speed, gas }: { speed: number; gas: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const particlesData = useRef<Array<{
    life: number;
    maxLife: number;
    velocity: THREE.Vector3;
  }>>([]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(DUST_COUNT * 3);
    const colors = new Float32Array(DUST_COUNT * 3);
    const sizes = new Float32Array(DUST_COUNT);

    // Initialize all particles off-screen
    for (let i = 0; i < DUST_COUNT; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -100; // hidden below
      positions[i * 3 + 2] = 0;
      colors[i * 3] = 0.83; // sandy brown R
      colors[i * 3 + 1] = 0.65; // G
      colors[i * 3 + 2] = 0.45; // B
      sizes[i] = PARTICLE_SIZE;

      particlesData.current.push({
        life: 0,
        maxLife: 0,
        velocity: new THREE.Vector3(),
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, []);

  const nextParticle = useRef(0);

  useFrame(() => {
    if (!pointsRef.current) return;

    const carState = (global as any).__SONIC_CAR_STATE__;
    if (!carState) return;

    const positions = geometry.attributes.position as THREE.BufferAttribute;
    const sizes = geometry.attributes.size as THREE.BufferAttribute;

    // Emit new particles when driving
    const shouldEmit = gas > 0.1 && speed > 5;
    if (shouldEmit) {
      const emitCount = Math.min(3, Math.ceil(speed / 50));
      for (let e = 0; e < emitCount; e++) {
        const idx = nextParticle.current % DUST_COUNT;
        nextParticle.current++;

        const p = particlesData.current[idx];
        p.life = 1;
        p.maxLife = 0.8 + Math.random() * 0.5;

        // Spawn at rear wheel positions
        const side = Math.random() > 0.5 ? 0.85 : -0.85;
        positions.setXYZ(
          idx,
          carState.position.x + side + (Math.random() - 0.5) * 0.3,
          carState.position.y + 0.1,
          carState.position.z - 2.2 + (Math.random() - 0.5) * 0.3,
        );

        // Random upward + backward velocity
        p.velocity.set(
          (Math.random() - 0.5) * 2,
          1 + Math.random() * 2,
          -1 - Math.random() * 2,
        );
      }
    }

    // Update all particles
    for (let i = 0; i < DUST_COUNT; i++) {
      const p = particlesData.current[i];
      if (p.life <= 0) continue;

      p.life -= 0.016 / p.maxLife; // Fade over lifetime

      if (p.life <= 0) {
        positions.setY(i, -100); // Hide
        sizes.setX(i, 0);
        continue;
      }

      // Move particle
      const x = positions.getX(i) + p.velocity.x * 0.016;
      const y = positions.getY(i) + p.velocity.y * 0.016;
      const z = positions.getZ(i) + p.velocity.z * 0.016;
      positions.setXYZ(i, x, y, z);

      // Slow down
      p.velocity.y -= 2 * 0.016; // gravity
      p.velocity.multiplyScalar(0.98);

      // Fade size
      sizes.setX(i, PARTICLE_SIZE * p.life);
    }

    positions.needsUpdate = true;
    sizes.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        vertexColors
        size={PARTICLE_SIZE}
        sizeAttenuation
        transparent
        opacity={0.6}
        depthWrite={false}
      />
    </points>
  );
}

/** Sparks when drifting (high steer angle + speed) */
function SparkParticles({ speed, steer }: { speed: number; steer: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const particlesData = useRef<Array<{
    life: number;
    maxLife: number;
    velocity: THREE.Vector3;
  }>>([]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(SPARK_COUNT * 3);
    const colors = new Float32Array(SPARK_COUNT * 3);
    const sizes = new Float32Array(SPARK_COUNT);

    for (let i = 0; i < SPARK_COUNT; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -100;
      positions[i * 3 + 2] = 0;
      // Orange/yellow sparks
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.6 + Math.random() * 0.4;
      colors[i * 3 + 2] = 0.0;
      sizes[i] = 0.08;

      particlesData.current.push({
        life: 0,
        maxLife: 0,
        velocity: new THREE.Vector3(),
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, []);

  const nextParticle = useRef(0);

  useFrame(() => {
    if (!pointsRef.current) return;

    const carState = (global as any).__SONIC_CAR_STATE__;
    if (!carState) return;

    const positions = geometry.attributes.position as THREE.BufferAttribute;
    const sizes = geometry.attributes.size as THREE.BufferAttribute;

    // Only emit when drifting: high steer + speed
    const isDrifting = Math.abs(steer) > 0.5 && speed > 40;
    if (isDrifting) {
      const emitCount = Math.ceil(Math.abs(steer) * 3);
      for (let e = 0; e < emitCount; e++) {
        const idx = nextParticle.current % SPARK_COUNT;
        nextParticle.current++;

        const p = particlesData.current[idx];
        p.life = 1;
        p.maxLife = 0.3 + Math.random() * 0.3;

        // Spawn near rear wheels on the outside of the turn
        const side = steer > 0 ? -0.9 : 0.9;
        positions.setXYZ(
          idx,
          carState.position.x + side,
          carState.position.y + 0.05,
          carState.position.z - 1.8,
        );

        // Fast scatter
        p.velocity.set(
          (Math.random() - 0.5) * 6,
          Math.random() * 3,
          (Math.random() - 0.5) * 6,
        );
      }
    }

    // Update
    for (let i = 0; i < SPARK_COUNT; i++) {
      const p = particlesData.current[i];
      if (p.life <= 0) continue;

      p.life -= 0.016 / p.maxLife;

      if (p.life <= 0) {
        positions.setY(i, -100);
        sizes.setX(i, 0);
        continue;
      }

      const x = positions.getX(i) + p.velocity.x * 0.016;
      const y = positions.getY(i) + p.velocity.y * 0.016;
      const z = positions.getZ(i) + p.velocity.z * 0.016;
      positions.setXYZ(i, x, y, z);

      p.velocity.y -= 9.8 * 0.016; // gravity pulls sparks down fast
      p.velocity.multiplyScalar(0.95);

      sizes.setX(i, 0.08 * p.life);
    }

    positions.needsUpdate = true;
    sizes.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        vertexColors
        size={0.08}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </points>
  );
}
