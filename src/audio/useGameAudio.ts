import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';

/**
 * V12 Engine Sound Synthesizer using Web Audio API.
 * Creates realistic Lamborghini-like engine sound with:
 * - Multiple harmonic oscillators (simulating cylinder firing)
 * - RPM-dependent pitch
 * - Rumble and growl characteristics
 *
 * Falls back to silent if Web Audio not available (some RN environments).
 */

interface EngineAudioContext {
  ctx: AudioContext;
  gainNode: GainNode;
  oscillators: OscillatorNode[];
  running: boolean;
}

export function useGameAudio(active: boolean) {
  const engineCtx = useRef<EngineAudioContext | null>(null);
  const currentRPM = useRef(800); // idle RPM

  useEffect(() => {
    if (active) {
      startEngine();
    }
    return () => {
      stopEngine();
    };
  }, [active]);

  function startEngine() {
    try {
      // @ts-ignore — Web Audio API available in Hermes/JSC on React Native
      const AudioCtx = globalThis.AudioContext || (globalThis as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.3;
      gainNode.connect(ctx.destination);

      // V12 engine harmonics — multiple oscillators at different frequencies
      // Simulates the complex harmonic content of a V12 engine
      const harmonics = [
        { type: 'sawtooth' as OscillatorType, freqMultiplier: 1, gain: 0.4 },     // Fundamental — main rumble
        { type: 'square' as OscillatorType, freqMultiplier: 2, gain: 0.2 },       // 2nd harmonic — growl
        { type: 'sawtooth' as OscillatorType, freqMultiplier: 3, gain: 0.15 },    // 3rd — edge
        { type: 'triangle' as OscillatorType, freqMultiplier: 0.5, gain: 0.25 },  // Sub-bass rumble
        { type: 'sawtooth' as OscillatorType, freqMultiplier: 6, gain: 0.08 },    // High frequency snarl
        { type: 'square' as OscillatorType, freqMultiplier: 4.5, gain: 0.06 },    // Exhaust crackle sim
      ];

      const oscillators: OscillatorNode[] = [];

      for (const h of harmonics) {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = h.type;
        osc.frequency.value = rpmToFreq(800) * h.freqMultiplier;
        oscGain.gain.value = h.gain;

        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start();

        oscillators.push(osc);
      }

      // Add noise for exhaust texture
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.02;
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 800;

      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.15;

      noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(gainNode);
      noiseNode.start();

      engineCtx.current = { ctx, gainNode, oscillators, running: true };
    } catch (e) {
      // Web Audio not available — silent mode
    }
  }

  function stopEngine() {
    if (!engineCtx.current) return;
    try {
      engineCtx.current.oscillators.forEach(osc => {
        try { osc.stop(); } catch (e) {}
      });
      engineCtx.current.ctx.close();
    } catch (e) {}
    engineCtx.current = null;
  }

  /** Convert RPM to base frequency (Hz). V12 fires 6 times per revolution. */
  function rpmToFreq(rpm: number): number {
    // V12: 6 power strokes per revolution
    // At 800 RPM idle → ~40 Hz base
    // At 8000 RPM redline → ~400 Hz
    return (rpm / 60) * 6;
  }

  /** Update engine sound based on vehicle speed */
  const updateEnginePitch = useCallback((speed: number) => {
    if (!engineCtx.current?.running) return;

    const { oscillators, gainNode, ctx } = engineCtx.current;

    // Map speed (0-300 km/h) → RPM (800-8500)
    const targetRPM = 800 + (Math.min(speed, 300) / 300) * 7700;

    // Smooth RPM transition
    currentRPM.current += (targetRPM - currentRPM.current) * 0.1;
    const rpm = currentRPM.current;

    const baseFreq = rpmToFreq(rpm);
    const time = ctx.currentTime;

    // Update oscillator frequencies
    const multipliers = [1, 2, 3, 0.5, 6, 4.5];
    for (let i = 0; i < oscillators.length; i++) {
      oscillators[i].frequency.setTargetAtTime(
        baseFreq * multipliers[i],
        time,
        0.05
      );
    }

    // Volume increases with RPM
    const volume = 0.2 + (rpm / 8500) * 0.5;
    gainNode.gain.setTargetAtTime(Math.min(0.7, volume), time, 0.05);
  }, []);

  return { updateEnginePitch };
}
