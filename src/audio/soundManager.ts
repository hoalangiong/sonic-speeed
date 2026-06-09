import { Audio } from 'expo-av';

let engineSound: Audio.Sound | null = null;
let ambientSound: Audio.Sound | null = null;

/**
 * Simple sound manager for game audio.
 * Plays engine loop (pitch varies with speed) and ambient ocean.
 */
export async function loadSounds() {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
  } catch (e) {
    // Audio not available in dev (e.g. web)
  }
}

export async function playEngine() {
  // Placeholder — will load actual engine sound asset
  // const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/engine.mp3'), { isLooping: true });
  // engineSound = sound;
  // await sound.playAsync();
}

export async function updateEnginePitch(speed: number) {
  if (!engineSound) return;
  // Map speed (0-300 km/h) to playback rate (0.5 - 2.0)
  const rate = 0.5 + (speed / 300) * 1.5;
  await engineSound.setRateAsync(Math.min(2, Math.max(0.5, rate)), true);
}

export async function stopEngine() {
  if (engineSound) {
    await engineSound.stopAsync();
    await engineSound.unloadAsync();
    engineSound = null;
  }
}

export async function playAmbient() {
  // Placeholder — will load ocean ambient sound
  // const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/ocean.mp3'), { isLooping: true, volume: 0.3 });
  // ambientSound = sound;
  // await sound.playAsync();
}

export async function stopAll() {
  await stopEngine();
  if (ambientSound) {
    await ambientSound.stopAsync();
    await ambientSound.unloadAsync();
    ambientSound = null;
  }
}
