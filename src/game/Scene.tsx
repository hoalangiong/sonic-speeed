import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { Car } from './Car';
import { Track } from './Track';
import { Ocean } from './Ocean';
import { Sky, Sun } from './Sky';
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
        camera={{ fov: 70, near: 0.1, far: 1000, position: [0, 5, 10] }}
        gl={{ antialias: true }}
      >
        {/* Realistic Lighting Setup */}
        <ambientLight intensity={0.3} color="#b4d7ff" />

        {/* Main sun light — warm golden hour */}
        <directionalLight
          position={[200, 60, -100]}
          intensity={1.8}
          color="#ffd599"
          castShadow
        />

        {/* Fill light — cool blue from sky */}
        <directionalLight
          position={[-50, 40, 50]}
          intensity={0.4}
          color="#88bbff"
        />

        {/* Hemisphere: sky above, ground bounce below */}
        <hemisphereLight
          args={['#6fb4e0', '#c2956b', 0.4]}
        />

        {/* Rim light for car silhouette */}
        <pointLight
          position={[0, 10, -20]}
          intensity={0.5}
          color="#ffffff"
          distance={50}
        />

        {/* Sky dome */}
        <Sky />
        <Sun />

        {/* Environment */}
        <Ocean />
        <Track />

        {/* Atmospheric fog — distant objects fade into haze */}
        <fog attach="fog" args={['#d4a574', 150, 500]} />

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
