import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { Scene } from '../game/Scene';
import { TouchControls } from '../input/TouchControls';
import { HUD } from '../ui/HUD';
import { Minimap } from '../ui/Minimap';
import { Countdown } from '../ui/Countdown';
import { VehicleInput } from '../physics/vehicle';
import { NetworkSync, PlayerState } from '../network/sync';
import { useGameAudio } from '../audio/useGameAudio';
import { GAME, NITRO, DRIFT, CHECKPOINT } from '../constants';
import { MapId } from './MapSelectScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'Race'>;

/** Checkpoint positions around the track (matching getTrackPoints in Track.tsx) */
const CHECKPOINTS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2;
  const rx = 70 + Math.sin(angle * 2) * 20;
  const rz = 55 + Math.cos(angle * 3) * 15;
  return { x: Math.cos(angle) * rx, z: Math.sin(angle) * rz };
});

export function RaceScreen({ navigation, route }: Props) {
  const { mode, map = 'coastal' } = route.params;
  const [input, setInput] = useState<VehicleInput>({ steer: 0, gas: 0, brake: 0 });
  const [speed, setSpeed] = useState(0);
  const [racePosition, setRacePosition] = useState(1);
  const [lap, setLap] = useState(1);
  const [showCountdown, setShowCountdown] = useState(true);
  const [raceActive, setRaceActive] = useState(false);
  const [opponents, setOpponents] = useState<Map<string, PlayerState>>(new Map());
  const syncRef = useRef<NetworkSync | null>(null);
  const lastPitchUpdate = useRef(0);

  // === NITRO STATE ===
  const [nitro, setNitro] = useState(50); // Start with 50%
  const [nitroActive, setNitroActive] = useState(false);
  const nitroRef = useRef(50);
  const nitroActiveRef = useRef(false);

  // === DRIFT STATE ===
  const [isDrifting, setIsDrifting] = useState(false);
  const [driftScore, setDriftScore] = useState(0);
  const [driftMultiplier, setDriftMultiplier] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const driftStartTime = useRef(0);
  const driftAccum = useRef(0);
  const lastDriftCheck = useRef(0);

  // === CHECKPOINT STATE ===
  const nextCheckpoint = useRef(0);
  const carPosition = useRef({ x: 0, z: 0 });

  // Audio
  const { updateEnginePitch } = useGameAudio(true); // Always active for free drive

  // Nitro + Drift tick (runs every 100ms)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const dt = 0.1; // 100ms

      // --- NITRO DRAIN ---
      if (nitroActiveRef.current) {
        nitroRef.current -= NITRO.DRAIN_PER_SEC * dt;
        if (nitroRef.current <= 0) {
          nitroRef.current = 0;
          nitroActiveRef.current = false;
          setNitroActive(false);
        }
        setNitro(nitroRef.current);
      }

      // --- DRIFT DETECTION ---
      const currentInput = inputRef.current;
      const currentSpeed = speedRef.current;
      const drifting = Math.abs(currentInput.steer) > DRIFT.MIN_STEER
        && currentSpeed > DRIFT.MIN_SPEED
        && currentInput.gas > 0;

      if (drifting) {
        if (!driftStartTime.current) {
          driftStartTime.current = now;
          driftAccum.current = 0;
        }

        // Accumulate drift score
        driftAccum.current += DRIFT.POINTS_PER_SEC * dt;

        // Increase multiplier every N seconds
        const driftDuration = (now - driftStartTime.current) / 1000;
        const newMultiplier = Math.min(
          DRIFT.MAX_MULTIPLIER,
          1 + Math.floor(driftDuration / DRIFT.MULTIPLIER_INTERVAL)
        );

        setIsDrifting(true);
        setDriftScore(driftAccum.current);
        setDriftMultiplier(newMultiplier);

        // Refill nitro while drifting
        nitroRef.current = Math.min(NITRO.MAX, nitroRef.current + NITRO.REFILL_PER_SEC_DRIFT * dt);
        setNitro(nitroRef.current);
      } else {
        if (driftStartTime.current) {
          // Cash in drift score
          const earned = driftAccum.current * driftMultiplier;
          setTotalScore(prev => prev + earned);
          driftStartTime.current = 0;
          driftAccum.current = 0;
        }
        setIsDrifting(false);
        setDriftScore(0);
        setDriftMultiplier(1);
      }

      // --- CHECKPOINT DETECTION ---
      const pos = carPosition.current;
      const cp = CHECKPOINTS[nextCheckpoint.current];
      if (cp) {
        const dx = pos.x - cp.x;
        const dz = pos.z - cp.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < CHECKPOINT.TRIGGER_DISTANCE) {
          nextCheckpoint.current++;
          if (nextCheckpoint.current >= CHECKPOINTS.length) {
            nextCheckpoint.current = 0;
            setLap(prev => prev + 1);
          }
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [driftMultiplier]);

  // Refs to avoid stale closures in interval
  const inputRef = useRef<VehicleInput>({ steer: 0, gas: 0, brake: 0 });
  const speedRef = useRef(0);

  // Multiplayer sync
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
    // Inject nitro state into input
    const withNitro = { ...newInput, nitro: nitroActiveRef.current };
    inputRef.current = withNitro;
    setInput(withNitro);
  }, []);

  const handleNitroPress = useCallback(() => {
    if (nitroRef.current >= NITRO.MIN_TO_ACTIVATE && !nitroActiveRef.current) {
      nitroActiveRef.current = true;
      setNitroActive(true);
    }
  }, []);

  const handleStateUpdate = useCallback((state: { speed: number; position: any; steer: number; gas: number }) => {
    setSpeed(state.speed);
    speedRef.current = state.speed;
    carPosition.current = { x: state.position.x, z: state.position.z };

    // Update engine pitch
    const now = Date.now();
    if (now - lastPitchUpdate.current > 100) {
      lastPitchUpdate.current = now;
      updateEnginePitch(state.speed);
    }

    // Network sync
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
      <Scene input={input} map={map} nitroActive={nitroActive} onStateUpdate={handleStateUpdate} />

      {/* Minimap */}
      <Minimap playerPosition={carPosition.current} aiCount={3} />

      {/* Touch Controls */}
      <TouchControls
        onInputChange={handleInputChange}
        onNitroPress={handleNitroPress}
        nitroAvailable={nitro >= NITRO.MIN_TO_ACTIVATE && !nitroActive}
      />

      {/* HUD Overlay */}
      <HUD
        speed={speed}
        position={racePosition}
        lap={lap}
        totalLaps={GAME.LAPS}
        nitro={nitro}
        nitroActive={nitroActive}
        driftScore={driftScore * driftMultiplier}
        driftMultiplier={driftMultiplier}
        isDrifting={isDrifting}
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
