import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { Car } from './Car';
import { Track } from './Track';
import { Ocean } from './Ocean';
import { ChaseCamera } from './ChaseCamera';
import { Particles } from './Particles';
import { VehicleInput } from '../physics/vehicle';

interface SceneProps {
  input: VehicleInput;
  onStateUpdate?: (state: { speed: number; position: any; steer: number; gas: number }) => void;
}

export function Scene({ input, onStateUpdate }: SceneProps) {
  const [particleState, setParticleState] = useState({ speed: 0, gas: 0, steer: 0 });

  const handleStateUpdate = (state: { speed: number; position: any; steer: number; gas: number }) => {
    setParticleState({ speed: state.speed, gas: state.gas, steer: state.steer });
    if (onStateUpdate) onStateUpdate(state);
  };

  return (
    <View style={styles.container}>
      <Canvas
        camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 5, 10] }}
        gl={{ antialias: false }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[50, 80, 30]}
          intensity={1.2}
          castShadow
        />
        <hemisphereLight
          args={['#87CEEB', '#f0e68c', 0.3]}
        />

        {/* Environment */}
        <Ocean />
        <Track />

        {/* Sky gradient via fog */}
        <fog attach="fog" args={['#87CEEB', 100, 500]} />

        {/* Player car */}
        <Car input={input} onStateUpdate={handleStateUpdate} />

        {/* Particle effects */}
        <Particles
          speed={particleState.speed}
          gas={particleState.gas}
          steer={particleState.steer}
        />

        {/* Chase camera */}
        <ChaseCamera />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
