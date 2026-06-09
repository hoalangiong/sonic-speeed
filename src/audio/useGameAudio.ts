import { useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';

/**
 * Hook to manage game audio lifecycle.
 * Handles engine sound with pitch variation and ambient ocean sound.
 */
export function useGameAudio(active: boolean) {
  const engineRef = useRef<Audio.Sound | null>(null);
  const ambientRef = useRef<Audio.Sound | null>(null);
  const isSetup = useRef(false);

  // Setup audio mode on first use
  useEffect(() => {
    if (isSetup.current) return;
    isSetup.current = true;

    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    }).catch(() => {});
  }, []);

  // Start/stop sounds based on active state
  useEffect(() => {
    if (active) {
      startSounds();
    }
    return () => {
      stopSounds();
    };
  }, [active]);

  async function startSounds() {
    try {
      // Engine sound — synthetic oscillator-like loop
      // Using a short generated tone since we don't have real assets yet
      // In production: replace with actual engine_loop.mp3
      const { sound: engine } = await Audio.Sound.createAsync(
        // Placeholder: will use bundled asset when available
        { uri: 'https://freesound.org/data/previews/459/459659_6768862-lq.mp3' },
        { isLooping: true, volume: 0.7, rate: 0.6, shouldCorrectPitch: true }
      );
      engineRef.current = engine;
      await engine.playAsync();
    } catch (e) {
      // Engine sound failed to load — continue without it
      console.log('Engine sound unavailable:', e);
    }

    try {
      // Ambient ocean
      const { sound: ambient } = await Audio.Sound.createAsync(
        { uri: 'https://freesound.org/data/previews/467/467006_5356504-lq.mp3' },
        { isLooping: true, volume: 0.2 }
      );
      ambientRef.current = ambient;
      await ambient.playAsync();
    } catch (e) {
      console.log('Ambient sound unavailable:', e);
    }
  }

  async function stopSounds() {
    if (engineRef.current) {
      try {
        await engineRef.current.stopAsync();
        await engineRef.current.unloadAsync();
      } catch (e) {}
      engineRef.current = null;
    }
    if (ambientRef.current) {
      try {
        await ambientRef.current.stopAsync();
        await ambientRef.current.unloadAsync();
      } catch (e) {}
      ambientRef.current = null;
    }
  }

  /** Call each frame to update engine pitch based on speed */
  const updateEnginePitch = useCallback(async (speed: number) => {
    if (!engineRef.current) return;
    try {
      // Map speed (0–300 km/h) → rate (0.6–2.0)
      const rate = 0.6 + (Math.min(speed, 300) / 300) * 1.4;
      await engineRef.current.setRateAsync(rate, true);
    } catch (e) {
      // Rate update failed — non-critical
    }
  }, []);

  return { updateEnginePitch };
}
