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
import { MapId } from '../screens/MapSelectScreen';
import { TokyoNightEnvironment, TokyoLighting } from './environments/TokyoNight';
import { DesertEnvironment, DesertLighting } from './environments/Desert';
import { SnowEnvironment, SnowLighting } from './environments/Snow';

interface SceneProps {
  input: VehicleInput;
  map?: MapId;
  onStateUpdate?: (state: { speed: number; position: any; steer: number; gas: number }) => void;
}

export function Scene({ input, map = 'coastal', onStateUpdate }: SceneProps) {
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
        {/* Environment-specific lighting + scenery */}
        <EnvironmentRenderer map={map} />

        {/* Track (same road shape, different ground handled by environment) */}
        <Track />

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

/** Renders the correct environment based on selected map */
function EnvironmentRenderer({ map }: { map: MapId }) {
  switch (map) {
    case 'tokyo':
      return (
        <>
          <TokyoLighting />
          <TokyoNightEnvironment />
          <fog attach="fog" args={['#110022', 50, 300]} />
        </>
      );
    case 'desert':
      return (
        <>
          <DesertLighting />
          <DesertEnvironment />
          <fog attach="fog" args={['#e8b060', 150, 500]} />
        </>
      );
    case 'snow':
      return (
        <>
          <SnowLighting />
          <SnowEnvironment />
        </>
      );
    case 'coastal':
    default:
      return (
        <>
          {/* Coastal lighting */}
          <ambientLight intensity={0.3} color="#b4d7ff" />
          <directionalLight position={[200, 60, -100]} intensity={1.8} color="#ffd599" castShadow />
          <directionalLight position={[-50, 40, 50]} intensity={0.4} color="#88bbff" />
          <hemisphereLight args={['#6fb4e0', '#c2956b', 0.4]} />
          <pointLight position={[0, 10, -20]} intensity={0.5} color="#ffffff" distance={50} />
          {/* Coastal environment */}
          <Sky />
          <Sun />
          <Ocean />
          <fog attach="fog" args={['#d4a574', 150, 500]} />
        </>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
