import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { Car } from './Car';
import { Track } from './Track';
import { Ocean } from './Ocean';
import { Sky, Sun } from './Sky';
import { ChaseCamera } from './ChaseCamera';
import { Particles } from './Particles';
import { SpeedLines } from './SpeedLines';
import { AIOpponent, getAITrackPoints } from './AIOpponent';
import { VehicleInput } from '../physics/vehicle';
import { MapId } from '../screens/MapSelectScreen';
import { TokyoNightEnvironment, TokyoLighting } from './environments/TokyoNight';
import { DesertEnvironment, DesertLighting } from './environments/Desert';
import { SnowEnvironment, SnowLighting } from './environments/Snow';

interface SceneProps {
  input: VehicleInput;
  map?: MapId;
  nitroActive?: boolean;
  onStateUpdate?: (state: { speed: number; position: any; steer: number; gas: number }) => void;
}

export function Scene({ input, map = 'coastal', nitroActive = false, onStateUpdate }: SceneProps) {
  const [particleState, setParticleState] = useState({ speed: 0, gas: 0, steer: 0 });

  const trackPoints = useMemo(() => getAITrackPoints(), []);

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

        {/* Track */}
        <Track />

        {/* Player car */}
        <Car input={input} onStateUpdate={handleStateUpdate} />

        {/* AI Opponents — 3 bots */}
        <AIOpponent index={0} trackPoints={trackPoints} speedFactor={0.85} />
        <AIOpponent index={1} trackPoints={trackPoints} speedFactor={0.95} />
        <AIOpponent index={2} trackPoints={trackPoints} speedFactor={1.05} />

        {/* Particle effects */}
        <Particles
          speed={particleState.speed}
          gas={particleState.gas}
          steer={particleState.steer}
        />

        {/* Speed lines at high velocity */}
        <SpeedLines speed={particleState.speed} nitroActive={nitroActive} />

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
          <ambientLight intensity={0.6} color="#ffffff" />
          <directionalLight position={[100, 80, 50]} intensity={2} color="#fffde8" castShadow />
          <directionalLight position={[-30, 40, -50]} intensity={0.6} color="#88ccff" />
          <hemisphereLight args={['#88ccee', '#8fbc8f', 0.5]} />
          <Sky />
          <Sun />
          <Ocean />
          <fog attach="fog" args={['#aaccdd', 200, 600]} />
        </>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
