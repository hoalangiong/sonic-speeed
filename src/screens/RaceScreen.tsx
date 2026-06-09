import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { Scene } from '../game/Scene';
import { TouchControls } from '../input/TouchControls';
import { HUD } from '../ui/HUD';
import { Countdown } from '../ui/Countdown';
import { VehicleInput } from '../physics/vehicle';
import { NetworkSync, PlayerState } from '../network/sync';
import { useGameAudio } from '../audio/useGameAudio';
import { GAME } from '../constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Race'>;

export function RaceScreen({ navigation, route }: Props) {
  const { mode } = route.params;
  const [input, setInput] = useState<VehicleInput>({ steer: 0, gas: 0, brake: 0 });
  const [speed, setSpeed] = useState(0);
  const [racePosition, setRacePosition] = useState(1);
  const [lap, setLap] = useState(1);
  const [showCountdown, setShowCountdown] = useState(true);
  const [raceActive, setRaceActive] = useState(false);
  const [opponents, setOpponents] = useState<Map<string, PlayerState>>(new Map());
  const syncRef = useRef<NetworkSync | null>(null);
  const lastPitchUpdate = useRef(0);

  // Audio: engine + ambient sounds
  const { updateEnginePitch } = useGameAudio(raceActive);

  // Setup multiplayer sync
  useEffect(() => {
    if (mode !== 'multiplayer') return;

    const sync = new NetworkSync({
      onPlayersUpdate: (players) => setOpponents(new Map(players)),
      onRaceStart: () => {
        setShowCountdown(false);
        setRaceActive(true);
      },
      onRaceEnd: (results) => {
        setRaceActive(false);
        navigation.replace('Results', { results });
      },
      onCountdown: () => {},
    });
    sync.startSending();
    syncRef.current = sync;

    return () => sync.stop();
  }, [mode]);

  const handleInputChange = useCallback((newInput: VehicleInput) => {
    if (!raceActive && !showCountdown) return;
    setInput(newInput);
  }, [raceActive, showCountdown]);

  const handleStateUpdate = useCallback((state: { speed: number; position: any; steer: number; gas: number }) => {
    setSpeed(state.speed);

    // Update engine pitch ~10 times per second (not every frame)
    const now = Date.now();
    if (now - lastPitchUpdate.current > 100) {
      lastPitchUpdate.current = now;
      updateEnginePitch(state.speed);
    }

    // Update network sync with local state
    if (syncRef.current) {
      syncRef.current.updateLocal({
        position: state.position,
        speed: state.speed,
      });
    }
  }, [updateEnginePitch]);

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    setRaceActive(true);
  }, []);

  return (
    <View style={styles.container}>
      {/* 3D Game Scene */}
      <Scene input={input} onStateUpdate={handleStateUpdate} />

      {/* Touch Controls (below scene) */}
      <TouchControls onInputChange={handleInputChange} />

      {/* HUD Overlay */}
      <HUD
        speed={speed}
        position={racePosition}
        lap={lap}
        totalLaps={GAME.LAPS}
      />

      {/* Countdown overlay */}
      {showCountdown && (
        <Countdown onComplete={handleCountdownComplete} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
