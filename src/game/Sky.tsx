import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Realistic sky dome with gradient colors.
 * Simulates atmosphere with warm horizon and deep blue zenith.
 */
export function Sky() {
  const geometry = useMemo(() => {
    return new THREE.SphereGeometry(400, 32, 32);
  }, []);

  const material = useMemo(() => {
    // Vertex shader for sky gradient
    const vertexShader = `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      varying vec3 vWorldPosition;
      uniform vec3 topColor;
      uniform vec3 horizonColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;

      void main() {
        float h = normalize(vWorldPosition + offset).y;
        if (h > 0.0) {
          gl_FragColor = vec4(mix(horizonColor, topColor, pow(max(h, 0.0), exponent)), 1.0);
        } else {
          gl_FragColor = vec4(mix(horizonColor, bottomColor, pow(max(-h, 0.0), 0.5)), 1.0);
        }
      }
    `;

    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        topColor: { value: new THREE.Color('#1a3a5c') },     // Deep blue sky
        horizonColor: { value: new THREE.Color('#f7c59f') }, // Warm sunset horizon
        bottomColor: { value: new THREE.Color('#2d4a3e') },  // Dark ocean reflection below
        offset: { value: 20 },
        exponent: { value: 0.6 },
      },
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, []);

  return <mesh geometry={geometry} material={material} />;
}

/**
 * Sun disc — bright emissive sphere at sunset position.
 */
export function Sun() {
  return (
    <mesh position={[200, 40, -300]}>
      <sphereGeometry args={[15, 16, 16]} />
      <meshBasicMaterial color="#ffdd44" />
    </mesh>
  );
}
